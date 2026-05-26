// src/pages/artists.jsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

export default function Artists() {
  // --- ESTADOS GLOBAIS DA PÁGINA ---
  const [fullRawData, setFullRawData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Referência para o input de busca (Correção de Foco)
  const searchInputRef = useRef(null);
  
  // Ordenação Principal
  const [sortCol, setSortCol] = useState('scrobbles');
  const [sortAsc, setSortAsc] = useState(false);

  // Filtros rápidos e especiais
  const [currentFilter, setCurrentFilter] = useState({ type: null, value: null });
  const [filterRatingActive, setFilterRatingActive] = useState(false);
  const [filterZeroScoreActive, setFilterZeroScoreActive] = useState(false);
  const [filterHighlightActive, setFilterHighlightActive] = useState(false);

  // Detalhes do Artista (Overlay) e Ordenação Interna
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [detailTab, setDetailTab] = useState('songs');
  const [detailData, setDetailData] = useState({ songs: [], albums: [] });
  const [detailSortCol, setDetailSortCol] = useState('count'); // Coluna atual de ordenação do modal
  const [detailSortAsc, setDetailSortAsc] = useState(false);    // Direção da ordenação do modal

  // Modal de Rating
  const [ratingArtist, setRatingArtist] = useState(null);

  const limit = 50;

  const countryMap = {
    "[desconhecido]": "unknown", "afeganistão": "af", "áfrica do sul": "za", "alemanha": "de", 
    "andorra": "ad", "argélia": "dz", "argentina": "ar", "armênia": "am", "austrália": "au",
    "áustria": "at", "azerbaijão": "az", "bangladesh": "bd", "barbados": "bb", "bélgica": "be", 
    "bolívia": "bo", "bósnia e herzegovina": "ba", "brasil": "br", "bulgária": "bg", "canadá": "ca", 
    "chile": "cl", "china": "cn", "colômbia": "co", "coreia do sul": "kr", "costa rica": "cr", 
    "croácia": "hr", "cuba": "cu", "dinamarca": "dk", "egito": "eg", "emirados árabes unidos": "ae", 
    "equador": "ec", "escócia": "gb-sct", "eslováquia": "sk", "eslovênia": "si", "espanha": "es", 
    "estados unidos": "us", "estônia": "ee", "eua": "us", "finlândia": "fi", "frança": "fr", 
    "geórgia": "ge", "grécia": "gr", "guatemala": "gt", "hungria": "hu", "índia": "in", 
    "indonésia": "id", "inglaterra": "gb-eng", "irã": "ir", "irlanda": "ie", "islândia": "is", 
    "israel": "il", "itália": "it", "jamaica": "jm", "japão": "jp", "jordânia": "jo", "líbano": "lb",
    "luxemburgo": "lu", "malásia": "my", "malta": "mt", "marrocos": "ma", "méxico": "mx", 
    "mongólia": "mn", "montenegro": "me", "nigéria": "ng", "noruega": "no", "nova zelândia": "nz", 
    "país de gales": "gb-wls", "países baixos": "nl", "holanda": "nl", "panamá": "pa", 
    "paquistão": "pk", "paraguai": "py", "peru": "pe", "polônia": "pl", "portugal": "pt", 
    "quênia": "ke", "quirguistão": "kg", "reino unido": "gb", "república checa": "cz", 
    "romênia": "ro", "rússia": "ru", "sérvia": "rs", "síria": "sy", "sri lanka": "lk", 
    "suécia": "se", "suíça": "ch", "tailândia": "th", "taiwan": "tw", "tajiquistão": "tj", 
    "tunísia": "tn", "turquia": "tr", "ucrânia": "ua", "uruguai": "uy", "venezuela": "ve", 
    "vietnã": "vn", "zâmbia": "zm", "zimbábue": "zw"
  };

  const years = Array.from({ length: 13 }, (_, i) => 26 - i);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [resRanking, resFidelidade, resRecencia, resRecentRating, resTblArtists] = await Promise.all([
          supabase.rpc('get_artist_ranking_full', { search_term: '' }),
          supabase.from('artista_fidelidade_score_v2').select('artist, score_numérico, rating_artista'),
          supabase.from('artista_recencia_v2').select('artist, score, variation'),
          supabase.from('tbl_artists_recent').select('artist_name, rating'),
          supabase.from('tbl_artists').select('name, rating')
        ]);

        if (resRanking.error) throw resRanking.error;

        const fidMap = new Map((resFidelidade.data || []).map(x => [x.artist, x]));
        const recMap = new Map((resRecencia.data || []).map(x => [x.artist, x]));
        const recentMap = new Map((resRecentRating.data || []).map(x => [x.artist_name, x.rating]));
        const tblArtMap = new Map((resTblArtists.data || []).map(x => [x.name, x.rating]));

        let base = (resRanking.data || []).map(item => {
          const f = fidMap.get(item.artist);
          const r = recMap.get(item.artist);
          return {
            ...item,
            score_numérico: f ? f.score_numérico : 0.5,
            rating_artista: f ? f.rating_artista : 0,
            recencia_score: r ? r.score : 0,
            recencia_variation: r ? r.variation : 0,
            status_rating: recentMap.get(item.artist) || null,
            db_rating: tblArtMap.get(item.artist) || null
          };
        });

        base.sort((a, b) => (b.scrobbles - a.scrobbles) || a.artist.localeCompare(b.artist));
        base.forEach((item, idx) => item.global_pos = idx + 1);

        setFullRawData(base);
      } catch (err) {
        console.error("Erro geral na carga:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Efeito responsável por injetar o foco assim que a busca abre
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    let result = fullRawData.filter(item => {
      const nameMatch = (item.artist || "").toLowerCase().includes(searchTerm.toLowerCase());
      const countryMatch = !currentFilter.type || (currentFilter.type === 'country' && item.country === currentFilter.value);
      const cityMatch = !currentFilter.type || (currentFilter.type === 'city' && item.city === currentFilter.value);
      
      const ratingMatch = !filterRatingActive || (item.status_rating === -1);
      const zeroScoreMatch = !filterZeroScoreActive || (item.recencia_score === 0);
      const highlightMatch = !filterHighlightActive || (item.db_rating === 2 || item.db_rating === 3);

      return nameMatch && ratingMatch && zeroScoreMatch && highlightMatch && (currentFilter.type ? (countryMatch || cityMatch) : true);
    });

    result.sort((a, b) => {
      let valA = a[sortCol];
      let valB = b[sortCol];

      if (sortCol === 'artist') {
        const strA = String(valA || "");
        const strB = String(valB || "");
        return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
      }

      const numA = Number(valA) || 0;
      const numB = Number(valB) || 0;

      if (numA === numB) {
        return String(a.artist || "").localeCompare(String(b.artist || ""));
      }
      return sortAsc ? numA - numB : numB - numA;
    });

    setFilteredData(result);
  }, [fullRawData, searchTerm, currentFilter, sortCol, sortAsc, filterRatingActive, filterZeroScoreActive, filterHighlightActive]);

  const openArtistDetails = async (artistName) => {
    if (!artistName) return;
    setSelectedArtist(artistName);
    setDetailData({ songs: [], albums: [] });
    setDetailSortCol('count'); // Reseta para ordenar por total scrobbles desc
    setDetailSortAsc(false);
    
    try {
      const [resSongs, resAlbums] = await Promise.all([
        supabase.from('scrobbles_unificados').select('ranking_no_artista_unico, ranking_geral_unico, total_scrobbles, dias_ultima_execucao, track_name').eq('artist', artistName.toLowerCase()),
        supabase.from('scrobbles_test').select('album').eq('artist', artistName)
      ]);

      const formattedSongs = (resSongs.data || []).map(item => ({
        rank_artist: item.ranking_no_artista_unico,
        rank_global: item.ranking_geral_unico,
        count: item.total_scrobbles,
        days: item.dias_ultima_execucao ?? 999999, // Fallback alto para nulos jogarem pro fim em asc
        title: item.track_name || ''
      }));

      const aCnt = {};
      (resAlbums.data || []).forEach(r => {
        const a = r.album || '[Desconhecido]';
        aCnt[a] = (aCnt[a] || 0) + 1;
      });
      const formattedAlbums = Object.entries(aCnt).map(([title, count]) => ({ title, count }));

      setDetailData({ songs: formattedSongs, albums: formattedAlbums });
    } catch (e) {
      console.error(e);
    }
  };

  const checkAuthAndOpenRating = async (artistName) => {
    const access = sessionStorage.getItem('admin_access');
    if (!access) {
      const pass = prompt("Acesso restrito. Digite a senha:");
      if (pass !== "9000") return;
      sessionStorage.setItem('admin_access', 'true');
    }

    const { data } = await supabase
      .from('tbl_artists_recent')
      .select('id')
      .eq('artist_name', artistName)
      .maybeSingle();

    if (data) {
      alert("Este artista já possui um rating registrado.");
      return;
    }

    setRatingArtist(artistName);
  };

  const submitRating = async (ratingValue) => {
    if (!ratingArtist) return;
    const { error } = await supabase
      .from('tbl_artists_recent')
      .insert([{ artist_name: ratingArtist, rating: ratingValue }]);

    if (error) {
      alert("Erro ao inserir: " + error.message);
    } else {
      setFullRawData(prev => prev.map(item => 
        item.artist === ratingArtist ? { ...item, status_rating: ratingValue } : item
      ));
      setRatingArtist(null);
    }
  };

  const handleSort = (col) => {
    const targetCol = typeof col === 'number' ? `y${col}` : col;
  
    if (sortCol === targetCol) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(targetCol);
      if (targetCol === 'scrobbles' || typeof col === 'number') {
        setSortAsc(false); 
      } else {
        setSortAsc(true);  
      }
    }
    setOffset(0);
  };

  // Função para lidar com a ordenação das colunas internas do Modal
  const handleDetailSort = (col) => {
    if (detailSortCol === col) {
      setDetailSortAsc(!detailSortAsc);
    } else {
      setDetailSortCol(col);
      setDetailSortAsc(col === 'title' ? true : false); // Título padrão asc, numéricos desc
    }
  };

  // Função auxiliar para ordenar as listas internas do Modal
  const getSortedDetailData = () => {
    const list = detailTab === 'songs' ? [...detailData.songs] : [...detailData.albums];
    
    list.sort((a, b) => {
      let valA = a[detailSortCol];
      let valB = b[detailSortCol];

      if (detailSortCol === 'title') {
        return detailSortAsc 
          ? String(valA).localeCompare(String(valB)) 
          : String(valB).localeCompare(String(valA));
      }

      // Ordenação Numérica (count ou days)
      const numA = Number(valA) ?? 0;
      const numB = Number(valB) ?? 0;
      return detailSortAsc ? numA - numB : numB - numA;
    });

    return list;
  };

  const toggleQuickFilter = (type, value) => {
    if (!value || value === '-') return;
    setCurrentFilter(currentFilter.type === type && currentFilter.value === value ? { type: null, value: null } : { type, value });
    setOffset(0);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCurrentFilter({ type: null, value: null });
    setFilterRatingActive(false);
    setFilterZeroScoreActive(false);
    setFilterHighlightActive(false);
    setOffset(0);
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return '#6dbe99'; if (score >= 80) return '#86d03a';
    if (score >= 70) return '#b7d13e'; if (score >= 60) return '#e0d341';
    if (score >= 50) return '#ffcc33'; if (score >= 40) return '#ffaa33';
    if (score >= 30) return '#ff8833'; if (score >= 20) return '#ff5f33';
    if (score >= 10) return '#ff4433'; if (score >= 1) return '#e97b78';
    return '#aaaaaa';
  };

  const getNameColor = (rating) => {
    if (rating === 1) return "#e97b78";
    if (rating === 2) return "#f8c039";
    if (rating === 3) return "#6dbe99";
    return "#AAAAAA";
  };

  const generateFidelityBar = (rating) => {
    const finalScore = Math.min(Math.max(Math.round(rating), 0), 6);
    const colors = ['#e97b78', '#ff7d45', '#ffc845', '#e2ef4d', '#a3e04d', '#6dbe99'];
    const activeColor = finalScore >= 1 ? colors[finalScore - 1] : '#f2f2f2';
    
    return (
      <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(6, 2px)', gap: '1.5px', verticalAlign: 'middle', marginRight: '4px' }}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} style={{ height: '10px', borderRadius: '0.3px', backgroundColor: i < finalScore ? activeColor : '#f2f2f2' }}></div>
        ))}
      </div>
    );
  };

  const pagedData = filteredData.slice(offset, offset + limit);
  const totalPages = Math.ceil(filteredData.length / limit) || 1;

  if (loading) {
    return <div style={{ padding: '20px', color: '#666', fontSize: '24px', fontFamily: "'Bebas Neue', cursive" }}>Loading...</div>;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Bebas Neue', cursive" }}>
      
      <div 
        className="table-wrapper" 
        style={{ 
          flex: 1, 
          overflowY: 'auto',  
          overflowX: 'auto',  
          width: '100%',
          position: 'relative'
        }}
      >
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '12px', minWidth: '1200px' }}>
          <thead>
            <tr>
              <th onClick={() => handleSort('scrobbles')} style={thFixedStyle('fixed', 0, '20px')}>POS</th>
              <th onClick={() => handleSort('scrobbles')} style={thFixedStyle('fixed', '20px', '35px', 'right')}>TOTAL</th>
              <th onClick={() => handleSort('dias_ultimo')} style={thFixedStyle('fixed', '55px', '28px', 'center')}>DAYS</th>
              <th onClick={() => handleSort('global_pos')} style={thFixedStyle('fixed', '83px', '28px', 'center')}>GR</th>
              <th style={thFixedStyle('fixed', '111px', '220px')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span onClick={() => handleSort('artist')} style={{ cursor: 'pointer' }}>ARTIST</span>
                  <span onClick={() => handleSort('recencia_score')} style={{ ...iconStyle, color: sortCol === 'recencia_score' ? '#1DB954' : '#999' }}>◈</span>
                  <span onClick={() => handleSort('recencia_variation')} style={{ ...iconStyle, color: sortCol === 'recencia_variation' ? '#1DB954' : '#999' }}>±</span>
                  <span onClick={() => { setOffset(0); setFilterRatingActive(!filterRatingActive); }} style={{ ...iconStyle, color: filterRatingActive ? '#1DB954' : '#ccc' }}>★</span>
                  <span onClick={() => { setOffset(0); setFilterZeroScoreActive(!filterZeroScoreActive); }} style={{ ...iconStyle, fontSize: '10px', backgroundColor: filterZeroScoreActive ? '#e97b78' : '#ccc', color: 'white', padding: '1px 3px', borderRadius: '2px' }}>0</span>
                  <span onClick={() => { setOffset(0); setFilterHighlightActive(!filterHighlightActive); }} style={{ ...iconStyle, color: filterHighlightActive ? '#3498db' : '#ccc' }}>💎</span>
                </div>
              </th>
              <th onClick={() => handleSort('country')} style={thStyle}>PAÍS</th>
              <th onClick={() => handleSort('city')} style={thStyle}>CIDADE</th>
              {years.map(y => (
                <th 
                  key={y} 
                  onClick={() => handleSort(y)} 
                  style={{ ...thStyle, fontSize: '9px', textAlign: 'center', cursor: 'pointer' }}
                  title={`Ordenar por '${y}`}
                >
                  '{y}
                </th>
              ))}
              <th onClick={() => handleSort('primeiro_ano')} style={thStyle}>INÍCIO</th>
            </tr>
          </thead>
          <tbody>
            {pagedData.map((item, index) => {
              const flagCode = countryMap[(item.country || "").toLowerCase().trim()] || "un";
              const variationText = item.recencia_variation > 0 ? `+${item.recencia_variation}` : item.recencia_variation;
              const recenciaColor = item.recencia_variation > 0 ? "#6dbe99" : item.recencia_variation < 0 ? "#e97b78" : "#f8c039";

              const lastFmUrl = `https://www.last.fm/music/${encodeURIComponent(item.artist)}`;
              const deezerUrl = `https://www.deezer.com/search/${encodeURIComponent(item.artist)}`;

              return (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f8f8' }}>
                  <td 
                    style={{ ...tdFixedStyle('fixed', 0, '20px', 'center', '#1DB954', index), cursor: 'pointer' }}
                    onClick={() => window.open(deezerUrl, '_blank')}
                    title="Buscar no Deezer"
                  >
                    {offset + index + 1}
                  </td>

                  <td 
                    style={{ ...tdFixedStyle('fixed', '20px', '35px', 'right', '#222', index), fontWeight: 'bold', paddingRight: '2px', cursor: 'pointer' }}
                    onClick={() => openArtistDetails(item.artist)}
                    title="Ver músicas e álbuns"
                  >
                    {(item.scrobbles || 0).toLocaleString('pt-BR')}
                  </td>

                  <td style={tdFixedStyle('fixed', '55px', '28px', 'center', '#222', index)}>{item.dias_ultimo ?? '-'}</td>

                  <td 
                    style={{ ...tdFixedStyle('fixed', '83px', '28px', 'center', 'transparent', index), cursor: 'pointer' }} 
                    onClick={() => checkAuthAndOpenRating(item.artist)}
                    title="Avaliar Artista"
                  >
                    <span style={getGRBadgeStyle(item)}>
                      {item.global_pos}
                    </span>
                  </td>

                  <td style={{ ...tdFixedStyle('fixed', '111px', '220px', 'left', '#222', index), borderRight: '2px solid #ccc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                      {generateFidelityBar(item.rating_artista)}
                      <span style={{ backgroundColor: getScoreBgColor(item.recencia_score), color: '#fff', fontSize: '10px', minWidth: '14px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '1px', marginRight: '4px' }}>
                        {item.recencia_score}
                      </span>
                      <span style={{ display: 'inline-block', width: '25px', textAlign: 'center', fontFamily: 'monospace', fontSize: '8px', color: recenciaColor, marginRight: '4px' }}>
                        {variationText}
                      </span>
                      <img 
                        src={`https://flagcdn.com/32x24/${flagCode}.png`} 
                        style={{ 
                          width: '20px',          
                          height: '14px',         
                          border: '0.5px solid #bbb', 
                          marginRight: '6px', 
                          verticalAlign: 'middle', 
                          marginTop: '-2px',      
                          marginBottom: '-2px',   
                          cursor: 'pointer' 
                        }}
                        onClick={() => toggleQuickFilter('country', item.country)}
                        alt="" 
                      />
                      <span 
                        onClick={() => window.open(lastFmUrl, '_blank')}
                        style={{ 
                          color: getNameColor(item.db_rating), 
                          fontWeight: 'bold', 
                          cursor: 'pointer', 
                          fontFamily: "'Bebas Neue', cursive", 
                          fontSize: '15px',
                          letterSpacing: '0.3px'
                        }}
                        title="Abrir no Last.fm"
                      >
                        {item.artist}
                      </span>
                    </div>
                  </td>
                  
                  <td style={tdStyle} onClick={() => toggleQuickFilter('country', item.country)}>{item.country || '-'}</td>
                  <td style={tdStyle} onClick={() => toggleQuickFilter('city', item.city)}>{item.city || '-'}</td>
                  {years.map(y => {
                    const yearVal = item[`y${y}`];
                    return (
                      <td key={y} style={{ ...tdStyle, textAlign: 'center', color: yearVal > 0 ? '#000' : '#ccc', fontWeight: yearVal > 0 ? 'bold' : 'normal' }}>
                        {yearVal || '-'}
                      </td>
                    );
                  })}
                  <td style={tdStyle}>{item.primeiro_ano || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* RODAPÉ DO PAGINADOR */}
      <div style={{ height: '45px', background: '#f1f1f1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid #ddd', padding: '0 10px', gap: '10px', zIndex: 950 }}>
        <button style={btnFooterStyle} onClick={() => setOffset(Math.max(0, offset - limit))}>«</button>
        <select 
          style={{ fontFamily: "'Bebas Neue', cursive", borderRadius: '4px', fontSize: '15px', height: '26px', padding: '0 4px' }} 
          value={Math.floor(offset / limit) + 1} 
          onChange={(e) => setOffset((Number(e.target.value) - 1) * limit)}
        >
          {Array.from({ length: totalPages }, (_, i) => (
            <option key={i} value={i + 1}>PÁG {i + 1}</option>
          ))}
        </select>
        <button style={btnFooterStyle} onClick={() => { if (offset + limit < filteredData.length) setOffset(offset + limit); }}>»</button>
        <button style={btnFooterStyle} onClick={() => setShowSearch(!showSearch)}>🔍</button>
        
        {(currentFilter.type || searchTerm || filterRatingActive || filterZeroScoreActive || filterHighlightActive) && (
          <button style={{ ...btnFooterStyle, color: '#e97b78', fontSize: '13px' }} onClick={clearFilters}>CLEAR</button>
        )}
        
        <span style={{ fontSize: '14px', marginLeft: 'auto', color: '#555', fontWeight: 'bold' }}>{filteredData.length} ARTISTAS</span>
      </div>

      {/* BUSCA EM OVERLAY */}
      {showSearch && (
        <div style={{ position: 'fixed', bottom: '45px', left: 0, width: '100%', background: 'white', padding: '8px 15px', boxShadow: '0 -3px 10px rgba(0,0,0,0.15)', zIndex: 999, display: 'flex', gap: '10px', boxSizing: 'border-box' }}>
          <input 
            ref={searchInputRef}
            type="text" 
            value={searchTerm} 
            onChange={(e) => { setOffset(0); setSearchTerm(e.target.value); }} 
            placeholder="BUSCAR ARTISTA EM TEMPO REAL..." 
            style={{ flex: 1, padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', fontFamily: "'Roboto', sans-serif" }} 
          />
          <button onClick={() => setShowSearch(false)} style={{ background: '#2c3e50', color: 'white', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer', fontFamily: "'Bebas Neue', cursive" }}>OK</button>
        </div>
      )}

      {/* OVERLAY DE DETALHES LATERAL (SONGS / ALBUMS) */}
      {selectedArtist && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '420px', height: '100vh', backgroundColor: '#1e1e1e', color: '#e0e0e0', boxShadow: '-5px 0 25px rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', flexDirection: 'column', fontFamily: "'Roboto', sans-serif" }}>
          <div style={{ padding: '15px', background: '#111', display: 'flex', alignItems: 'center', borderBottom: '1px solid #333', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, color: '#fff', fontSize: '18px', fontFamily: "'Bebas Neue', cursive", letterSpacing: '0.5px' }}>{selectedArtist.toUpperCase()}</h2>
            <button onClick={() => setSelectedArtist(null)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer' }}>✕</button>
          </div>
          
          <div style={{ display: 'flex', background: '#222' }}>
            <button onClick={() => setDetailTab('songs')} style={tabBtnStyle(detailTab === 'songs')}>SONGS ({detailData.songs.length})</button>
            <button onClick={() => setDetailTab('albums')} style={tabBtnStyle(detailTab === 'albums')}>ALBUMS ({detailData.albums.length})</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 'unset' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #444', color: '#aaa' }}>
                  <th style={{ padding: '6px 4px', textAlign: 'left', background: 'transparent', position: 'static', width: '30px', fontFamily: "'Bebas Neue', cursive" }}>#A</th>
                  <th style={{ padding: '6px 4px', textAlign: 'left', background: 'transparent', position: 'static', width: '30px', fontFamily: "'Bebas Neue', cursive" }}>#G</th>
                  <th onClick={() => handleDetailSort('count')} style={{ padding: '6px 4px', textAlign: 'right', cursor: 'pointer', background: 'transparent', position: 'static', width: '60px', fontFamily: "'Bebas Neue', cursive", color: detailSortCol === 'count' ? '#1DB954' : '#aaa' }}>TOT ⇅</th>
                  <th onClick={() => handleDetailSort('days')} style={{ padding: '6px 4px', textAlign: 'center', cursor: 'pointer', background: 'transparent', position: 'static', width: '50px', fontFamily: "'Bebas Neue', cursive", color: detailSortCol === 'days' ? '#1DB954' : '#aaa' }}>DAYS ⇅</th>
                  <th onClick={() => handleDetailSort('title')} style={{ padding: '6px 4px', textAlign: 'left', cursor: 'pointer', background: 'transparent', position: 'static', fontFamily: "'Bebas Neue', cursive", color: detailSortCol === 'title' ? '#1DB954' : '#aaa' }}>TITLE ⇅</th>
                </tr>
              </thead>
              <tbody>
                {getSortedDetailData().map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #2a2a2a' }}>
                    {detailTab === 'songs' ? (
                      <>
                        <td style={{ padding: '6px 4px', color: '#1DB954', fontWeight: 'bold' }}>{row.rank_artist}</td>
                        <td style={{ padding: '6px 4px', color: '#777', fontSize: '10px' }}>{row.rank_global}</td>
                        <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 'bold' }}>{row.count}</td>
                        <td style={{ padding: '6px 4px', textAlign: 'center', fontSize: '10px' }}>{row.days === 999999 ? '-' : row.days}</td>
                        <td style={{ padding: '6px 4px', color: '#fff', fontWeight: 'bold', whiteSpace: 'normal' }}>{row.title}</td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: '6px 4px' }}>-</td>
                        <td style={{ padding: '6px 4px' }}>-</td>
                        <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 'bold' }}>{row.count}</td>
                        <td style={{ padding: '6px 4px', textAlign: 'center', fontSize: '10px' }}>-</td>
                        <td style={{ padding: '6px 4px', color: '#fff', fontWeight: 'bold', whiteSpace: 'normal' }}>{row.title}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE REGISTRO DE RATING */}
      {ratingArtist && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', zIndex: 40001, justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '80%', maxWidth: '300px', textAlign: 'center', fontFamily: "'Roboto', sans-serif", color: '#333' }}>
            <h2 style={{ margin: '0 0 5px 0', fontFamily: "'Bebas Neue', cursive", fontSize: '20px' }}>{ratingArtist.toUpperCase()}</h2>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 15px 0' }}>Avalie para a coleção:</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', margin: '20px 0', fontSize: '30px' }}>
              <span style={{ cursor: 'pointer', color: '#e97b78' }} onClick={() => submitRating(-3)} title="Não incluir">★</span>
              <span style={{ cursor: 'pointer', color: '#ffc845' }} onClick={() => submitRating(-2)} title="Ouvir mais">★</span>
              <span style={{ cursor: 'pointer', color: '#1DB954' }} onClick={() => submitRating(-1)} title="Incluir na Coleção">★</span>
            </div>
            <button style={{ background: '#eee', border: 'none', padding: '8px', width: '100%', marginTop: '10px', fontFamily: "'Bebas Neue', cursive", cursor: 'pointer' }} onClick={() => setRatingArtist(null)}>CANCELAR</button>
          </div>
        </div>
      )}

    </div>
  );
}

// --- ESTILOS INLINE AUXILIARES COM HERANÇA TIPOGRÁFICA ---
const thStyle = { background: '#f1f1f1', position: 'sticky', top: 0, zIndex: 900, padding: '4px 1px', borderBottom: '2px solid #ddd', textAlign: 'left', fontFamily: "'Bebas Neue', cursive" };
const tdStyle = { padding: '3px 1px', borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap', textAlign: 'left', lineHeight: '1.2', cursor: 'pointer', fontFamily: "'Bebas Neue', cursive" };
const iconStyle = { cursor: 'pointer', fontSize: '13px', color: '#999', transition: 'color 0.2s', marginLeft: '5px' };
const btnFooterStyle = { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '2px 8px', display: 'flex', alignItems: 'center', height: '100%', fontFamily: "'Bebas Neue', cursive" };
const tabBtnStyle = (active) => ({ background: active ? '#1DB954' : '#eee', color: active ? 'white' : '#333', border: 'none', padding: '10px 5px', fontFamily: "'Bebas Neue', cursive", cursor: 'pointer', flex: 1, fontSize: '14px' });

const thFixedStyle = (pos, left, width, align = 'left') => ({
  background: '#f1f1f1', position: 'sticky', top: 0, left: left, width: width, minWidth: width, maxWidth: width, zIndex: 910, padding: '4px 1px', borderBottom: '2px solid #ddd', textAlign: align, fontFamily: "'Bebas Neue', cursive"
});

const tdFixedStyle = (pos, left, width, align, color, index) => ({
  position: 'sticky', left: left, width: width, minWidth: width, maxWidth: width, zIndex: 400, backgroundColor: index % 2 === 0 ? '#fff' : '#f8f8f8', color: color, textAlign: align, padding: '3px 1px', borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap', lineHeight: '1.2', fontFamily: "'Bebas Neue', cursive"
});

const getGRBadgeStyle = (item) => {
  const gr = Number(item.global_pos) || 0;
  let borderColor = '#aaaaaa'; 

  if (gr > 0 && gr <= 100) {
    borderColor = '#6dbe99'; 
  } else if (gr > 100 && gr <= 300) {
    borderColor = '#86d03a'; 
  } else if (gr > 300 && gr <= 600) {
    borderColor = '#ffcc33'; 
  } else if (gr > 600 && gr <= 1000) {
    borderColor = '#ffaa33'; 
  } else if (gr > 1000 && gr <= 1500) {
    borderColor = '#ff5f33'; 
  } else if (gr > 1500 && gr <= 2000) {
    borderColor = '#e97b78'; 
  }

  return {
    fontFamily: "'Bebas Neue', cursive", 
    fontSize: '11px',
    fontWeight: 'bold',
    letterSpacing: '0.3px',
    color: borderColor,
    backgroundColor: 'transparent',
    border: `1px solid ${borderColor}`,
    borderRadius: '3px',
    padding: '1px 3px',
    display: 'inline-block',
    minWidth: '26px',              
    textAlign: 'center',
    lineHeight: '1',
    boxSizing: 'border-box'
  };
};
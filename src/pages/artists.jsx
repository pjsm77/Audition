// src/pages/Artists.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Artists() {
  // --- ESTADOS GLOBAIS DA PÁGINA ---
  const [fullRawData, setFullRawData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Ordenação
  const [sortCol, setSortCol] = useState('scrobbles');
  const [sortAsc, setSortAsc] = useState(false);

  // Filtros rápidos e especiais
  const [currentFilter, setCurrentFilter] = useState({ type: null, value: null });
  const [filterRatingActive, setFilterRatingActive] = useState(false);
  const [filterZeroScoreActive, setFilterZeroScoreActive] = useState(false);
  const [filterHighlightActive, setFilterHighlightActive] = useState(false);

  // Detalhes do Artista (Overlay)
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [detailTab, setDetailTab] = useState('songs');
  const [detailData, setDetailData] = useState({ songs: [], albums: [] });
  const [detailSortAsc, setDetailSortAsc] = useState(false);

  // Modal de Avaliação
  const [ratingArtist, setRatingArtist] = useState(null);

  const limit = 50;

  // Gerador dinâmico de anos de '26 a '14
  const years = Array.from({ length: 26 - 14 + 1 }, (_, i) => 26 - i);

  // Mapeamento de Países para Bandeiras
  const countryMap = {
    "[desconhecido]": "unknown", "afeganistão": "af", "áfrica do sul": "za", "alemanha": "de", "andorra": "ad",
    "argélia": "dz", "argentina": "ar", "armênia": "am", "austrália": "au", "áustria": "at", "azerbaijão": "az",
    "bangladesh": "bd", "barbados": "bb", "bélgica": "be", "bolívia": "bo", "bósnia e herzegovina": "ba", "brasil": "br",
    "bulgária": "bg", "canadá": "ca", "chile": "cl", "china": "cn", "colômbia": "co", "coreia do sul": "kr",
    "costa rica": "cr", "croácia": "hr", "cuba": "cu", "dinamarca": "dk", "egito": "eg", "emirados árabes unidos": "ae",
    "equador": "ec", "escócia": "gb-sct", "eslováquia": "sk", "eslovênia": "si", "espanha": "es", "estados unidos": "us",
    "estônia": "ee", "eua": "us", "finlândia": "fi", "frança": "fr", "geórgia": "ge", "grécia": "gr", "guatemala": "gt",
    "hungria": "hu", "índia": "in", "indonésia": "id", "inglaterra": "gb-eng", "irã": "ir", "irlanda": "ie",
    "islândia": "is", "israel": "il", "itália": "it", "jamaica": "jm", "japão": "jp", "jordânia": "jo", "líbano": "lb",
    "luxemburgo": "lu", "malásia": "my", "malta": "mt", "marrocos": "ma", "méxico": "mx", "mongólia": "mn",
    "montenegro": "me", "nigéria": "ng", "noruega": "no", "nova zelândia": "nz", "país de gales": "gb-wls",
    "países baixos": "nl", "holanda": "nl", "panamá": "pa", "paquistão": "pk", "paraguai": "py", "peru": "pe",
    "polônia": "pl", "portugal": "pt", "quênia": "ke", "quirguistão": "kg", "reino unido": "gb", "república checa": "cz",
    "romênia": "ro", "rússia": "ru", "sérvia": "rs", "síria": "sy", "sri lanka": "lk", "suécia": "se", "suíça": "ch",
    "tailândia": "th", "taiwan": "tw", "tajiquistão": "tj", "tunísia": "tn", "turquia": "tr", "ucrânia": "ua",
    "uruguai": "uy", "venezuela": "ve", "vietnã": "vn", "zâmbia": "zm", "zimbábue": "zw"
  };

  // --- CARREGAMENTO INICIAL DOS DADOS ---
  useEffect(() => {
    async function fetchData() {
      try {
        const [resRanking, resFidelidade, resRecencia, resRecentRating, resTblArtists] = await Promise.all([
          supabase.rpc('get_artist_ranking_full', { search_term: '' }),
          supabase.from('artista_fidelidade_score_v2').select('artist, score_numérico, rating_artista'),
          supabase.from('artista_recencia_v2').select('artist, score, variation'),
          supabase.from('tbl_artists_recent').select('artist_name, rating'),
          supabase.from('tbl_artists').select('name, rating')
        ]);

        if (!resRanking.error) {
          let base = (resRanking.data || []).map(item => {
            const f = resFidelidade.data?.find(x => x.artist === item.artist);
            const r = resRecencia.data?.find(x => x.artist === item.artist);
            const recent = resRecentRating.data?.find(x => x.artist_name === item.artist);
            const artistData = resTblArtists.data?.find(x => x.name === item.artist);

            return {
              ...item,
              score_numérico: f ? f.score_numérico : 0.5,
              rating_artista: f ? f.rating_artista : 0,
              recencia_score: r ? r.score : 0,
              recencia_variation: r ? r.variation : 0,
              status_rating: recent ? recent.rating : null,
              db_rating: artistData ? artistData.rating : null
            };
          });

          // Ordenação base inicial
          base.sort((a, b) => (b.scrobbles - a.scrobbles) || a.artist.localeCompare(b.artist));
          base.forEach((item, idx) => item.global_pos = idx + 1);

          setFullRawData(base);
        }
      } catch (err) {
        console.error("Erro ao buscar dados do Supabase:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // --- PROCESSAMENTO DE FILTROS E ORDENAÇÃO (LÓGICA CONVERTIDA) ---
  useEffect(() => {
    let result = [...fullRawData];

    // Filtro de Busca por Texto
    if (searchTerm) {
      result = result.filter(item => item.artist.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Filtros de País / Cidade rápidos pelas células
    if (currentFilter.type === 'country') {
      result = result.filter(item => item.country === currentFilter.value);
    } else if (currentFilter.type === 'city') {
      result = result.filter(item => item.city === currentFilter.value);
    }

    // Filtro Estrela (Rating Recente)
    if (filterRatingActive) {
      result = result.filter(item => item.status_rating === -1);
    }

    // Filtro Score Zero
    if (filterZeroScoreActive) {
      result = result.filter(item => item.recencia_score === 0);
    }

    // Filtro Destaques (Rating 2 ou 3)
    if (filterHighlightActive) {
      result = result.filter(item => item.db_rating === 2 || item.db_rating === 3);
    }

    // Aplicação da Ordenação Dinâmica
    result.sort((a, b) => {
      let valA = a[sortCol];
      let valB = b[sortCol];
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      valA = valA ?? -1;
      valB = valB ?? -1;
      if (valA === valB) return a.artist.localeCompare(b.artist);
      return sortAsc ? valA - valB : valB - valA;
    });

    setFilteredData(result);
  }, [fullRawData, searchTerm, currentFilter, filterRatingActive, filterZeroScoreActive, filterHighlightActive, sortCol, sortAsc]);

  // --- MÉTODOS DE SUPORTE VISUAL & DEEZER ---
  const handleSort = (col) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(col === 'artist');
    }
    setOffset(0);
  };

  const toggleQuickFilter = (type, value) => {
    if (!value || value === '-') return;
    if (currentFilter.type === type && currentFilter.value === value) {
      setCurrentFilter({ type: null, value: null });
    } else {
      setCurrentFilter({ type, value });
    }
    setOffset(0);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setCurrentFilter({ type: null, value: null });
    setFilterRatingActive(false);
    setFilterZeroScoreActive(false);
    setFilterHighlightActive(false);
    setOffset(0);
    setShowSearch(false);
  };

  const getGRColor = (item) => {
    if (item.status_rating === -1) return "#1DB954";
    if (item.status_rating === -2) return "#ffc845";
    if (item.status_rating === -3) return "#e97b78";
    return "#777";
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return '#6dbe99'; if (score >= 80) return '#86d03a';
    if (score >= 70) return '#b7d13e'; if (score >= 60) return '#e0d341';
    if (score >= 50) return '#ffcc33'; if (score >= 40) return '#ffaa33';
    if (score >= 30) return '#ff8833'; if (score >= 20) return '#ff5f33';
    if (score >= 10) return '#ff4433'; if (score >= 1) return '#e97b78';
    return '#aaaaaa';
  };

  const generateFidelityBar = (rating) => {
    const finalScore = Math.min(Math.max(Math.round(rating), 0), 6);
    return (
      <div className="progress-container">
        {Array.from({ length: 6 }, (_, i) => {
          const activeClass = i + 1 <= finalScore ? `score-${finalScore}` : '';
          return <div key={i} className={`step ${activeClass}`}></div>;
        })}
      </div>
    );
  };

  const openDeezer = (type, query) => {
    const callbackName = 'dz_' + Math.floor(Math.random() * 100000);
    window[callbackName] = (data) => {
      if (data.data && data.data.length > 0) {
        window.location.href = `deezer://www.deezer.com/${type}/${data.data[0].id}`;
      } else {
        window.open(`https://www.deezer.com/search/${encodeURIComponent(query)}`, '_blank');
      }
      delete window[callbackName];
    };
    const s = document.createElement('script');
    s.src = `https://api.deezer.com/search/${type}?q=${encodeURIComponent(query)}&output=jsonp&callback=${callbackName}`;
    document.body.appendChild(s);
  };

  // --- LÓGICA DO PAINEL DE DETALHES ---
  const handleShowDetails = async (artist, flagCode, scrobbles) => {
    setSelectedArtist({ artist, flagCode, scrobbles });
    
    const [resSongs, resAlbums] = await Promise.all([
      supabase.from('scrobbles_unificados')
        .select('ranking_no_artista_unico, ranking_geral_unico, total_scrobbles, dias_ultima_execucao, track_name')
        .eq('artist', artist.toLowerCase()),
      supabase.from('scrobbles_test')
        .select('album')
        .eq('artist', artist)
    ]);

    const songs = (resSongs.data || []).map(item => ({
      rank_artist: item.ranking_no_artista_unico,
      rank_global: item.ranking_geral_unico,
      count: item.total_scrobbles,
      days: item.dias_ultima_execucao,
      title: item.track_name
    }));

    const aCnt = {};
    (resAlbums.data || []).forEach(r => {
      const a = r.album || '[Desconhecido]';
      aCnt[a] = (aCnt[a] || 0) + 1;
    });
    const albums = Object.entries(aCnt).map(([title, count]) => ({ title, count }));

    setDetailData({ songs, albums });
    setDetailTab('songs');
    // Ordenação padrão inicial das músicas por ranking interno
    songs.sort((a, b) => a.rank_artist - b.rank_artist);
  };

  const handleSortDetails = (col) => {
    const nextSort = !detailSortAsc;
    setDetailSortAsc(nextSort);
    const targetData = [...detailData[detailTab]];
    
    targetData.sort((a, b) => {
      let valA = a[col];
      let valB = b[col];
      if (typeof valA === 'string') {
        return nextSort ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return nextSort ? valA - valB : valB - valA;
    });

    setDetailData({ ...detailData, [detailTab]: targetData });
  };

  // --- SISTEMA DE AVALIAÇÃO (RATING MODAL) ---
  const handleOpenRating = async (artistName) => {
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

  const handleSubmitRating = async (ratingValue) => {
    const { error } = await supabase
      .from('tbl_artists_recent')
      .insert([{ artist_name: ratingArtist, rating: ratingValue }]);

    if (error) {
      alert("Erro ao inserir: " + error.message);
    } else {
      alert("Rating registrado com sucesso!");
      setRatingArtist(null);
      // Atualiza o dado localmente para pintar a coluna na hora
      setFullRawData(prev => prev.map(item => item.artist === ratingArtist ? { ...item, status_rating: ratingValue } : item));
    }
  };

  // --- RENDEREZAÇÃO DA PAGINAÇÃO ---
  const pagedData = filteredData.slice(offset, offset + limit);
  const totalPages = Math.ceil(filteredData.length / limit) || 1;
  const currentPage = Math.floor(offset / limit) + 1;

  if (loading) return <div style={{ padding: '20px', fontFamily: 'Bebas Neue', color: '#777' }}><h2>Carregando coleção musical...</h2></div>;

  return (
    <div className="container" id="main-view" style={{ fontFamily: 'Bebas Neue, cursive', letterSpacing: '0.2px', overflow: 'hidden', backgroundColor: '#fff', color: '#222' }}>
      
      {/* WRAPPER DA TABELA PRINCIPAL */}
      <div className="table-wrapper" style={{ width: '100%', height: '94vh', overflow: 'auto', border: '1px solid #e0e0e0', position: 'relative', background: 'white' }}>
        <table style={{ borderCollapse: 'collapse', borderSpacing: 0, width: '100%', fontSize: '12px', minWidth: '1000px' }}>
          <thead>
            <tr id="table-header">
              <th onClick={() => handleSort('scrobbles')} style={thFixedStyle(1, 0, '28px')}>POS</th>
              <th onClick={() => handleSort('scrobbles')} style={thFixedStyle(2, 29, '28px', 'right')}>TOTAL</th>
              <th onClick={() => handleSort('dias_ultimo')} style={thFixedStyle(3, 58, '32px', 'center')}>DAYS</th>
              <th onClick={() => handleSort('global_pos')} style={thFixedStyle(4, 91, '28px', 'center')}>GR</th>
              
              <th style={{ ...thFixedStyle(5, 120, 'auto'), minWidth: '140px', borderRight: '2px solid #ccc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span onClick={() => handleSort('artist')} style={{ cursor: 'pointer' }}>ARTIST</span>
                  <span onClick={() => handleSort('recencia_score')} style={iconStyle} title="Score">◈</span>
                  <span onClick={() => handleSort('recencia_variation')} style={iconStyle} title="Variação">±</span>
                  <span onClick={() => handleSort('y26')} style={iconStyle} title="Ano Corrente">📅</span>
                  <span onClick={() => handleSort('dias_ultimo')} style={iconStyle} title="Última Execução">⌛</span>
                  
                  <span onClick={() => setFilterRatingActive(!filterRatingActive)} 
                        style={{ ...iconStyle, color: filterRatingActive ? "#1DB954" : "#ccc", fontSize: '14px' }} title="Filtrar Selecionados">★</span>
                  
                  <span onClick={() => setFilterZeroScoreActive(!filterZeroScoreActive)} 
                        style={{ cursor: 'pointer', fontSize: '10px', backgroundColor: filterZeroScoreActive ? "#e97b78" : "#ccc", color: 'white', padding: '1px 3px', borderRadius: '2px', marginLeft: '5px', fontFamily: 'monospace' }} title="Filtrar Score 0">0</span>

                  <span onClick={() => setFilterHighlightActive(!filterHighlightActive)} 
                        style={{ ...iconStyle, color: filterHighlightActive ? "#3498db" : "#ccc", fontSize: '14px' }} title="Filtrar Destaques (Rating 2/3)">💎</span>
                </div>
              </th>

              <th onClick={() => handleSort('country')} style={thStyle}>PAÍS</th>
              <th onClick={() => handleSort('city')} style={thStyle}>CIDADE</th>
              
              {/* Colunas dos Anos Geradas Dinamicamente */}
              {years.map(y => (
                <th key={y} style={{ ...thStyle, fontSize: '9px' }}>'{y}</th>
              ))}
              
              <th onClick={() => handleSort('primeiro_ano')} style={thStyle}>INÍCIO</th>
            </tr>
          </thead>
          
          <tbody>
            {pagedData.map((item, index) => {
              const flagCode = countryMap[(item.country || "").toLowerCase().trim()] || "un";
              
              let nameColor = "#AAAAAA";
              if (item.db_rating === 1) nameColor = "#e97b78";
              else if (item.db_rating === 2) nameColor = "#f8c039";
              else if (item.db_rating === 3) nameColor = "#6dbe99";

              let recenciaColor = "#f8c039";
              if (item.recencia_variation > 0) recenciaColor = "#6dbe99";
              else if (item.recencia_variation < 0) recenciaColor = "#e97b78";

              const variationText = item.recencia_variation > 0 ? `+${item.recencia_variation}` : item.recencia_variation;

              return (
                <tr key={item.artist} style={{ backgroundColor: index % 2 !== 0 ? '#f8f8f8' : 'white' }}>
                  <td onClick={() => openDeezer('artist', item.artist)} style={tdFixedStyle(1, 0, '28px', 'center', '#1DB954')}>{offset + index + 1}</td>
                  <td onClick={() => handleShowDetails(item.artist, flagCode, item.scrobbles)} style={{ ...tdFixedStyle(2, 29, '28px', 'right'), fontWeight: 'bold', paddingRight: '4px' }}>{item.scrobbles.toLocaleString('pt-BR')}</td>
                  <td style={tdFixedStyle(3, 58, '32px', 'center')}>{item.dias_ultimo ?? '-'}</td>
                  <td onClick={() => handleOpenRating(item.artist)} style={{ ...tdFixedStyle(4, 91, '28px', 'center'), color: getGRColor(item) }}>{item.global_pos}</td>
                  
                  <td style={{ ...tdFixedStyle(5, 120, 'auto'), borderRight: '2px solid #ccc', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <div className="artist-box" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {generateFidelityBar(item.rating_artista)}
                      <span style={{ marginLeft: '1px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '1px' }}>
                        <span style={{ backgroundColor: getScoreBgColor(item.recencia_score), color: '#fff', fontSize: '10px', width: '14px', height: '12px', display: 'flex', alignItems: 'center', justifycontent: 'center', borderRadius: '1px', lineHeight: 1, paddingLeft: '2px' }}>{item.recencia_score}</span>
                        <span style={{ display: 'inline-block', width: '3.5ch', textAlign: 'center', fontFamily: 'monospace', fontSize: '8px', lineHeight: 1, color: recenciaColor }}>{variationText}</span>
                        <img className="flag-icon" src={`https://flagcdn.com/32x24/${flagCode}.png`} style={{ width: '16px', height: '12px', border: '0.5px solid #bbb', cursor: 'pointer' }} onClick={() => toggleQuickFilter('country', item.country)} title={`Filtrar por ${item.country}`} />
                        <a style={{ color: nameColor, fontWeight: 'bold', textDecoration: 'none' }} href={`https://www.last.fm/music/${encodeURIComponent(item.artist)}`} target="_blank" rel="noreferrer">{item.artist}</a>
                      </span>
                    </div>
                  </td>

                  <td onClick={() => toggleQuickFilter('country', item.country)} style={{ ...tdStyle, cursor: 'pointer' }}>{item.country || '-'}</td>
                  <td onClick={() => toggleQuickFilter('city', item.city)} style={{ ...tdStyle, cursor: 'pointer' }}>{item.city || '-'}</td>
                  
                  {/* Células de Scrobbles Anuais */}
                  {years.map(y => {
                    const value = item[`y${y}`] || 0;
                    return (
                      <td key={y} style={{ ...tdStyle, color: value > 0 ? '#000' : '#ccc' }}>
                        {value > 0 ? value : '-'}
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

      {/* OVERLAY DE BUSCA FLUTUANTE */}
      {showSearch && (
        <div id="search-overlay" style={{ position: 'fixed', bottom: '6vh', left: 0, width: '100%', background: 'white', padding: '10px 15px', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)', zIndex: 2000 }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input type="text" id="globalSearch" value={searchTerm} onChange={(e) => { setOffset(0); setSearchTerm(e.target.value); }} placeholder="BUSCAR ARTISTA..." style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ccc', fontFamily: 'sans-serif' }} />
            <button onClick={clearAllFilters} style={{ background: '#eee', border: 'none', padding: '8px 12px', borderRadius: '5px', fontFamily: 'Bebas Neue' }}>LIMPAR</button>
          </div>
        </div>
      )}

      {/* RODAPÉ E CONTROLES DE PAGINAÇÃO */}
      <div className="footer-controls" style={{ height: '6vh', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid #ddd', padding: '0 5px', gap: '10px' }}>
        <button className="btn-footer" style={btnFooterStyle} onClick={() => offset > 0 && setOffset(offset - limit)}>«</button>
        
        <select value={currentPage} onChange={(e) => setOffset((Number(e.target.value) - 1) * limit)} style={{ fontFamily: 'Bebas Neue', borderRadius: '5px', padding: '1px', fontSize: '16px', height: '28px' }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <option key={i + 1} value={i + 1}>PÁG {i + 1}</option>
          ))}
        </select>
        
        <button className="btn-footer" style={btnFooterStyle} onClick={() => offset + limit < filteredData.length && setOffset(offset + limit)}>»</button>
        <button className="btn-footer" style={btnFooterStyle} onClick={() => setShowSearch(!showSearch)}>🔍</button>
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '14px', marginLeft: '10px', color: '#666' }}>{filteredData.length}</span>
      </div>

      {/* OVERLAY DE DETALHES (MÚSICAS / ÁLBUNS DO ARTISTA) */}
      {selectedArtist && (
        <div id="detail-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'white', zIndex: 3000, padding: '10px', boxSizing: 'border-box', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', borderBottom: '2px solid #1DB954', paddingBottom: '10px' }}>
            <button onClick={() => setSelectedArtist(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            <div style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <img className="flag-icon" style={{ width: '32px', height: '24px' }} src={`https://flagcdn.com/32x24/${selectedArtist.flagCode}.png`} alt="bandeira" />
              <span>{selectedArtist.artist}</span>
              <span style={{ color: '#1DB954', marginLeft: '10px' }}>{selectedArtist.scrobbles.toLocaleString('pt-BR')}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            <button className={`tab-btn ${detailTab === 'songs' ? 'active' : ''}`} onClick={() => setDetailTab('songs')} style={tabBtnStyle(detailTab === 'songs')}>MÚSICAS ({detailData.songs.length})</button>
            <button className={`tab-btn ${detailTab === 'albums' ? 'active' : ''}`} onClick={() => setDetailTab('albums')} style={tabBtnStyle(detailTab === 'albums')}>ÁLBUNS ({detailData.albums.length})</button>
          </div>

          <div className="table-wrapper" style={{ height: '75vh', overflow: 'auto', border: '1px solid #e0e0e0' }}>
            <table style={{ minWidth: 'unset', width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: '30px' }}>#A</th>
                  <th style={{ ...thStyle, width: '30px' }}>#G</th>
                  <th onClick={() => handleSortDetails('count')} style={{ ...thStyle, width: '60px', cursor: 'pointer' }}>TOT</th>
                  <th onClick={() => handleSortDetails('days')} style={{ ...thStyle, width: '50px', cursor: 'pointer' }}>DIAS</th>
                  <th onClick={() => handleSortDetails('title')} style={{ ...thStyle, cursor: 'pointer' }}>TÍTULO</th>
                </tr>
              </thead>
              <tbody>
                {detailTab === 'songs' ? (
                  detailData.songs.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '6px 5px', color: '#1DB954', fontWeight: 'bold' }}>{item.rank_artist}</td>
                      <td style={{ padding: '6px 5px', fontSize: '10px', color: '#777' }}>{item.rank_global}</td>
                      <td style={{ padding: '6px 5px', fontWeight: 'bold' }}>{item.count}</td>
                      <td style={{ padding: '6px 5px', fontSize: '10px' }}>{item.days}d</td>
                      <td style={{ padding: '6px 5px', color: '#003399', cursor: 'pointer' }} onClick={() => openDeezer('track', `${selectedArtist.artist} ${item.title}`)}>{item.title}</td>
                    </tr>
                  ))
                ) : (
                  detailData.albums.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '6px 5px' }}>-</td>
                      <td style={{ padding: '6px 5px' }}>-</td>
                      <td style={{ padding: '6px 5px', fontWeight: 'bold' }}>{item.count}</td>
                      <td style={{ padding: '6px 5px' }}>-</td>
                      <td style={{ padding: '6px 5px', color: '#003399', cursor: 'pointer' }} onClick={() => openDeezer('album', `${selectedArtist.artist} ${item.title}`)}>{item.title}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE REGISTRO DE RATING */}
      {ratingArtist && (
        <div id="modal-rating" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '80%', maxWidth: '300px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h2 style={{ fontFamily: 'Bebas Neue', margin: 0 }}>{ratingArtist.toUpperCase()}</h2>
            <p style={{ fontSize: '12px', color: '#666' }}>Avalie para a coleção:</p>
            <div className="star-rating" style={{ display: 'flex', justifyContent: 'center', gap: '15px', margin: '20px 0', fontSize: '30px' }}>
              <span style={{ cursor: 'pointer', color: '#ccc' }} onClick={() => handleSubmitRating(-3)} title="Não incluir">★</span>
              <span style={{ cursor: 'pointer', color: '#ccc' }} onClick={() => handleSubmitRating(-2)} title="Ouvir mais">★</span>
              <span style={{ cursor: 'pointer', color: '#ccc' }} onClick={() => handleSubmitRating(-1)} title="Incluir na Coleção">★</span>
            </div>
            <button style={{ background: '#eee', border: 'none', padding: '8px', width: '100%', marginTop: '10px', fontFamily: 'Bebas Neue', cursor: 'pointer' }} onClick={() => setRatingArtist(null)}>CANCELAR</button>
          </div>
        </div>
      )}

    </div>
  );
}

// --- ESTILOS INLINE AUXILIARES ---
const thStyle = { background: '#f1f1f1', position: 'sticky', top: 0, zIndex: 900, padding: '4px 1px', borderBottom: '2px solid #ddd', textAlign: 'left' };
const tdStyle = { padding: '3px 1px', borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap', textAlign: 'left', lineHeight: '1.2' };
const iconStyle = { cursor: 'pointer', fontSize: '13px', color: '#999', transition: 'color 0.2s', marginLeft: '5px' };
const btnFooterStyle = { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '2px 8px', display: 'flex', alignItems: 'center', height: '100%' };
const tabBtnStyle = (active) => ({ background: active ? '#1DB954' : '#eee', color: active ? 'white' : '#333', border: 'none', padding: '10px 5px', fontFamily: 'Bebas Neue', cursor: 'pointer', flex: 1, fontSize: '14px' });

const thFixedStyle = (pos, left, width, align = 'left') => ({
  background: '#f1f1f1', position: 'sticky', top: 0, left: `${left}px`, zIndex: 901, width, textAlign: align, padding: '4px 1px', borderBottom: '2px solid #ddd', borderRight: '1px solid #ddd'
});

const tdFixedStyle = (pos, left, width, align = 'left', color = '#222') => ({
  position: 'sticky', left: `${left}px`, zIndex: 400, width, background: 'white', borderRight: '1px solid #ddd', textAlign: align, color, padding: '3px 1px', lineHeight: '1.2', whiteSpace: 'nowrap'
});
// src/pages/Artists.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Artists() {
  // --- ESTADOS GLOBAIS DA PÁGINA ---\
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

  // Modal de Rating
  const [ratingArtist, setRatingArtist] = useState(null);

  const limit = 50;

  // Mapeamento de bandeiras
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

  const years = Array.from({ length: 13 }, (_, i) => 26 - i); // '26 ate '14

  // 1. Carga Inicial de Dados Coordenada (RPC + Tabelas Auxiliares)
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

  // 2. Filtragem e Ordenação em Memória
  useEffect(() => {
    let result = fullRawData.filter(item => {
      const nameMatch = item.artist.toLowerCase().includes(searchTerm.toLowerCase());
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

      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      valA = valA ?? -1;
      valB = valB ?? -1;

      if (valA === valB) return a.artist.localeCompare(b.artist);
      return sortAsc ? valA - valB : valB - valA;
    });

    setFilteredData(result);
  }, [fullRawData, searchTerm, currentFilter, sortCol, sortAsc, filterRatingActive, filterZeroScoreActive, filterHighlightActive]);

  // 3. Paginação
  useEffect(() => {
    setPagedData(filteredData.slice(offset, offset + limit));
  }, [filteredData, offset]);

  // 4. Carregar Detalhes do Artista (Overlay lateral)
  const openArtistDetails = async (artistName) => {
    setSelectedArtist(artistName);
    setDetailData({ songs: [], albums: [] });
    
    const [resSongs, resAlbums] = await Promise.all([
      supabase.from('v_songs_ranking').select('track_name, album_name, scrobbles').eq('artist_name', artistName),
      supabase.from('v_albums_ranking').select('album_name, scrobbles').eq('artist_name', artistName)
    ]);

    setDetailData({
      songs: resSongs.data || [],
      albums: resAlbums.data || []
    });
  };

  // 5. Submit do Modal de Rating
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
    if (sortCol === col) setSortAsc(!sortAsc);
    else {
      setSortCol(col);
      setSortAsc(col === 'artist');
    }
    setOffset(0);
  };

  // --- REGRAS VISUAIS / CORES ---
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

  const getNameColor = (rating) => {
    if (rating === 1) return "#e97b78";
    if (rating === 2) return "#f8c039";
    if (rating === 3) return "#6dbe99";
    return "#AAAAAA";
  };

  const generateFidelityBar = (rating) => {
    const finalScore = Math.min(Math.max(Math.round(rating), 0), 6);
    return (
      <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(6, 2px)', gap: '1.5px', verticalAlign: 'middle', marginRight: '4px' }}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} style={{ height: '10px', borderRadius: '0.3px', backgroundColor: i < finalScore ? '#2c3e50' : '#f2f2f2' }}></div>
        ))}
      </div>
    );
  };

  const totalPages = Math.ceil(filteredData.length / limit) || 1;

  if (loading) {
    return <div style={{ padding: '20px', color: '#666', fontSize: '24px', fontFamily: "'Bebas Neue', cursive" }}>CARREGANDO ECOSSISTEMA MUSICAL...</div>;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Bebas Neue', cursive" }}>
      
      {/* WRAPPER PRINCIPAL DA TABELA */}
      <div style={{ flex: 1, overflow: 'auto', border: '1px solid #e0e0e0', position: 'relative', backgroundColor: '#fff' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '12px', minWidth: '1200px' }}>
          <thead>
            <tr>
              <th onClick={() => handleSort('scrobbles')} style={thFixedStyle('fixed', 0, '30px')}>POS</th>
              <th onClick={() => handleSort('scrobbles')} style={thFixedStyle('fixed', '30px', '55px', 'right')}>TOTAL</th>
              <th onClick={() => handleSort('dias_ultimo')} style={thFixedStyle('fixed', '85px', '35px', 'center')}>DAYS</th>
              <th onClick={() => handleSort('global_pos')} style={thFixedStyle('fixed', '120px', '30px', 'center')}>GR</th>
              <th style={thFixedStyle('fixed', '150px', '220px')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span onClick={() => handleSort('artist')} style={{ cursor: 'pointer' }}>ARTIST</span>
                  <span onClick={() => handleSort('recencia_score')} style={{ ...iconStyle, color: sortCol === 'recencia_score' ? '#1DB954' : '#999' }}>◈</span>
                  <span onClick={() => handleSort('recencia_variation')} style={{ ...iconStyle, color: sortCol === 'recencia_variation' ? '#1DB954' : '#999' }}>±</span>
                  <span id="star-filter" onClick={() => { setOffset(0); setFilterRatingActive(!filterRatingActive); }} style={{ ...iconStyle, color: filterRatingActive ? '#1DB954' : '#ccc' }}>★</span>
                  <span id="zero-score-filter" onClick={() => { setOffset(0); setFilterZeroScoreActive(!filterZeroScoreActive); }} style={{ ...iconStyle, fontSize: '10px', backgroundColor: filterZeroScoreActive ? '#e97b78' : '#ccc', color: 'white', padding: '1px 3px', borderRadius: '2px' }}>0</span>
                  <span id="highlight-filter" onClick={() => { setOffset(0); setFilterHighlightActive(!filterHighlightActive); }} style={{ ...iconStyle, color: filterHighlightActive ? '#3498db' : '#ccc' }}>💎</span>
                </div>
              </th>
              <th onClick={() => handleSort('country')} style={thStyle}>PAÍS</th>
              <th onClick={() => handleSort('city')} style={thStyle}>CIDADE</th>
              {years.map(y => <th key={y} style={{ ...thStyle, fontSize: '9px', textAlign: 'center' }}>'{y}</th>)}
              <th onClick={() => handleSort('primeiro_ano')} style={thStyle}>INÍCIO</th>
            </tr>
          </thead>
          <tbody>
            {pagedData.map((item, index) => {
              const flagCode = countryMap[(item.country || "").toLowerCase().trim()] || "un";
              const variationText = item.recencia_variation > 0 ? `+${item.recencia_variation}` : item.recencia_variation;
              const recenciaColor = item.recencia_variation > 0 ? "#6dbe99" : item.recencia_variation < 0 ? "#e97b78" : "#f8c039";

              return (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f8f8' }}>
                  <td style={tdFixedStyle('fixed', 0, '30px', 'center', '#1DB954', index)}>{offset + index + 1}</td>
                  <td style={{ ...tdFixedStyle('fixed', '30px', '55px', 'right', '#222', index), fontWeight: 'bold', paddingRight: '4px' }}>{item.scrobbles.toLocaleString('pt-BR')}</td>
                  <td style={tdFixedStyle('fixed', '85px', '35px', 'center', '#222', index)}>{item.dias_ultimo ?? '-'}</td>
                  <td style={{ ...tdFixedStyle('fixed', '120px', '30px', 'center', getGRColor(item), index), fontWeight: 'bold' }}>{item.global_pos}</td>
                  <td style={{ ...tdFixedStyle('fixed', '150px', '220px', 'left', '#222', index), borderRight: '2px solid #ccc' }}>
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
                        style={{ width: '14px', height: '10px', border: '0.5px solid #bbb', marginRight: '6px', cursor: 'pointer' }}
                        onClick={() => setCurrentFilter({ type: 'country', value: item.country })}
                        alt="" 
                      />
                      <span 
                        onClick={() => openArtistDetails(item.artist)}
                        onContextMenu={(e) => { e.preventDefault(); setRatingArtist(item.artist); }}
                        style={{ color: getNameColor(item.db_rating), fontWeight: 'bold', cursor: 'pointer', fontFamily: "'Roboto', sans-serif", fontSize: '13px' }}
                      >
                        {item.artist}
                      </span>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, color: '#555' }} onClick={() => setCurrentFilter({ type: 'country', value: item.country })}>{item.country || '-'}</td>
                  <td style={{ ...tdStyle, color: '#555' }} onClick={() => setCurrentFilter({ type: 'city', value: item.city })}>{item.city || '-'}</td>
                  {years.map(y => (
                    <td key={y} style={{ ...tdStyle, textArranges: 'center', textAlign: 'center', color: (item[`y${y}`] || 0) > 0 ? '#000' : '#ccc', fontWeight: (item[`y${y}`] || 0) > 0 ? 'bold' : 'normal' }}>
                      {item[`y${y}`] || '-'}
                    </td>
                  ))}
                  <td style={tdStyle}>{item.primeiro_ano || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FOOTER CONTROLS */}
      <div style={{ height: '45px', background: '#f1f1f1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid #ddd', padding: '0 10px', gap: '10px', zIndex: 950 }}>
        <button style={btnFooterStyle} onClick={() => setOffset(Math.max(0, offset - limit))}>«</button>
        <select 
          style={{ fontFamily: 'Bebas Neue', borderRadius: '4px', fontSize: '15px', height: '26px', padding: '0 4px' }} 
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
          <button style={{ ...btnFooterStyle, color: '#e97b78', fontSize: '13px' }} onClick={() => { setSearchTerm(''); setCurrentFilter({ type: null, value: null }); setFilterRatingActive(false); setFilterZeroScoreActive(false); setFilterHighlightActive(false); }}>CLEAR</button>
        )}
        
        <span style={{ fontSize: '14px', marginLeft: 'auto', color: '#555', fontWeight: 'bold' }}>{filteredData.length} ARTISTAS</span>
      </div>

      {/* BUSCA OVERLAY */}
      {showSearch && (
        <div style={{ position: 'fixed', bottom: '45px', left: 0, width: '100%', background: 'white', padding: '8px 15px', boxShadow: '0 -3px 10px rgba(0,0,0,0.15)', zIndex: 999, display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => { setOffset(0); setSearchTerm(e.target.value); }} 
            placeholder="BUSCAR ARTISTA EM TEMPO REAL..." 
            style={{ flex: 1, padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', fontFamily: "'Roboto', sans-serif" }} 
          />
          <button onClick={() => setShowSearch(false)} style={{ background: '#2c3e50', color: 'white', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer' }}>OK</button>
        </div>
      )}

      {/* OVERLAY DE DETALHES LATERAL */}
      {selectedArtist && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '420px', height: '100vh', backgroundColor: '#1e1e1e', color: '#e0e0e0', boxShadow: '-5px 0 25px rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', flexDirection: 'column', fontFamily: "'Roboto', sans-serif" }}>
          <div style={{ padding: '15px', background: '#111', display: 'flex', justifyContent: 'between', alignItems: 'center', borderBottom: '1px solid #333' }}>
            <h2 style={{ margin: 0, color: '#fff', fontSize: '18px', fontFamily: "'Bebas Neue', cursive", letterSpacing: '0.5px' }}>{selectedArtist.toUpperCase()}</h2>
            <button onClick={() => setSelectedArtist(null)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer', marginLeft: 'auto' }}>✕</button>
          </div>
          
          <div style={{ display: 'flex', background: '#222' }}>
            <button onClick={() => setDetailTab('songs')} style={tabBtnStyle(detailTab === 'songs')}>SONGS ({detailData.songs.length})</button>
            <button onClick={() => setDetailTab('albums')} style={tabBtnStyle(detailTab === 'albums')}>ALBUMS ({detailData.albums.length})</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #444', color: '#aaa' }}>
                  <th style={{ padding: '6px 4px', textAlign: 'left', background: 'transparent', position: 'static' }}>{detailTab === 'songs' ? 'TRACK' : 'ALBUM'}</th>
                  <th onClick={() => setDetailSortAsc(!detailSortAsc)} style={{ padding: '6px 4px', textAlign: 'right', cursor: 'pointer', background: 'transparent', position: 'static' }}>SCROBBLES ⇅</th>
                </tr>
              </thead>
              <tbody>
                {(detailTab === 'songs' ? detailData.songs : detailData.albums)
                  .sort((a, b) => detailSortAsc ? a.scrobbles - b.scrobbles : b.scrobbles - a.scrobbles)
                  .map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #2a2a2a' }}>
                      <td style={{ padding: '6px 4px', maxWidth: '28px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 'bold', color: '#fff' }}>{detailTab === 'songs' ? row.track_name : row.album_name}</span>
                        {detailTab === 'songs' && <div style={{ fontSize: '11px', color: '#888' }}>{row.album_name || '[Single]'}</div>}
                      </td>
                      <td style={{ padding: '6px 4px', textAlign: 'right', color: '#1DB954', fontWeight: 'bold' }}>{row.scrobbles}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE RATING */}
      {ratingArtist && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001, fontFamily: "'Roboto', sans-serif" }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '6px', width: '280px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 5px 0', fontFamily: "'Bebas Neue', cursive", fontSize: '20px' }}>{ratingArtist}</h3>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 15px 0' }}>Selecione o nível de inclusão:</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
              <button onClick={() => submitRating(-1)} style={{ padding: '6px 12px', background: '#1DB954', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>★ INCLUIR</button>
              <button onClick={() => submitRating(-3)} style={{ padding: '6px 12px', background: '#e97b78', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>✕ BARRAR</button>
            </div>
            <button style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '12px' }} onClick={() => setRatingArtist(null)}>CANCELAR</button>
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
const btnFooterStyle = { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '2px 8px', display: 'flex', alignItems: 'center', height: '100%', fontFamily: "'Bebas Neue', cursive" };
const tabBtnStyle = (active) => ({ background: active ? '#1DB954' : '#eee', color: active ? 'white' : '#333', border: 'none', padding: '10px 5px', fontFamily: "'Bebas Neue', cursive", cursor: 'pointer', flex: 1, fontSize: '14px' });

const thFixedStyle = (pos, left, width, align = 'left') => ({
  background: '#f1f1f1', position: 'sticky', top: 0, left: left, width: width, minWidth: width, maxWidth: width, zIndex: 910, padding: '4px 1px', borderBottom: '2px solid #ddd', textAlign: align
});

const tdFixedStyle = (pos, left, width, align, color, index) => ({
  position: 'sticky', left: left, width: width, minWidth: width, maxWidth: width, zIndex: 400, backgroundColor: index % 2 === 0 ? '#fff' : '#f8f8f8', color: color, textAlign: align, padding: '3px 1px', borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap', lineHeight: '1.2'
});
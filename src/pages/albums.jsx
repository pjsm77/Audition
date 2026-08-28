import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';

const ITEMS_PER_PAGE = 30;

// Mapeamento de cores oficial atualizado
const getNameColor = (artistRatingNew) => {
  if (!artistRatingNew) return "#4d388c"; // pH 13 (Na coleção, mas rating_new ainda é NULL/Pendente)

  const val = String(artistRatingNew).toUpperCase().trim();

  if (val === 'A') return "#6dbe99"; // Verde
  if (val === 'B') return "#a3e04d"; // Verde-Lima (pH 4)
  if (val === 'C') return "#f8c039"; // Amarelo
  if (val === 'D') return "#e97b78"; // Vermelho

  return "#AAAAAA"; // Fallback cinza
};

// Dicionário de tradução de países integrado para renderização das bandeiras
const countryMap = {
  "[desconhecido]": "unknown", "afeganistão": "af", "áfrica do sul": "za", "alemanha": "de", 
  "andorra": "ad", "argélia": "dz", "argentina": "ar", "armênia": "am", "austrália": "au",
  "áustria": "at", "azerbaijão": "az", "bangladesh": "bd", "barbados": "bb", "bélgica": "be", 
  "bolívia": "bo", "bósnia e herzegovina": "ba", "brasil": "br", "bulgária": "bg", "canadá": "ca", 
  "chile": "cl", "china": "cn", "colômbia": "co", "coreia do sul": "kr", "costa rica": "cr", 
  "croácia": "hr", "cuba": "cu", "dinamarca": "dk", "egito": "eg", "emirados árabes unidos": "ae", 
  "equador": "ec", "escócia": "gb-sct", "eslováquia": "sk", "eslovênea": "si", "espanha": "es", 
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

export default function Albums() {
  // --- ESTADOS GLOBAIS DA PÁGINA ---
  const [albums, setAlbums] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [artistAlbumCounts, setArtistAlbumCounts] = useState({});

  // Filtros, Busca e Ordenação Padrão
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState('album_id'); 
  const [sortAsc, setSortAsc] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [page, setPage] = useState(0);

  // Controle de Overlays e Modais
  const [showSearch, setShowSearch] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [modalAlbum, setModalAlbum] = useState(null);
  const [previewCover, setPreviewCover] = useState(null);

  const searchInputRef = useRef(null);

  useEffect(() => {
    async function fetchArtistCounts() {
      const { data, error } = await supabase
        .from('vw_albums_details')
        .select('artist_name');
      
      if (!error && data) {
        const counts = data.reduce((acc, item) => {
          if (item.artist_name) {
            acc[item.artist_name] = (acc[item.artist_name] || 0) + 1;
          }
          return acc;
        }, {});
        setArtistAlbumCounts(counts);
      }
    }
    fetchArtistCounts();
  }, []);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('vw_albums_details')
        .select('*', { count: 'exact' });

      if (search.trim() !== '') {
        query = query.or(`album_name.ilike.%${search}%,artist_name.ilike.%${search}%`);
      }

      if (selectedCountry) query = query.eq('artist_country', selectedCountry);
      if (selectedArtist) query = query.eq('artist_name', selectedArtist);
      if (selectedYear) query = query.eq('album_year', selectedYear);

      let dbColumn = 'id_album';
      if (sortCol === 'date') dbColumn = 'album_date';
      else if (sortCol === 'album_name') dbColumn = 'album_name';
      else if (sortCol === 'artist_name') dbColumn = 'artist_name';
      else if (sortCol === 'album_year') dbColumn = 'album_year';

      query = query.order(dbColumn, { ascending: sortAsc });

      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (!error) {
        setAlbums(data || []);
        setTotalCount(count || 0);
      }
    } catch (err) {
      console.error("Erro na busca de álbuns:", err);
    } finally {
      setLoading(false);
    }
  }, [search, sortCol, sortAsc, selectedCountry, selectedArtist, selectedYear, page]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const handleSort = (targetKey) => {
    if (sortCol === targetKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(targetKey);
      if (targetKey === 'album_id' || targetKey === 'date' || targetKey === 'album_year') {
        setSortAsc(false);
      } else {
        setSortAsc(true);
      }
    }
    setPage(0);
    setShowSortMenu(false);
  };

  const clearFilters = () => {
    setSelectedCountry(null);
    setSelectedArtist(null);
    setSelectedYear(null);
    setSearch('');
    setPage(0);
  };

  const getFlagUrl = (countryName) => {
    if (!countryName) return `https://flagcdn.com/32x24/un.png`;
    const code = countryMap[countryName.toLowerCase().trim()] || "un";
    return `https://flagcdn.com/32x24/${code}.png`;
  };

  const getCoverUrl = (coverId, size = 120) => {
    if (!coverId) return 'https://via.placeholder.com/120?text=Sem+Capa';
    return `https://e-cdns-images.dzcdn.net/images/cover/${coverId}/${size}x${size}.jpg`;
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

  if (loading && albums.length === 0) {
    return <div style={{ padding: '20px', color: '#666', fontSize: '24px', fontFamily: "'Bebas Neue', cursive" }}>CARREGANDO CATÁLOGO DE ÁLBUNS...</div>;
  }

  return (
    <div style={styles.viewWrapper}>
      
      <div style={styles.scrollableContent}>
        <div style={styles.listContainer}>
          {albums.map((album) => {
            const totalArtistAlbums = artistAlbumCounts[album.artist_name] || 1;
            const artistColor = getNameColor(album.artist_rating_new);

            return (
              <div key={album.id_album} style={styles.albumRow}>
                <div style={styles.infoLeft}>
                  <img
                    src={getFlagUrl(album.artist_country)}
                    alt=""
                    onClick={() => { setSelectedCountry(album.artist_country); setPage(0); }}
                    style={styles.flagIcon}
                    title={`Filtrar por ${album.artist_country}`}
                  />
                  
                  <div style={styles.textGroup}>
                    <div style={styles.albumHeaderLine}>
                      <span onClick={() => setModalAlbum(album)} style={styles.albumNameLink}>
                        {album.album_name?.toUpperCase()}
                      </span>
                      <span onClick={() => { setSelectedYear(album.album_year); setPage(0); }} style={styles.albumYearLink}>
                        &nbsp;({album.album_year})
                      </span>
                    </div>
                    
                    <div style={styles.artistLine}>
                      <span 
                        onClick={() => { setSelectedArtist(album.artist_name); setPage(0); }} 
                        style={{ ...styles.artistNameLink, color: artistColor }}
                      >
                        {album.artist_name?.toUpperCase()}
                      </span>
                      <span style={styles.albumCountBracket}> [{totalArtistAlbums}]</span>
                    </div>
                  </div>
                </div>

                <img
                  src={getCoverUrl(album.album_cover, 120)}
                  alt="Cover"
                  onClick={() => setPreviewCover(album.album_cover)}
                  style={styles.coverThumb}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* RODAPÉ FIXO */}
      <div style={styles.footerBar}>
        <button style={styles.btnFooter} onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>«</button>
        
        <select 
          style={styles.footerSelect} 
          value={page + 1} 
          onChange={(e) => setPage(Number(e.target.value) - 1)}
        >
          {Array.from({ length: totalPages }, (_, i) => (
            <option key={i} value={i + 1}>PÁG {i + 1}</option>
          ))}
        </select>
        
        <button style={styles.btnFooter} onClick={() => { if ((page + 1) * ITEMS_PER_PAGE < totalCount) setPage(page + 1); }} disabled={(page + 1) * ITEMS_PER_PAGE >= totalCount}>»</button>
        <button style={styles.btnFooter} onClick={() => { setShowSearch(!showSearch); setShowSortMenu(false); }}>🔍</button>
        <button style={styles.btnFooter} onClick={() => { setShowSortMenu(!showSortMenu); setShowSearch(false); }}>⇅</button>
        
        {(selectedCountry || selectedArtist || selectedYear || search) && (
          <button style={styles.clearBtn} onClick={clearFilters}>CLEAR</button>
        )}
        
        <span style={styles.footerCounter}>{totalCount} ÁLBUNS</span>
      </div>

      {/* OVERLAY DE BUSCA */}
      {showSearch && (
        <div style={styles.searchOverlay}>
          <input 
            ref={searchInputRef}
            type="text" 
            value={search} 
            onChange={(e) => { setPage(0); setSearch(e.target.value); }} 
            placeholder="BUSCAR ÁLBUM OU ARTISTA..." 
            style={styles.searchFieldsInput} 
          />
          <button onClick={() => setShowSearch(false)} style={styles.overlayOkBtn}>OK</button>
        </div>
      )}

      {/* OVERLAY DE ORDENAÇÃO */}
      {showSortMenu && (
        <div style={styles.sortOverlay}>
          <div style={styles.sortOverlayTitle}>ORDENAR LISTA POR:</div>
          <div style={styles.sortGrid}>
            <button onClick={() => handleSort('album_id')} style={styles.sortMenuBtn(sortCol === 'album_id')}>ALBUM ID {sortCol === 'album_id' ? (sortAsc ? '▲' : '▼') : ''}</button>
            <button onClick={() => handleSort('date')} style={styles.sortMenuBtn(sortCol === 'date')}>DATA AUDIÇÃO {sortCol === 'date' ? (sortAsc ? '▲' : '▼') : ''}</button>
            <button onClick={() => handleSort('album_name')} style={styles.sortMenuBtn(sortCol === 'album_name')}>NOME ÁLBUM {sortCol === 'album_name' ? (sortAsc ? '▲' : '▼') : ''}</button>
            <button onClick={() => handleSort('artist_name')} style={styles.sortMenuBtn(sortCol === 'artist_name')}>NOME ARTISTA {sortCol === 'artist_name' ? (sortAsc ? '▲' : '▼') : ''}</button>
            <button onClick={() => handleSort('album_year')} style={styles.sortMenuBtn(sortCol === 'album_year')}>ANO LANÇAMENTO {sortCol === 'album_year' ? (sortAsc ? '▲' : '▼') : ''}</button>
          </div>
        </div>
      )}

      {/* MODAL: Exibição detalhada */}
      {modalAlbum && (
        <div style={styles.modalOverlay} onClick={() => setModalAlbum(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{modalAlbum.album_name?.toUpperCase()}</h2>
            <div style={styles.modalBody}>
              <p><strong>ID DO ÁLBUM:</strong> {modalAlbum.id_album}</p>
              <p><strong>ARTISTA:</strong> {modalAlbum.artist_name?.toUpperCase()}</p>
              <p><strong>RATING DO ARTISTA:</strong> {modalAlbum.artist_rating_new || 'PENDENTE (ROXO)'}</p>
              <p><strong>ANO DE LANÇAMENTO:</strong> {modalAlbum.album_year}</p>
              <p><strong>DURAÇÃO DO ÁLBUM:</strong> {modalAlbum.album_duration || '-'}</p>
              <p><strong>TOTAL DE FAIXAS:</strong> {modalAlbum.total_tracks || '-'}</p>
              <p><strong>IDIOMA:</strong> {modalAlbum.artist_language?.toUpperCase() || '-'}</p>
              <p><strong>ORIGEM:</strong> {modalAlbum.artist_country?.toUpperCase() || '-'}</p>
              <p><strong>DATA DE AUDIÇÃO:</strong> {modalAlbum.album_date ? new Date(modalAlbum.album_date).toLocaleDateString('pt-BR') : '-'}</p>
            </div>
            <button onClick={() => setModalAlbum(null)} style={styles.closeModalBtn}>FECHAR</button>
          </div>
        </div>
      )}

      {/* MODAL: Arte de capa */}
      {previewCover && (
        <div style={styles.modalOverlay} onClick={() => setPreviewCover(null)}>
          <div style={{ padding: '10px', backgroundColor: 'transparent' }} onClick={(e) => e.stopPropagation()}>
            <img 
              src={getCoverUrl(previewCover, 500)} 
              alt="Cover Max" 
              style={styles.modalLongCover} 
              onClick={() => setPreviewCover(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// --- ESTILOS INLINE ---
const styles = {
  viewWrapper: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Bebas Neue', cursive",
    maxWidth: '480px',
    margin: '0 auto',
    backgroundColor: '#fff',
    position: 'relative',
    boxSizing: 'border-box'
  },
  scrollableContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 12px 0 12px',
    boxSizing: 'border-box'
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    paddingBottom: '20px'
  },
  albumRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#f8fafc',
    borderRadius: '14px',
    border: '1px solid #f1f5f9'
  },
  infoLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1
  },
  flagIcon: {
    width: '32px',
    height: '22px',
    borderRadius: '3px',
    cursor: 'pointer',
    border: '0.5px solid #bbb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  textGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  albumHeaderLine: {
    fontSize: '16px',
    color: '#1e293b',
    letterSpacing: '0.3px'
  },
  albumNameLink: {
    cursor: 'pointer'
  },
  albumYearLink: {
    color: '#94a3b8',
    cursor: 'pointer'
  },
  artistLine: {
    fontSize: '13px',
    letterSpacing: '0.3px'
  },
  artistNameLink: {
    cursor: 'pointer'
  },
  albumCountBracket: {
    color: '#94a3b8',
    fontFamily: "'Roboto', sans-serif",
    fontSize: '11px'
  },
  coverThumb: {
    width: '54px',
    height: '54px',
    borderRadius: '10px',
    objectFit: 'cover',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  footerBar: {
    height: '45px',
    background: '#f1f1f1',
    display: 'flex',
    alignItems: 'center',
    justify: 'flex-start',
    borderTop: '1px solid #ddd',
    padding: '0 10px',
    gap: '8px',
    zIndex: 950,
    boxSizing: 'border-box'
  },
  btnFooter: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '2px 6px',
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    fontFamily: "'Bebas Neue', cursive"
  },
  footerSelect: {
    fontFamily: "'Bebas Neue', cursive",
    borderRadius: '4px',
    fontSize: '15px',
    height: '26px',
    padding: '0 4px',
    cursor: 'pointer'
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#e97b78',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: "'Bebas Neue', cursive",
    height: '100%'
  },
  footerCounter: {
    fontSize: '14px',
    marginLeft: 'auto',
    color: '#555',
    fontWeight: 'bold',
    letterSpacing: '0.3px'
  },
  searchOverlay: {
    position: 'fixed',
    bottom: '45px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '480px',
    background: 'white',
    padding: '8px 15px',
    boxShadow: '0 -3px 10px rgba(0,0,0,0.15)',
    zIndex: 999,
    display: 'flex',
    gap: '10px',
    boxSizing: 'border-box'
  },
  searchFieldsInput: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
    fontFamily: "'Roboto', sans-serif"
  },
  overlayOkBtn: {
    background: '#2c3e50',
    color: 'white',
    border: 'none',
    padding: '0 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Bebas Neue', cursive",
    fontSize: '14px'
  },
  sortOverlay: {
    position: 'fixed',
    bottom: '45px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '480px',
    background: '#fff',
    padding: '12px 15px',
    boxShadow: '0 -3px 10px rgba(0,0,0,0.15)',
    zIndex: 999,
    boxSizing: 'border-box',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px'
  },
  sortOverlayTitle: {
    fontSize: '14px',
    color: '#555',
    marginBottom: '8px',
    letterSpacing: '0.5px'
  },
  sortGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  sortMenuBtn: (isActive) => ({
    width: '100%',
    textAlign: 'left',
    padding: '8px 12px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: isActive ? '#5d51e7' : '#f1f5f9',
    color: isActive ? '#fff' : '#333',
    fontFamily: "'Bebas Neue', cursive",
    fontSize: '14px',
    cursor: 'pointer',
    letterSpacing: '0.3px',
    transition: 'all 0.15s'
  }),
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    padding: '20px'
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '16px',
    maxWidth: '360px',
    width: '100%',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
  },
  modalTitle: {
    margin: '0 0 12px 0',
    fontSize: '20px',
    color: '#1e293b',
    borderBottom: '2px solid #ddd',
    paddingBottom: '6px'
  },
  modalBody: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: '13px',
    color: '#444',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  closeModalBtn: {
    fontFamily: "'Bebas Neue', cursive",
    width: '100%',
    padding: '10px',
    backgroundColor: '#2c3e50',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '16px',
    letterSpacing: '0.5px'
  },
  modalLongCover: {
    maxWidth: '100%',
    maxHeight: '75vh',
    borderRadius: '12px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
    cursor: 'pointer'
  }
};
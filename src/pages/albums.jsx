import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient'; // Ajustado para o caminho relativo padrão do seu projeto

const ITEMS_PER_PAGE = 30;

// Mapeamento de cores oficial extraído do seu componente de artistas
const getNameColor = (rating) => {
  if (rating === 1) return "#e97b78";
  if (rating === 2) return "#f8c039";
  if (rating === 3) return "#6dbe99";
  return "#AAAAAA";
};

// Dicionário de tradução de países extraído do seu projeto para garantir a renderização das bandeiras
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

export default function Albums() {
  // --- ESTADOS GLOBAIS DA PÁGINA ---
  const [albums, setAlbums] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [artistAlbumCounts, setArtistAlbumCounts] = useState({});

  // Filtros, Busca e Ordenação
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState('album_id'); 
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [page, setPage] = useState(0);

  // Modais / Overlays
  const [modalAlbum, setModalAlbum] = useState(null);
  const [previewCover, setPreviewCover] = useState(null);

  // 1. Carrega o cache de contagem total de álbuns por artista para renderizar os colchetes [X] de forma performática
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

  // 2. Consulta reativa ao Supabase controlando paginação, filtros e ordenações de colunas
  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('vw_albums_details')
        .select('*', { count: 'exact' });

      // Busca Incremental textual
      if (search.trim() !== '') {
        query = query.or(`album_name.ilike.%${search}%,artist_name.ilike.%${search}%`);
      }

      // Aplicação dos filtros rápidos por clique
      if (selectedCountry) {
        query = query.eq('artist_country', selectedCountry);
      }
      if (selectedArtist) {
        query = query.eq('artist_name', selectedArtist);
      }
      if (selectedYear) {
        query = query.eq('album_year', selectedYear);
      }

      // Lógica de ordenação alinhada
      let column = 'id_album';
      let ascending = true;
      if (orderBy === 'date') { column = 'album_date'; ascending = false; }
      else if (orderBy === 'album_name') { column = 'album_name'; ascending = true; }
      else if (orderBy === 'artist_name') { column = 'artist_name'; ascending = true; }
      else if (orderBy === 'album_year') { column = 'album_year'; ascending = false; } // Maiores anos no topo por padrão

      query = query.order(column, { ascending });

      // Cálculo de Paginação offset (30 em 30)
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
  }, [search, orderBy, selectedCountry, selectedArtist, selectedYear, page]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const clearFilters = () => {
    setSelectedCountry(null);
    setSelectedArtist(null);
    setSelectedYear(null);
    setSearch('');
    setPage(0);
  };

  // Helper para buscar a bandeira usando o countryMap idêntico ao de artistas
  const getFlagUrl = (countryName) => {
    if (!countryName) return `https://flagcdn.com/32x24/un.png`;
    const code = countryMap[countryName.toLowerCase().trim()] || "un";
    return `https://flagcdn.com/32x24/${code}.png`;
  };

  // Resgate das capas hospedadas no CDN do Deezer
  const getCoverUrl = (coverId, size = 120) => {
    if (!coverId) return 'https://via.placeholder.com/120?text=Sem+Capa';
    return `https://e-cdns-images.dzcdn.net/images/cover/${coverId}/${size}x${size}.jpg`;
  };

  if (loading && albums.length === 0) {
    return <div style={{ padding: '20px', color: '#666', fontSize: '24px', fontFamily: "'Bebas Neue', cursive" }}>CARREGANDO CATÁLOGO DE ÁLBUNS...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Menu Superior Mapeado do Layout */}
      <div style={styles.headerTabs}>
        <button style={{...styles.tabBtn, ...styles.activeTab}}>ÁLBUNS</button>
        <button style={styles.tabBtn}>BANDAS</button>
        <button style={styles.tabBtn}>OUVIR</button>
        <button style={styles.tabBtn}>ESTATÍSTICAS</button>
        <button style={styles.tabBtn}>PAÍSES</button>
      </div>

      {/* Input de Busca Incremental */}
      <input
        type="text"
        placeholder="PESQUISAR..."
        value={search}
        onChange={handleSearchChange}
        style={styles.searchInput}
      />

      {/* Seletor de Ordenação e Botão de Limpeza */}
      <div style={styles.filterBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={styles.label}>ORDENAR POR:</label>
          <select 
            value={orderBy} 
            onChange={(e) => { setOrderBy(e.target.value); setPage(0); }}
            style={styles.select}
          >
            <option value="album_id">ALBUM ID</option>
            <option value="date">DATA DE AUDIÇÃO</option>
            <option value="album_name">NOME DO ÁLBUM</option>
            <option value="artist_name">NOME DO ARTISTA</option>
            <option value="album_year">ANO DE LANÇAMENTO</option>
          </select>
          <button style={styles.helpBtn}>?</button>
        </div>

        {(selectedCountry || selectedArtist || selectedYear || search) && (
          <button onClick={clearFilters} style={styles.clearFilterBtn}>
            CLEAR
          </button>
        )}
      </div>

      {/* Contador de Registros */}
      <div style={styles.recordsCount}>
        {totalCount} REGISTROS ENCONTRADOS.
      </div>

      {/* Listagem Base com Herança Tipográfica */}
      <div style={styles.listContainer}>
        {albums.map((album) => {
          const totalArtistAlbums = artistAlbumCounts[album.artist_name] || 1;
          const artistColor = getNameColor(album.artist_rating);

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

      {/* Rodapé do Paginador (Casado com a lógica de 30 em 30) */}
      {totalCount > ITEMS_PER_PAGE && (
        <div style={styles.pagination}>
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} style={styles.pageBtn}>«</button>
          <span style={styles.pageIndicator}>PÁG {page + 1} DE {Math.ceil(totalCount / ITEMS_PER_PAGE)}</span>
          <button disabled={(page + 1) * ITEMS_PER_PAGE >= totalCount} onClick={() => setPage(p => p + 1)} style={styles.pageBtn}>»</button>
        </div>
      )}

      {/* MODAL: Exibição completa de metadados da View */}
      {modalAlbum && (
        <div style={styles.modalOverlay} onClick={() => setModalAlbum(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{modalAlbum.album_name?.toUpperCase()}</h2>
            <div style={styles.modalBody}>
              <p><strong>ID DO ÁLBUM:</strong> {modalAlbum.id_album}</p>
              <p><strong>ARTISTA:</strong> {modalAlbum.artist_name?.toUpperCase()} (RATING: {modalAlbum.artist_rating})</p>
              <p><strong>ANO DE LANÇAMENTO:</strong> {modalAlbum.album_year}</p>
              <p><strong>DURAÇÃO DO ÁLBUM:</strong> {modalAlbum.album_duration}</p>
              <p><strong>TOTAL DE FAIXAS:</strong> {modalAlbum.total_tracks}</p>
              <p><strong>IDIOMA:</strong> {modalAlbum.artist_language?.toUpperCase()}</p>
              <p><strong>ORIGEM:</strong> {modalAlbum.artist_country?.toUpperCase()}</p>
              <p><strong>DATA DE ENTRADA:</strong> {modalAlbum.album_date ? new Date(modalAlbum.album_date).toLocaleDateString('pt-BR') : '-'}</p>
            </div>
            <button onClick={() => setModalAlbum(null)} style={styles.closeModalBtn}>FECHAR</button>
          </div>
        </div>
      )}

      {/* MODAL: Visualização ampliada da arte de capa */}
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

// --- ESTILOS INLINE COM IDENTIDADE BEBAS NEUE / ROBOTO MISTURADA ---
const styles = {
  container: {
    fontFamily: "'Bebas Neue', cursive",
    maxWidth: '480px',
    margin: '0 auto',
    backgroundColor: '#fff',
    padding: '12px',
    color: '#333',
    overflowX: 'auto'
  },
  headerTabs: {
    display: 'flex',
    gap: '6px',
    overflowX: 'auto',
    marginBottom: '14px',
    paddingBottom: '4px'
  },
  tabBtn: {
    fontFamily: "'Bebas Neue', cursive",
    padding: '6px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    backgroundColor: '#fff',
    color: '#64748b',
    fontSize: '15px',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    letterSpacing: '0.5px'
  },
  activeTab: {
    backgroundColor: '#5d51e7',
    color: '#fff',
    borderColor: '#5d51e7'
  },
  searchInput: {
    fontFamily: "'Roboto', sans-serif",
    width: '100%',
    padding: '10px 14px',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    boxSizing: 'border-box',
    marginBottom: '14px'
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px'
  },
  label: {
    fontSize: '14px',
    color: '#1e293b',
    letterSpacing: '0.3px'
  },
  select: {
    fontFamily: "'Bebas Neue', cursive",
    padding: '6px 24px 6px 10px',
    borderRadius: '12px',
    border: '2px solid #000',
    fontSize: '14px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    letterSpacing: '0.5px'
  },
  helpBtn: {
    backgroundColor: '#6c5ce7',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    width: '26px',
    height: '26px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  clearFilterBtn: {
    fontFamily: "'Bebas Neue', cursive",
    backgroundColor: '#fee2e2',
    color: '#e97b78',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    letterSpacing: '0.5px'
  },
  recordsCount: {
    fontSize: '15px',
    color: '#64748b',
    marginBottom: '12px',
    letterSpacing: '0.3px'
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
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
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20px',
    gap: '20px',
    padding: '10px 0'
  },
  pageBtn: {
    fontFamily: "'Bebas Neue', cursive",
    padding: '4px 16px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '18px'
  },
  pageIndicator: {
    fontSize: '15px',
    color: '#64748b'
  },
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
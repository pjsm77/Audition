import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../supabaseClient';

const PLAYLIST_ID = '11172145064';
const ITEMS_PER_PAGE = 50; // Paginar colocando 50 registros por página

export default function Discover() {
  // --- ESTADOS GLOBAIS DA PÁGINA ---
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [collectionArtistsIds, setCollectionArtistsIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtros e Busca (Mantendo a paginação e busca do padrão anterior)
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'in_collection', 'not_in_collection'
  const [page, setPage] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

  // Referência para auto-focar o input de busca ao abrir
  const searchInputRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // 1. BUSCAR IDS DOS ARTISTAS NA TBL_ARTISTS DO SUPABASE
        const { data: supabaseArtists, error: sbError } = await supabase
          .from('tbl_artists')
          .select('deezer_id')
          .not('deezer_id', 'is', null);

        if (sbError) throw sbError;

        const artistIdsSet = new Set(
          supabaseArtists
            ?.map(a => a.deezer_id?.toString().trim())
            .filter(Boolean)
        );

        // 2. BUSCAR DADOS DA PLAYLIST DO DEEZER (Preservando a ordem natural da playlist)
        let tracks = [];
        let nextUrl = `https://api.deezer.com/playlist/${PLAYLIST_ID}/tracks`;
        
        let pagesFetched = 0;
        const maxPages = 40; 

        while (nextUrl && pagesFetched < maxPages) {
          const origin = window.location.origin;
          const proxyUrl = `${origin}/api/deezer-proxy?url=${encodeURIComponent(nextUrl)}`;

          const response = await fetch(proxyUrl);
          if (!response.ok) throw new Error(`Falha no proxy interno (Status ${response.status})`);
          
          const data = await response.json();
          
          if (data && data.error) {
            throw new Error(data.error.message || 'Erro retornado pela API do Deezer');
          }

          if (data && data.data && data.data.length > 0) {
            tracks = [...tracks, ...data.data];
            nextUrl = data.next ? data.next : null;
            pagesFetched++;
          } else {
            break;
          }
        }

        setPlaylistTracks(tracks);
        setCollectionArtistsIds(artistIdsSet);
      } catch (err) {
        console.error("Erro na carga do Discover:", err);
        setError(err.message || 'Ocorreu um erro ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Foco automático no input de busca ao abrir o overlay
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // 3. PROCESSAMENTO DE FILTROS E MAPEAMENTO DOS DADOS (Sem ordenação manual para manter a da playlist)
  const allFilteredData = useMemo(() => {
    return playlistTracks
      .map((track, index) => {
        const artistIdStr = track.artist?.id?.toString().trim();
        const isInCollection = artistIdStr ? collectionArtistsIds.has(artistIdStr) : false;
        
        return {
          rowKey: track.id ? `track-${track.id}-${index}` : `idx-${index}`,
          artistName: track.artist?.name || 'ARTISTA SEM NOME',
          artistLink: track.artist?.id ? `https://www.deezer.com/artist/${track.artist.id}` : '#',
          trackTitle: track.title || 'FAIXA SEM TÍTULO',
          albumTitle: track.album?.title || 'ÁLBUM DESCONHECIDO',
          albumLink: track.album?.id ? `https://www.deezer.com/album/${track.album.id}` : '#',
          albumCover: track.album?.cover_medium || '',
          albumYear: track.album?.release_date ? new Date(track.album.release_date).getFullYear() : (track.release_date ? new Date(track.release_date).getFullYear() : ''),
          isInCollection
        };
      })
      .filter(item => {
        const matchesSearch = 
          item.artistName.toLowerCase().includes(search.toLowerCase()) ||
          item.trackTitle.toLowerCase().includes(search.toLowerCase()) ||
          item.albumTitle.toLowerCase().includes(search.toLowerCase());

        if (statusFilter === 'in_collection') return matchesSearch && item.isInCollection;
        if (statusFilter === 'not_in_collection') return matchesSearch && !item.isInCollection;
        
        return matchesSearch;
      });
  }, [playlistTracks, collectionArtistsIds, search, statusFilter]);

  // Paginação aplicada sobre os dados filtrados
  const pagedData = useMemo(() => {
    const from = page * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE;
    return allFilteredData.slice(from, to);
  }, [allFilteredData, page]);

  const totalCount = allFilteredData.length;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

  const handleStatusFilterToggle = () => {
    setPage(0);
    if (statusFilter === 'all') setStatusFilter('not_in_collection');
    else if (statusFilter === 'not_in_collection') setStatusFilter('in_collection');
    else setStatusFilter('all');
  };

  const getStatusFilterLabel = () => {
    if (statusFilter === 'all') return 'STATUS: ALL';
    if (statusFilter === 'not_in_collection') return 'STATUS: PENDING';
    return 'STATUS: COLLECTION';
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPage(0);
  };

  if (loading && playlistTracks.length === 0) {
    return <div style={{ padding: '20px', color: '#666', fontSize: '24px', fontFamily: "'Bebas Neue', cursive" }}>SINCRONIZANDO COM A PLAYLIST DO DEEZER...</div>;
  }

  return (
    <div style={styles.viewWrapper}>
      
      {/* EXIBIÇÃO DE ERRO CASO OCORRA */}
      {error && (
        <div style={{ padding: '10px', backgroundColor: '#fde8e8', color: '#e74c3c', fontSize: '14px', fontFamily: "'Roboto', sans-serif", textAlign: 'center', borderBottom: '1px solid #f5c6cb' }}>
          {error}
        </div>
      )}

      {/* ÁREA DE ROLAGEM INDEPENDENTE */}
      <div style={styles.scrollableContent}>
        <div style={styles.listContainer}>
          {pagedData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '18px' }}>NENHUMA MÚSICA ENCONTRADA</div>
          ) : (
            pagedData.map((item) => (
              <div key={item.rowKey} style={styles.albumRow}>
                <div style={styles.infoLeft}>
                  {/* ÍCONE COM VISTO VERDE OU X VERMELHO NO LUGAR DA BANDEIRA */}
                  <div 
                    style={{
                      ...styles.statusIconContainer,
                      backgroundColor: item.isInCollection ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                      border: item.isInCollection ? '1px solid #2ecc71' : '1px solid #e74c3c'
                    }}
                    title={item.isInCollection ? "Na Coleção" : "Pendente"}
                  >
                    {item.isInCollection ? '✅' : '❌'}
                  </div>
                  
                  <div style={styles.textGroup}>
                    {/* LINHA PRINCIPAL: Nome da Música (abre o álbum no Deezer) */}
                    <div style={styles.albumHeaderLine}>
                      <a 
                        href={item.albumLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={styles.albumNameLink}
                      >
                        {item.trackTitle?.toUpperCase()}
                      </a>
                      <span style={styles.albumYearLink}>
                        &nbsp;({item.albumYear})
                      </span>
                    </div>
                    
                    {/* LINHA SECUNDÁRIA: Nome do Artista (abre o artista no Deezer) - Sem colchetes de contagem */}
                    <div style={styles.artistLine}>
                      <a 
                        href={item.artistLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={styles.artistNameLink}
                      >
                        {item.artistName?.toUpperCase()}
                      </a>
                    </div>
                  </div>
                </div>

                {/* CAPA DA FAIXA */}
                {item.albumCover && (
                  <img
                    src={item.albumCover}
                    alt="Cover"
                    style={styles.coverThumb}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* RODAPÉ FIXO ADAPTADO */}
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
        <button style={styles.btnFooter} onClick={() => setShowSearch(!showSearch)}>🔍</button>
        
        {/* FILTRO DE STATUS NO RODAPÉ */}
        <button style={styles.btnFilterStatus} onClick={handleStatusFilterToggle}>
          {getStatusFilterLabel()}
        </button>

        {/* LINK PARA A PLAYLIST MÃE NO DEEZER VIA ÍCONE */}
        <a 
          href={`https://www.deezer.com/playlist/${PLAYLIST_ID}`}
          target="_blank" 
          rel="noopener noreferrer"
          style={styles.playlistIconLink}
          title="Ver Playlist no Deezer"
        >
          🎵
        </a>
        
        {search && (
          <button style={styles.clearBtn} onClick={clearFilters}>CLEAR</button>
        )}
        
        {/* TOTAL DE TRACKS NO CANTO INFERIOR DIREITO */}
        <span style={styles.footerCounter}>{totalCount} TRACKS</span>
      </div>

      {/* OVERLAY DE BUSCA EM TEMPO REAL */}
      {showSearch && (
        <div style={styles.searchOverlay}>
          <input 
            ref={searchInputRef}
            type="text" 
            value={search} 
            onChange={(e) => { setPage(0); setSearch(e.target.value); }} 
            placeholder="SEARCH TRACK, ARTISTS OR ALBUM..." 
            style={styles.searchFieldsInput} 
          />
          <button onClick={() => setShowSearch(false)} style={styles.overlayOkBtn}>OK</button>
        </div>
      )}

    </div>
  );
}

// --- ARQUITETURA DE ESTILOS INLINE IDENTICA A ALBUMS.JSX ---
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
    flex: 1,
    minWidth: 0 // Evita que textos longos estourem o flexbox
  },
  statusIconContainer: {
    width: '32px',
    height: '24px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    flexNone: 'none',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  textGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    overflow: 'hidden',
    width: '100%'
  },
  albumHeaderLine: {
    fontSize: '16px',
    color: '#1e293b',
    letterSpacing: '0.3px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center'
  },
  albumNameLink: {
    color: '#1e293b',
    textDecoration: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  albumYearLink: {
    color: '#94a3b8',
    fontFamily: "'Bebas Neue', cursive",
    flexShrink: 0
  },
  artistLine: {
    fontSize: '13px',
    letterSpacing: '0.3px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  artistNameLink: {
    color: '#64748b', // Cor neutra estilizada do ecossistema para links secundários
    textDecoration: 'none',
    cursor: 'pointer'
  },
  coverThumb: {
    width: '54px',
    height: '54px',
    borderRadius: '10px',
    objectFit: 'cover',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    marginLeft: '10px',
    flexShrink: 0
  },
  footerBar: {
    height: '45px',
    background: '#f1f1f1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
    padding: '2px 4px',
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
    padding: '0 2px',
    cursor: 'pointer'
  },
  btnFilterStatus: {
    background: '#e2e8f0',
    border: '1px solid #cbd5e1',
    borderRadius: '5px',
    color: '#334155',
    fontSize: '11px',
    padding: '4px 8px',
    cursor: 'pointer',
    fontFamily: "'Bebas Neue', cursive",
    letterSpacing: '0.3px',
    display: 'flex',
    alignItems: 'center',
    height: '26px'
  },
  playlistIconLink: {
    fontSize: '18px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: '0 4px',
    height: '100%'
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
    letterSpacing: '0.3px',
    whiteSpace: 'nowrap'
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
  }
};
// src/pages/deezer_favorites.jsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

export default function DeezerFavorites() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [offset, setOffset] = useState(0);

  const searchInputRef = useRef(null);

  // Ordenação
  const [sortCol, setSortCol] = useState('artist_name');
  const [sortAsc, setSortAsc] = useState(true);

  const limit = 50;

  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  async function fetchFavorites() {
    setLoading(true);

    // Consulta sem estourar o limite de timeout da view
    const { data, error } = await supabase
      .from('vw_deezer_favorites_scrobbles')
      .select('id, title, artist_name, artist_picture, album_title, album_cover, time_add, artist_id, link, dias_ouvida')
      .limit(1000); // Traz as primeiras 1000 músicas rapidamente

    if (error) {
      console.error('Erro ao buscar dados do Supabase:', error);
    } else {
      setTracks(data || []);
    }
    setLoading(false);
  }
  
  const calculateDaysAgo = (timeAdd) => {
    if (!timeAdd) return 999999;
    const addedDate = new Date(timeAdd);
    const today = new Date();
    const diffTime = Math.abs(today - addedDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(col === 'days_fav' || col === 'dias_ouvida' ? false : true);
    }
    setOffset(0);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setOffset(0);
  };

  const filteredTracks = tracks.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.artist_name?.toLowerCase().includes(term) ||
      item.title?.toLowerCase().includes(term) ||
      item.album_title?.toLowerCase().includes(term)
    );
  });

  const sortedTracks = [...filteredTracks].sort((a, b) => {
    if (sortCol === 'days_fav') {
      const daysA = calculateDaysAgo(a.time_add);
      const daysB = calculateDaysAgo(b.time_add);
      return sortAsc ? daysA - daysB : daysB - daysA;
    }

    if (sortCol === 'dias_ouvida') {
      const listenA = Number(a.dias_ouvida) ?? 999999;
      const listenB = Number(b.dias_ouvida) ?? 999999;
      return sortAsc ? listenA - listenB : listenB - listenA;
    }

    const valA = String(a[sortCol] || '');
    const valB = String(b[sortCol] || '');
    return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const pagedTracks = sortedTracks.slice(offset, offset + limit);
  const totalPages = Math.ceil(sortedTracks.length / limit) || 1;

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('artist_name')} style={styles.thArtist}>
                ARTIST {sortCol === 'artist_name' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('title')} style={styles.thTrack}>
                TRACK {sortCol === 'title' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('days_fav')} style={styles.thDays} title="Dias como favorita">
                FAV {sortCol === 'days_fav' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('dias_ouvida')} style={styles.thListen} title="Dias desde a última execução">
                LISTEN {sortCol === 'dias_ouvida' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {pagedTracks.map((item, index) => {
              const daysFav = calculateDaysAgo(item.time_add);
              const daysListen = item.dias_ouvida;

              const artistUrl = item.artist_id
                ? `https://www.deezer.com/artist/${item.artist_id}`
                : `https://www.deezer.com/search/${encodeURIComponent(item.artist_name)}`;
              const trackUrl = item.link || `https://www.deezer.com/track/${item.id}`;

              return (
                <tr
                  key={item.id}
                  style={{
                    ...styles.tr,
                    backgroundColor: index % 2 === 0 ? '#18181b' : '#121214',
                  }}
                >
                  <td style={styles.tdArtist}>
                    <div style={styles.cellFlex}>
                      {item.artist_picture && (
                        <img src={item.artist_picture} alt="" style={styles.artistAvatar} />
                      )}
                      <a
                        href={artistUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.artistLink}
                        title="Abrir no Deezer"
                      >
                        {item.artist_name}
                      </a>
                    </div>
                  </td>

                  <td style={styles.tdTrack}>
                    <div style={styles.cellFlex}>
                      {item.album_cover && (
                        <img src={item.album_cover} alt="" style={styles.albumCover} />
                      )}
                      <div style={{ overflow: 'hidden' }}>
                        <a
                          href={trackUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.trackLink}
                          title="Ouvir no Deezer"
                        >
                          {item.title}
                        </a>
                        {item.album_title && (
                          <div style={styles.albumTitle}>{item.album_title}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td style={styles.tdDays}>
                    {daysFav === 999999 ? '-' : daysFav}
                  </td>

                  <td style={styles.tdListen}>
                    {daysListen === 999999 ? '-' : daysListen}
                  </td>
                </tr>
              );
            })}

            {pagedTracks.length === 0 && (
              <tr>
                <td colSpan="4" style={styles.empty}>
                  NO FAVORITES FOUND.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showSearch && (
        <div style={styles.searchOverlay}>
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setOffset(0);
              setSearchTerm(e.target.value);
            }}
            placeholder="BUSCAR ARTISTA OU MÚSICA..."
            style={styles.searchInputOverlay}
          />
          {searchTerm && (
            <button onClick={clearSearch} style={styles.btnClearSearch}>
              ✕
            </button>
          )}
          <button onClick={() => setShowSearch(false)} style={styles.btnOkSearch}>
            OK
          </button>
        </div>
      )}

      <div style={styles.footer}>
        <button
          style={styles.btnFooter}
          onClick={() => setOffset(Math.max(0, offset - limit))}
          disabled={offset === 0}
        >
          «
        </button>
        <select
          style={styles.selectFooter}
          value={Math.floor(offset / limit) + 1}
          onChange={(e) => setOffset((Number(e.target.value) - 1) * limit)}
        >
          {Array.from({ length: totalPages }, (_, i) => (
            <option key={i} value={i + 1}>
              PÁG {i + 1}
            </option>
          ))}
        </select>
        <button
          style={styles.btnFooter}
          onClick={() => {
            if (offset + limit < sortedTracks.length) setOffset(offset + limit);
          }}
          disabled={offset + limit >= sortedTracks.length}
        >
          »
        </button>

        <button style={styles.btnFooter} onClick={() => setShowSearch(!showSearch)}>
          🔍
        </button>

        {searchTerm && (
          <button style={{ ...styles.btnFooter, color: '#e97b78' }} onClick={clearSearch}>
            ✕
          </button>
        )}

        <span style={styles.footerTotal}>{sortedTracks.length} TRACKS</span>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Bebas Neue', cursive",
    backgroundColor: '#121214',
    color: '#e1e1e6',
    margin: 0,
    padding: 0,
    overflow: 'hidden',
  },
  loading: {
    padding: '20px',
    color: '#666',
    fontSize: '20px',
    fontFamily: "'Bebas Neue', cursive",
    textAlign: 'center',
  },
  tableWrapper: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'auto',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
  },
  thArtist: {
    background: '#18181b',
    position: 'sticky',
    top: 0,
    zIndex: 900,
    padding: '4px 6px',
    borderBottom: '2px solid #323238',
    textAlign: 'left',
    color: '#39b54a',
    fontSize: '13px',
    cursor: 'pointer',
    width: '35%',
  },
  thTrack: {
    background: '#18181b',
    position: 'sticky',
    top: 0,
    zIndex: 900,
    padding: '4px 6px',
    borderBottom: '2px solid #323238',
    textAlign: 'left',
    color: '#39b54a',
    fontSize: '13px',
    cursor: 'pointer',
    width: '37%',
  },
  thDays: {
    background: '#18181b',
    position: 'sticky',
    top: 0,
    zIndex: 900,
    padding: '4px 6px',
    borderBottom: '2px solid #323238',
    textAlign: 'center',
    color: '#39b54a',
    fontSize: '13px',
    cursor: 'pointer',
    width: '14%',
  },
  thListen: {
    background: '#18181b',
    position: 'sticky',
    top: 0,
    zIndex: 900,
    padding: '4px 6px',
    borderBottom: '2px solid #323238',
    textAlign: 'center',
    color: '#39b54a',
    fontSize: '13px',
    cursor: 'pointer',
    width: '14%',
  },
  tr: {
    borderBottom: '1px solid #27272a',
  },
  tdArtist: {
    padding: '3px 4px',
    verticalAlign: 'middle',
  },
  tdTrack: {
    padding: '3px 4px',
    verticalAlign: 'middle',
  },
  tdDays: {
    padding: '3px 4px',
    verticalAlign: 'middle',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#a8a8b3',
  },
  tdListen: {
    padding: '3px 4px',
    verticalAlign: 'middle',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#39b54a',
  },
  cellFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  artistAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0,
  },
  albumCover: {
    width: '24px',
    height: '24px',
    borderRadius: '3px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  artistLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '13px',
    lineHeight: '1.1',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  trackLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '13px',
    lineHeight: '1.1',
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  albumTitle: {
    color: '#71717a',
    fontSize: '9px',
    fontFamily: "'Roboto', sans-serif",
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  empty: {
    textAlign: 'center',
    padding: '2rem',
    color: '#a8a8b3',
    fontSize: '14px',
  },
  searchOverlay: {
    position: 'fixed',
    bottom: '45px',
    left: 0,
    width: '100%',
    backgroundColor: '#18181b',
    padding: '6px 10px',
    boxShadow: '0 -3px 10px rgba(0,0,0,0.5)',
    zIndex: 999,
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    boxSizing: 'border-box',
    borderTop: '1px solid #323238',
  },
  searchInputOverlay: {
    flex: 1,
    padding: '6px 10px',
    borderRadius: '4px',
    border: '1px solid #323238',
    backgroundColor: '#09090b',
    color: '#fff',
    fontSize: '13px',
    fontFamily: "'Roboto', sans-serif",
    outline: 'none',
  },
  btnClearSearch: {
    background: 'none',
    border: 'none',
    color: '#e97b78',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '0 4px',
  },
  btnOkSearch: {
    background: '#39b54a',
    color: 'white',
    border: 'none',
    padding: '0 12px',
    height: '30px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Bebas Neue', cursive",
    fontSize: '14px',
  },
  footer: {
    height: '45px',
    backgroundColor: '#18181b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTop: '1px solid #323238',
    padding: '0 10px',
    gap: '8px',
    zIndex: 950,
  },
  btnFooter: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '2px 6px',
    fontFamily: "'Bebas Neue', cursive",
  },
  selectFooter: {
    fontFamily: "'Bebas Neue', cursive",
    borderRadius: '4px',
    fontSize: '13px',
    height: '26px',
    padding: '0 4px',
    backgroundColor: '#09090b',
    color: '#fff',
    border: '1px solid #323238',
  },
  footerTotal: {
    fontSize: '13px',
    marginLeft: 'auto',
    color: '#39b54a',
    fontWeight: 'bold',
  },
};
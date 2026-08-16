// src/pages/deezer_favorites.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function DeezerFavorites() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [offset, setOffset] = useState(0);
  const [expandedTrackId, setExpandedTrackId] = useState(null);

  // Estados de Ordenação
  const [sortCol, setSortCol] = useState('artist_name');
  const [sortAsc, setSortAsc] = useState(true);

  const limit = 50;

  useEffect(() => {
    fetchFavorites();
  }, []);

  async function fetchFavorites() {
    setLoading(true);

    const { data, error } = await supabase
      .from('tbl_deezer_favorites')
      .select('*')
      .range(0, 2999);

    if (error) {
      console.error('Erro ao buscar dados do Supabase:', error);
    } else {
      setTracks(data || []);
    }
    setLoading(false);
  }

  // Função auxiliar para calcular os dias desde a adição
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
      setSortAsc(col === 'days' ? false : true); // 'days' padrão desc, texto padrão asc
    }
    setOffset(0);
  };

  const toggleDetails = (id) => {
    setExpandedTrackId(expandedTrackId === id ? null : id);
  };

  // Filtro
  const filteredTracks = tracks.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.artist_name?.toLowerCase().includes(term) ||
      item.title?.toLowerCase().includes(term) ||
      item.album_title?.toLowerCase().includes(term)
    );
  });

  // Ordenação
  const sortedTracks = [...filteredTracks].sort((a, b) => {
    if (sortCol === 'days') {
      const daysA = calculateDaysAgo(a.time_add);
      const daysB = calculateDaysAgo(b.time_add);
      return sortAsc ? daysA - daysB : daysB - daysA;
    }

    const valA = String(a[sortCol] || '');
    const valB = String(b[sortCol] || '');
    return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  // Paginação
  const pagedTracks = sortedTracks.slice(offset, offset + limit);
  const totalPages = Math.ceil(sortedTracks.length / limit) || 1;

  if (loading) {
    return <div style={styles.loading}>Loading favorites...</div>;
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentWrapper}>
        <h1 style={styles.title}>Deezer Favorites</h1>

        <input
          type="text"
          placeholder="Search by artist or track..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setOffset(0);
          }}
          style={styles.searchInput}
        />

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th onClick={() => handleSort('artist_name')} style={styles.th}>
                  ARTIST {sortCol === 'artist_name' ? (sortAsc ? '▲' : '▼') : '⇅'}
                </th>
                <th onClick={() => handleSort('title')} style={styles.th}>
                  TRACK {sortCol === 'title' ? (sortAsc ? '▲' : '▼') : '⇅'}
                </th>
                <th onClick={() => handleSort('days')} style={{ ...styles.th, textAlign: 'center', width: '70px' }}>
                  DAYS {sortCol === 'days' ? (sortAsc ? '▲' : '▼') : '⇅'}
                </th>
                <th style={{ ...styles.th, textAlign: 'right', width: '180px' }}>PREVIEW / DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {pagedTracks.map((item) => {
                const isExpanded = expandedTrackId === item.id;
                const daysAgo = calculateDaysAgo(item.time_add);
                const artistUrl = item.artist_id 
                  ? `https://www.deezer.com/artist/${item.artist_id}` 
                  : `https://www.deezer.com/search/${encodeURIComponent(item.artist_name)}`;
                const trackUrl = item.link || `https://www.deezer.com/track/${item.id}`;

                return (
                  <tr key={item.id} style={styles.tr}>
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
                          title="Abrir artista no Deezer"
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
                        <div>
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
                      {daysAgo === 999999 ? '-' : daysAgo}
                    </td>

                    <td style={styles.tdActions}>
                      <div style={styles.actionCell}>
                        {item.preview && (
                          <audio controls src={item.preview} style={styles.audioPlayer}>
                            Your browser does not support audio.
                          </audio>
                        )}
                        <button onClick={() => toggleDetails(item.id)} style={styles.detailsBtn}>
                          {isExpanded ? 'Hide Raw' : 'Raw Data'}
                        </button>
                      </div>

                      {isExpanded && (
                        <pre style={styles.rawData}>
                          {JSON.stringify(item.raw_data || item, null, 2)}
                        </pre>
                      )}
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
      </div>

      {/* RODAPÉ DO PAGINADOR (Padrão 50 por página) */}
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

        <span style={styles.footerTotal}>{sortedTracks.length} TRACKS</span>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: "'Bebas Neue', cursive",
    backgroundColor: '#121214',
    color: '#e1e1e6',
  },
  contentWrapper: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem',
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '1rem',
    textAlign: 'center',
    color: '#fff',
    letterSpacing: '1px',
  },
  searchInput: {
    width: '100%',
    padding: '0.8rem 1rem',
    borderRadius: '8px',
    border: '1px solid #323238',
    backgroundColor: '#202024',
    color: '#fff',
    fontSize: '1rem',
    marginBottom: '1rem',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: "'Roboto', sans-serif",
  },
  loading: {
    padding: '20px',
    color: '#666',
    fontSize: '24px',
    fontFamily: "'Bebas Neue', cursive",
    textAlign: 'center',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
    backgroundColor: '#202024',
    borderRadius: '8px',
    border: '1px solid #323238',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '12px 14px',
    borderBottom: '2px solid #323238',
    color: '#39b54a',
    fontSize: '1rem',
    letterSpacing: '0.5px',
    cursor: 'pointer',
    userSelect: 'none',
    backgroundColor: '#18181b',
  },
  tr: {
    borderBottom: '1px solid #29292e',
  },
  tdArtist: {
    padding: '10px 14px',
    verticalAlign: 'middle',
    width: '28%',
  },
  tdTrack: {
    padding: '10px 14px',
    verticalAlign: 'middle',
    width: '38%',
  },
  tdDays: {
    padding: '10px 14px',
    verticalAlign: 'middle',
    textAlign: 'center',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#a8a8b3',
  },
  tdActions: {
    padding: '10px 14px',
    verticalAlign: 'middle',
  },
  cellFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  artistAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  albumCover: {
    width: '40px',
    height: '40px',
    borderRadius: '4px',
    objectFit: 'cover',
  },
  artistLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '1.1rem',
    fontWeight: 'bold',
  },
  trackLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '1.05rem',
  },
  albumTitle: {
    color: '#8d8d99',
    fontSize: '0.85rem',
    fontFamily: "'Roboto', sans-serif",
  },
  actionCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px',
  },
  audioPlayer: {
    height: '26px',
    width: '180px',
  },
  detailsBtn: {
    background: 'transparent',
    border: '1px solid #39b54a',
    color: '#39b54a',
    padding: '2px 6px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontFamily: "'Bebas Neue', cursive",
  },
  rawData: {
    backgroundColor: '#121214',
    padding: '8px',
    marginTop: '8px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: '#39b54a',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  empty: {
    textAlign: 'center',
    padding: '2rem',
    color: '#a8a8b3',
    fontSize: '1.2rem',
  },
  footer: {
    height: '45px',
    backgroundColor: '#18181b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTop: '1px solid #323238',
    padding: '0 15px',
    gap: '10px',
    zIndex: 950,
  },
  btnFooter: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '2px 8px',
    fontFamily: "'Bebas Neue', cursive",
  },
  selectFooter: {
    fontFamily: "'Bebas Neue', cursive",
    borderRadius: '4px',
    fontSize: '15px',
    height: '26px',
    padding: '0 6px',
    backgroundColor: '#202024',
    color: '#fff',
    border: '1px solid #323238',
  },
  footerTotal: {
    fontSize: '14px',
    marginLeft: 'auto',
    color: '#39b54a',
    fontWeight: 'bold',
  },
};
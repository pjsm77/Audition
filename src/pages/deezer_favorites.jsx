import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Tenta obter de projetos Vite (VITE_) ou Create React App (REACT_APP_)
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

// Inicialização segura para não quebrar a aplicação caso as variáveis faltem
const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

export default function DeezerFavorites() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTrackId, setExpandedTrackId] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  async function fetchFavorites() {
    if (!supabase) {
      console.error("Supabase não foi configurado. Verifique as variáveis de ambiente.");
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('deezer_favorites')
      .select('*')
      .order('artist_name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar dados do Supabase:', error);
    } else {
      setTracks(data || []);
    }
    setLoading(false);
  }


  const toggleDetails = (id) => {
    setExpandedTrackId(expandedTrackId === id ? null : id);
  };

  const filteredTracks = tracks.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.artist_name?.toLowerCase().includes(term) ||
      item.title?.toLowerCase().includes(term)
    );
  });

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Deezer Favorites</h1>

      <input
        type="text"
        placeholder="Search by artist or track..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.searchInput}
      />

      {loading ? (
        <div style={styles.loading}>Loading tracks...</div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Artist</th>
                <th style={styles.th}>Track</th>
                <th style={styles.th}>Preview / Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredTracks.map((item) => {
                const isExpanded = expandedTrackId === item.id;
                return (
                  <tr key={item.id} style={styles.tr}>
                    <td style={styles.tdArtist}>
                      <div style={styles.artistCell}>
                        {item.artist_picture && (
                          <img
                            src={item.artist_picture}
                            alt={item.artist_name}
                            style={styles.artistAvatar}
                          />
                        )}
                        <span>{item.artist_name}</span>
                      </div>
                    </td>
                    <td style={styles.tdTrack}>
                      <div style={styles.trackCell}>
                        {item.album_cover && (
                          <img
                            src={item.album_cover}
                            alt={item.album_title || item.title}
                            style={styles.albumCover}
                          />
                        )}
                        <div>
                          <div style={styles.trackTitle}>{item.title}</div>
                          {item.album_title && (
                            <div style={styles.albumTitle}>{item.album_title}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={styles.tdActions}>
                      <div style={styles.actionCell}>
                        {item.preview && (
                          <audio controls src={item.preview} style={styles.audioPlayer}>
                            Your browser does not support audio.
                          </audio>
                        )}
                        <button
                          onClick={() => toggleDetails(item.id)}
                          style={styles.detailsBtn}
                        >
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

              {!loading && filteredTracks.length === 0 && (
                <tr>
                  <td colSpan="3" style={styles.empty}>
                    No favorites found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '2rem 1rem',
    color: '#e1e1e6',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '1.5rem',
    textAlign: 'center',
    color: '#fff',
  },
  searchInput: {
    width: '100%',
    padding: '0.8rem 1rem',
    borderRadius: '8px',
    border: '1px solid #323238',
    backgroundColor: '#202024',
    color: '#fff',
    fontSize: '1rem',
    marginBottom: '1.5rem',
    boxSizing: 'border-box',
    outline: 'none',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#a8a8b3',
  },
  empty: {
    textAlign: 'center',
    padding: '2rem',
    color: '#a8a8b3',
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
    padding: '12px 16px',
    borderBottom: '2px solid #323238',
    color: '#39b54a',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #29292e',
  },
  tdArtist: {
    padding: '12px 16px',
    verticalAlign: 'top',
    fontWeight: 'bold',
    color: '#fff',
    width: '30%',
  },
  tdTrack: {
    padding: '12px 16px',
    verticalAlign: 'top',
    width: '40%',
  },
  tdActions: {
    padding: '12px 16px',
    verticalAlign: 'top',
    width: '30%',
  },
  artistCell: {
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
  trackCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  albumCover: {
    width: '44px',
    height: '44px',
    borderRadius: '4px',
    objectFit: 'cover',
  },
  trackTitle: {
    color: '#fff',
    fontWeight: '500',
  },
  albumTitle: {
    color: '#a8a8b3',
    fontSize: '0.85rem',
    marginTop: '2px',
  },
  actionCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'flex-start',
  },
  audioPlayer: {
    height: '28px',
    width: '100%',
    maxWidth: '220px',
  },
  detailsBtn: {
    background: 'transparent',
    border: '1px solid #39b54a',
    color: '#39b54a',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem',
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
};
// src/pages/top10.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Top10Charts() {
  // Estados para controle de período, navegação e dados
  const [period, setPeriod] = useState('monthly'); // 'monthly' ou 'annually'
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)); // Inicia em Novembro 2025
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Aba ativa no Mobile para ver um ou outro sem rolar a tela (Padrão: Artists)
  const [activeTabMobile, setActiveTabMobile] = useState('artists');

  const formatPeriodLabel = (date) => {
    if (period === 'annually') {
      return date.getFullYear().toString();
    }
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }).toUpperCase();
  };

  const handlePrev = () => {
    setCurrentDate(prev => period === 'monthly' 
      ? new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
      : new Date(prev.getFullYear() - 1, prev.getMonth(), 1)
    );
  };

  const handleNext = () => {
    setCurrentDate(prev => period === 'monthly' 
      ? new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
      : new Date(prev.getFullYear() + 1, prev.getMonth(), 1)
    );
  };

  useEffect(() => {
    async function fetchTop10Data() {
      setLoading(true);
      const targetYear = currentDate.getFullYear();
      const targetMonth = currentDate.getMonth() + 1;

      const artistView = period === 'monthly' ? 'vw_top_artists_monthly' : 'vw_top_artists_annually';
      const songView = period === 'monthly' ? 'vw_top_songs_monthly' : 'vw_top_songs_annually';

      try {
        // Query Artistas
        let artQuery = supabase.from(artistView).select('*').eq('year', targetYear);
        if (period === 'monthly') artQuery = artQuery.eq('month', targetMonth);
        
        const { data: artistsData, error: errArt } = await artQuery
          .order('scrobbles', { ascending: false })
          .order('last_scrobble', { ascending: false })
          .limit(10);

        // Query Músicas
        let trackQuery = supabase.from(songView).select('*').eq('year', targetYear);
        if (period === 'monthly') trackQuery = trackQuery.eq('month', targetMonth);

        const { data: tracksData, error: errTrack } = await trackQuery
          .order('scrobbles', { ascending: false })
          .order('last_scrobble', { ascending: false })
          .limit(10);

        if (!errArt) setArtists(artistsData || []);
        if (!errTrack) setTracks(tracksData || []);

      } catch (error) {
        console.error("Erro ao buscar dados do Top 10:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTop10Data();
  }, [currentDate, period]);

  const renderFlag = (countryCode) => {
    if (!countryCode) return <span style={styles.flagPlaceholder}>—</span>;
    const code = countryCode.toLowerCase();
    return (
      <img 
        src={`https://flagcdn.com/16x12/${code}.png`} 
        srcSet={`https://flagcdn.com/32x24/${code}.png 2x`}
        width="15" 
        height="11" 
        alt={countryCode}
        style={styles.flagImage}
      />
    );
  };

  return (
    <div className="top10-page-container" style={styles.container}>
      
      {/* 1. Seletores Superiores de Período (Monthly / Annually) */}
      <div style={styles.periodTabs}>
        <span 
          onClick={() => setPeriod('monthly')} 
          style={{...styles.tabLink, ...(period === 'monthly' ? styles.tabActive : {})}}
        >
          Monthly
        </span>
        <span 
          onClick={() => setPeriod('annually')} 
          style={{...styles.tabLink, ...(period === 'annually' ? styles.tabActive : {})}}
        >
          Annually
        </span>
      </div>

      {/* 2. Barra de Navegação Temporal (Setas + Data) */}
      <div style={styles.navigationRow}>
        <button onClick={handlePrev} style={styles.arrowBtn}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 style={styles.periodTitle}>{formatPeriodLabel(currentDate)}</h2>
        <button onClick={handleNext} style={styles.arrowBtn}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* 3. Sub-abas exclusivas para Mobile (Evitam a rolagem vertical da tela) */}
      <div style={styles.mobileToggleRow}>
        <button 
          onClick={() => setActiveTabMobile('artists')}
          style={{...styles.mobileTabButton, ...(activeTabMobile === 'artists' ? styles.mobileTabButtonActive : {})}}
        >
          TOP 10 ARTISTS
        </button>
        <button 
          onClick={() => setActiveTabMobile('tracks')}
          style={{...styles.mobileTabButton, ...(activeTabMobile === 'tracks' ? styles.mobileTabButtonActive : {})}}
        >
          TOP 10 TRACKS
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>LOADING DATA...</div>
      ) : (
        <div style={styles.tablesGrid}>
          
          {/* COLUNA: TOP 10 ARTISTS (Visível no Desktop ou se aba ativa no Mobile) */}
          <div style={{
            ...styles.section, 
            display: activeTabMobile === 'artists' ? 'block' : 'none'
          }} className="desktop-visible-block">
            <div style={styles.sectionHeader}>
              <span>TOP 10 ARTISTS</span>
              <span style={styles.headerRightScrobbles}>SRC</span>
            </div>
            <ol style={styles.list}>
              {artists.map((item, index) => (
                <li 
                  key={item.artist + index} 
                  style={{
                    ...styles.listItem, 
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f8f8'
                  }}
                >
                  <span style={styles.rank}>{index + 1}</span>
                  <span style={styles.flagWrapper}>{renderFlag(item.country_code || item.country)}</span>
                  <span style={styles.itemName}>{item.artist}</span>
                  <span style={styles.count}>{item.scrobbles}</span>
                </li>
              ))}
              {artists.length === 0 && <p style={styles.noData}>NO ENTRIES FOUND</p>}
            </ol>
          </div>

          {/* COLUNA: TOP 10 TRACKS (Visível no Desktop ou se aba ativa no Mobile) */}
          <div style={{
            ...styles.section, 
            display: activeTabMobile === 'tracks' ? 'block' : 'none'
          }} className="desktop-visible-block">
            <div style={styles.sectionHeader}>
              <span>TOP 10 TRACKS</span>
              <span style={styles.headerRightSongScrobbles}>SCR</span>
              <span style={styles.headerArtistLabel}>ART</span>
            </div>
            <ol style={styles.list}>
              {tracks.map((item, index) => (
                <li 
                  key={item.song + index} 
                  style={{
                    ...styles.listItem, 
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f8f8'
                  }}
                >
                  <span style={styles.rank}>{index + 1}</span>
                  <span style={styles.flagWrapper}>{renderFlag(item.country_code || item.country)}</span>
                  <div style={styles.songMetaWrapper}>
                    <span style={styles.itemName}>{item.song}</span>
                    <span style={styles.artistMobileSubLabel}>{item.artist}</span>
                  </div>
                  <span style={styles.count}>{item.scrobbles}</span>
                  <span style={styles.artistDesktopLabel}>{item.artist}</span>
                </li>
              ))}
              {tracks.length === 0 && <p style={styles.noData}>NO ENTRIES FOUND</p>}
            </ol>
          </div>

        </div>
      )}

      {/* Injeção de Media Query CSS nativa para tratar a responsividade lado-a-lado no Desktop */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 768px) {
          .top10-page-container .desktop-visible-block {
            display: block !important;
          }
          .top10-page-container [class*="mobileToggleRow"] {
            display: none !important;
          }
          .top10-page-container [class*="tablesGrid"] {
            flex-direction: row !important;
            gap: 25px !important;
          }
          .top10-page-container [class*="artistMobileSubLabel"] {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .top10-page-container [class*="artistDesktopLabel"] {
            display: none !important;
          }
          .top10-page-container [class*="headerArtistLabel"] {
            display: none !important;
          }
          .top10-page-container [class*="headerRightSongScrobbles"] {
            margin-right: 5px !important;
          }
        }
      `}} />

    </div>
  );
}

// Estilos extraídos estritamente baseados na densidade de dados do artists.jsx
const styles = {
  container: {
    padding: '12px 8px',
    maxWidth: '1000px',
    margin: '0 auto',
    color: '#000',
    backgroundColor: '#fff',
    overflowY: 'auto', // Permite rolar caso a viewport seja extremamente pequena
    minHeight: '100vh'
  },
  periodTabs: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    fontSize: '18px',
    marginBottom: '8px',
    textTransform: 'uppercase',
    fontFamily: "'Bebas Neue', cursive"
  },
  tabLink: {
    cursor: 'pointer',
    color: '#aaa',
    paddingBottom: '1px',
    borderBottom: '2px solid transparent'
  },
  tabActive: {
    color: '#39b54a', // Padrão Verde do Charts do App
    borderColor: '#39b54a'
  },
  navigationRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '14px'
  },
  arrowBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    color: '#000'
  },
  periodTitle: {
    fontSize: '22px',
    margin: 0,
    minWidth: '80px',
    textAlign: 'center',
    fontFamily: "'Bebas Neue', cursive",
    letterSpacing: '0.5px'
  },
  mobileToggleRow: {
    display: 'flex',
    border: '1px solid #e0e0e0',
    marginBottom: '12px',
    borderRadius: '0px' // Mantendo o padrão reto de cantos do site
  },
  mobileTabButton: {
    flex: 1,
    padding: '8px 0',
    border: 'none',
    background: '#f1f1f1',
    fontFamily: "'Bebas Neue', cursive",
    fontSize: '15px',
    color: '#666',
    cursor: 'pointer'
  },
  mobileTabButtonActive: {
    background: '#2c3e50',
    color: '#fff'
  },
  loading: {
    textAlign: 'center',
    fontSize: '14px',
    padding: '40px 0',
    fontFamily: "'Bebas Neue', cursive",
    color: '#666'
  },
  tablesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0px'
  },
  section: {
    flex: 1,
    width: '100%'
  },
  sectionHeader: {
    display: 'flex',
    borderBottom: '2px solid #ddd',
    paddingBottom: '3px',
    marginBottom: '2px',
    fontSize: '14px',
    fontFamily: "'Bebas Neue', cursive",
    color: '#000'
  },
  headerRightScrobbles: {
    marginLeft: 'auto',
    marginRight: '5px'
  },
  headerRightSongScrobbles: {
    marginLeft: 'auto',
    marginRight: '105px'
  },
  headerArtistLabel: {
    width: '90px',
    textAlign: 'left'
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    border: '1px solid #e0e0e0'
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 6px', // Compacto igual ao tdFixedStyle do artists.jsx
    fontSize: '13px',
    borderBottom: '1px solid #e0e0e0',
    fontFamily: "'Bebas Neue', cursive",
    lineHeight: '1.2'
  },
  rank: {
    width: '20px',
    color: '#888'
  },
  flagWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '8px',
    width: '16px',
    justifyContent: 'center'
  },
  flagImage: {
    boxShadow: '0 1px 2px rgba(0,0,0,0.15)'
  },
  flagPlaceholder: {
    fontSize: '11px',
    color: '#ccc'
  },
  songMetaWrapper: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  itemName: {
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#000'
  },
  artistMobileSubLabel: {
    fontSize: '10px',
    color: '#777',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    marginTop: '1px'
  },
  count: {
    marginLeft: 'auto',
    width: '35px',
    textAlign: 'right',
    color: '#39b54a'
  },
  artistDesktopLabel: {
    width: '90px',
    marginLeft: '15px',
    textAlign: 'left',
    textTransform: 'uppercase',
    color: '#555',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  noData: {
    fontSize: '13px',
    color: '#888',
    padding: '10px',
    margin: 0,
    textAlign: 'center',
    fontFamily: "'Bebas Neue', cursive"
  }
};
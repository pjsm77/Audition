// src/pages/top10.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Top10Charts() {
  const [period, setPeriod] = useState('monthly'); // 'monthly' ou 'annually'
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)); // Mês padrão: Novembro 2025
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Reseta o filtro voltando instantaneamente para o mês corrente padrão (Nov 2025)
  const handleResetToCurrent = () => {
    setCurrentDate(new Date(2025, 10, 1));
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
        width="14" 
        height="10" 
        alt={countryCode}
        style={styles.flagImage}
      />
    );
  };

  return (
    <div className="top10-compact-page" style={styles.container}>
      
      {/* Linha Única Superior de Controle e Filtros */}
      <div style={styles.controlHeaderRow}>
        
        {/* Esquerda: Tipo de Filtro Temporal */}
        <div style={styles.periodTabsLeft}>
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

        {/* Direita: Navegação + Ícone de Mês Atual */}
        <div style={styles.navigationRight}>
          <button onClick={handlePrev} style={styles.arrowBtn} aria-label="Anterior">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          
          <h2 style={styles.periodTitle}>{formatPeriodLabel(currentDate)}</h2>
          
          <button onClick={handleNext} style={styles.arrowBtn} aria-label="Próximo">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Ícone para retornar ao mês/período atual */}
          <button onClick={handleResetToCurrent} style={styles.todayBtn} title="Voltar ao período atual">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>LOADING...</div>
      ) : (
        <div style={styles.tablesVerticalStack}>
          
          {/* BLOCO 1: TOP 10 ARTISTS */}
          <div style={styles.section}>
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

          {/* BLOCO 2: TOP 10 TRACKS */}
          <div style={styles.section}>
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
                  <span style={styles.itemName}>{item.song}</span>
                  <span style={styles.count}>{item.scrobbles}</span>
                  <span style={styles.artistDesktopLabel}>{item.artist}</span>
                </li>
              ))}
              {tracks.length === 0 && <p style={styles.noData}>NO ENTRIES FOUND</p>}
            </ol>
          </div>

        </div>
      )}

      {styleInjection}
    </div>
  );
}

// Injeção de Media Queries específicas para layout mobile condensado (em linha única)
const styleInjection = (
  <style dangerouslySetInnerHTML={{__html: `
    @media (max-width: 767px) {
      .top10-compact-page [class*="artistDesktopLabel"] {
        display: block !important;
        width: 85px !important;
        min-width: 85px !important;
        max-width: 85px !important;
        margin-left: 10px !important;
        font-size: 11px !important;
      }
      .top10-compact-page [class*="headerArtistLabel"] {
        display: block !important;
        width: 85px !important;
        margin-left: 10px !important;
        font-size: 12px !important;
      }
      .top10-compact-page [class*="headerRightSongScrobbles"] {
        margin-right: 0px !important;
      }
      .top10-compact-page [class*="count"] {
        width: 30px !important;
      }
    }
  `}} />
);

// Objeto de estilos comprimido baseado nas especificações exatas do artists.jsx
const styles = {
  container: {
    padding: '4px 6px',
    maxWidth: '680px',
    margin: '0 auto',
    color: '#000',
    backgroundColor: '#fff',
    minHeight: '100vh'
  },
  controlHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'between',
    width: '100%',
    borderBottom: '1px solid #eee',
    paddingBottom: '3px',
    marginBottom: '8px'
  },
  periodTabsLeft: {
    display: 'flex',
    gap: '15px',
    fontSize: '15px',
    fontFamily: "'Bebas Neue', cursive",
    textTransform: 'uppercase',
    flex: 1
  },
  tabLink: {
    cursor: 'pointer',
    color: '#aaa',
    transition: 'color 0.1s ease'
  },
  tabActive: {
    color: '#39b54a', // Padrão verde do Charts do sistema
    fontWeight: 'bold'
  },
  navigationRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
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
  todayBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    color: '#39b54a',
    marginLeft: '2px'
  },
  periodTitle: {
    fontSize: '17px',
    margin: 0,
    minWidth: '55px',
    textAlign: 'center',
    fontFamily: "'Bebas Neue', cursive",
    letterSpacing: '0.3px',
    color: '#000'
  },
  loading: {
    textAlign: 'center',
    fontSize: '13px',
    padding: '30px 0',
    fontFamily: "'Bebas Neue', cursive",
    color: '#888'
  },
  tablesVerticalStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px' // Espaçamento enxuto entre os dois blocos
  },
  section: {
    width: '100%'
  },
  sectionHeader: {
    display: 'flex',
    borderBottom: '2px solid #ddd',
    paddingBottom: '2px',
    marginBottom: '2px',
    fontSize: '13px',
    fontFamily: "'Bebas Neue', cursive",
    color: '#000'
  },
  headerRightScrobbles: {
    marginLeft: 'auto',
    marginRight: '2px'
  },
  headerRightSongScrobbles: {
    marginLeft: 'auto',
    marginRight: '95px' // Mantém o alinhamento correto com os dados
  },
  headerArtistLabel: {
    width: '80px',
    textAlign: 'left'
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    border: '1px solid #e0e0e0',
    borderRadius: '0px' // Cantos estritamente retos conforme artists.jsx
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '3px 5px', // Padding super comprimido tirado do tdFixedStyle do artists.jsx
    fontSize: '13px',
    borderBottom: '1px solid #e0e0e0',
    fontFamily: "'Bebas Neue', cursive",
    lineHeight: '1.2',
    whiteSpace: 'nowrap'
  },
  rank: {
    width: '18px',
    color: '#888'
  },
  flagWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '6px',
    width: '15px',
    justifyContent: 'center'
  },
  flagImage: {
    boxShadow: '0 1px 1px rgba(0,0,0,0.1)'
  },
  flagPlaceholder: {
    fontSize: '10px',
    color: '#ccc'
  },
  itemName: {
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#000',
    flex: 1
  },
  count: {
    marginLeft: 'auto',
    width: '32px',
    textAlign: 'right',
    color: '#39b54a'
  },
  artistDesktopLabel: {
    width: '80px',
    marginLeft: '15px',
    textAlign: 'left',
    textTransform: 'uppercase',
    color: '#555',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  noData: {
    fontSize: '12px',
    color: '#888',
    padding: '8px',
    margin: 0,
    textAlign: 'center',
    fontFamily: "'Bebas Neue', cursive"
  }
};
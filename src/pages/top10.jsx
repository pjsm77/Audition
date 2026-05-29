// src/pages/top10.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Top10Charts() {
  const [period, setPeriod] = useState('monthly'); // 'monthly' ou 'annually'
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dicionário de conversão herdado fielmente de artists.jsx
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

  const handleResetToCurrent = () => {
    setCurrentDate(new Date());
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

  // Função estrita de cores baseada em getNameColor de artists.jsx
  const getRatingColor = (rating) => {
    if (!rating) return '#AAAAAA'; // Artista sem rating é cinza #AAAAAA
    const r = Number(rating);
    if (r === 1) return "#e97b78"; // Coral
    if (r === 2) return "#f8c039"; // Amarelo
    if (r === 3) return "#6dbe99"; // Verde
    return "#AAAAAA";
  };

  const renderFlag = (countryValue) => {
    if (!countryValue) return <span style={styles.flagPlaceholder}>—</span>;
    const cleanValue = countryValue.trim().toLowerCase();
    const flagCode = cleanValue.length === 2 ? cleanValue : (countryMap[cleanValue] || "un");

    return (
      <img 
        src={`https://flagcdn.com/16x12/${flagCode}.png`} 
        srcSet={`https://flagcdn.com/32x24/${flagCode}.png 2x`}
        width="14" 
        height="10" 
        alt={countryValue}
        style={styles.flagImage}
      />
    );
  };

  // Função para mapear a URL de destino do artista (Prioridade: Deezer)
  const getArtistLink = (item) => {
    if (item.deezer_id && String(item.deezer_id).trim() !== '') {
      return `https://www.deezer.com/artist/${String(item.deezer_id).trim()}`;
    }
    return item.artist_link || null;
  };

  return (
    <div className="top10-compact-page" style={styles.container}>
      
      {/* Linha Única Superior de Controle e Filtros */}
      <div style={styles.controlHeaderRow}>
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
              {artists.map((item, index) => {
                const artistUrl = getArtistLink(item);
                return (
                  <li 
                    key={item.artist + index} 
                    style={{
                      ...styles.listItem, 
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f8f8'
                    }}
                  >
                    <span style={styles.rank}>{index + 1}</span>
                    <span style={styles.flagWrapper}>{renderFlag(item.country_code || item.cc || item.country)}</span>
                    
                    {/* Nome do Artista com link clicável */}
                    <span style={styles.itemNameWrapper}>
                      {artistUrl ? (
                        <a 
                          href={artistUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{...styles.linkItem, color: getRatingColor(item.rating)}}
                        >
                          {item.artist}
                        </a>
                      ) : (
                        <span style={{color: getRatingColor(item.rating)}}>{item.artist}</span>
                      )}
                    </span>

                    <span style={styles.count}>{item.scrobbles}</span>
                  </li>
                );
              })}
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
              {tracks.map((item, index) => {
                const artistUrl = getArtistLink(item);
                return (
                  <li 
                    key={item.song + index} 
                    style={{
                      ...styles.listItem, 
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f8f8'
                    }}
                  >
                    <span style={styles.rank}>{index + 1}</span>
                    <span style={styles.flagWrapper}>{renderFlag(item.country_code || item.cc || item.country)}</span>
                    
                    {/* Nome da Música com link clicável */}
                    <span style={styles.itemNameWrapper}>
                      {item.song_link ? (
                        <a 
                          href={item.song_link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={styles.linkSongItem}
                        >
                          {item.song}
                        </a>
                      ) : (
                        <span>{item.song}</span>
                      )}
                    </span>

                    <span style={styles.count}>{item.scrobbles}</span>
                    
                    {/* Nome do Artista Lateral com link clicável */}
                    <span style={styles.artistDesktopLabel}>
                      {artistUrl ? (
                        <a 
                          href={artistUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{...styles.linkItem, color: getRatingColor(item.rating)}}
                        >
                          {item.artist}
                        </a>
                      ) : (
                        <span style={{color: getRatingColor(item.rating)}}>{item.artist}</span>
                      )}
                    </span>
                  </li>
                );
              })}
              {tracks.length === 0 && <p style={styles.noData}>NO ENTRIES FOUND</p>}
            </ol>
          </div>

        </div>
      )}

      {styleInjection}
    </div>
  );
}

// Injeção de Media Queries específicas para layout mobile condensado
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
    justifyContent: 'space-between',
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
    color: '#39b54a',
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
    gap: '14px'
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
    marginRight: '95px'
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
    borderRadius: '0px'
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '3px 5px',
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
  itemNameWrapper: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  linkItem: {
    textDecoration: 'none',
    textTransform: 'uppercase',
    outline: 'none',
    cursor: 'pointer',
    display: 'inline-block',
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  linkSongItem: {
    color: '#000000',
    textDecoration: 'none',
    textTransform: 'uppercase',
    outline: 'none',
    cursor: 'pointer',
    display: 'inline-block',
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
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
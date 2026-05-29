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

  // Formata o período exibido no topo (Ex: "NOV 25" ou "2025")
  const formatPeriodLabel = (date) => {
    if (period === 'annually') {
      return date.getFullYear().toString();
    }
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }).toUpperCase();
  };

  // Navegação das setas (retrocede ou avança 1 mês ou 1 ano dependendo do modo)
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

      // Define dinamicamente quais Views ler baseando-se no botão ativo (Monthly ou Annually)
      const artistView = period === 'monthly' ? 'vw_top_artists_monthly' : 'vw_top_artists_annually';
      const songView = period === 'monthly' ? 'vw_top_songs_monthly' : 'vw_top_songs_annually';

      try {
        // 1. Query para o Ranking de Artistas
        let artQuery = supabase.from(artistView).select('*').eq('year', targetYear);
        if (period === 'monthly') artQuery = artQuery.eq('month', targetMonth);
        
        const { data: artistsData, error: errArt } = await artQuery
          .order('scrobbles', { ascending: false })
          .order('last_scrobble', { ascending: false }) // Critério de desempate
          .limit(10);

        // 2. Query para o Ranking de Músicas
        let trackQuery = supabase.from(songView).select('*').eq('year', targetYear);
        if (period === 'monthly') trackQuery = trackQuery.eq('month', targetMonth);

        const { data: tracksData, error: errTrack } = await trackQuery
          .order('scrobbles', { ascending: false })
          .order('last_scrobble', { ascending: false }) // Critério de desempate
          .limit(10);

        if (!errArt) setArtists(artistsData || []);
        if (!errTrack) setTracks(tracksData || []);

        if (errArt) console.error("Erro na view de artistas:", errArt);
        if (errTrack) console.error("Erro na view de músicas:", errTrack);

      } catch (error) {
        console.error("Erro geral na busca do Top 10:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTop10Data();
  }, [currentDate, period]);

  // Renderiza a bandeira do país usando o country_code salvo no banco (Ex: 'AU', 'BR', 'US')
  const renderFlag = (countryCode) => {
    if (!countryCode) return <span style={styles.flagPlaceholder}>—</span>;
    const code = countryCode.toLowerCase();
    return (
      <img 
        src={`https://flagcdn.com/16x12/${code}.png`} 
        srcSet={`https://flagcdn.com/32x24/${code}.png 2x`}
        width="16" 
        height="12" 
        alt={countryCode}
        style={styles.flagImage}
      />
    );
  };

  return (
    <div className="top10-page" style={styles.container}>
      
      {/* Seletores de Período: alteram dinamicamente as views correspondentes */}
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

      {/* Barra de Navegação Temporal */}
      <div style={styles.navigationRow}>
        <button onClick={handlePrev} style={styles.arrowBtn} aria-label="Anterior">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        
        <h2 style={styles.periodTitle}>{formatPeriodLabel(currentDate)}</h2>
        
        <button onClick={handleNext} style={styles.arrowBtn} aria-label="Próximo">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>A carregar dados do banco de dados...</div>
      ) : (
        <div style={styles.tablesGrid}>
          
          {/* TABELA: TOP 10 ARTISTS */}
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
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f7f7f7' // Fundo alternado Branco / Cinza claro
                  }}
                >
                  <span style={styles.rank}>{index + 1}</span>
                  <span style={styles.flagWrapper}>{renderFlag(item.country_code || item.country)}</span>
                  <span style={styles.itemName}>{item.artist}</span>
                  <span style={styles.count}>{item.scrobbles}</span>
                </li>
              ))}
              {artists.length === 0 && <p style={styles.noData}>Nenhum registo encontrado para este período.</p>}
            </ol>
          </div>

          {/* TABELA: TOP 10 TRACKS */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <span>TOP 10 TRACKS</span>
              <span style={styles.headerRightSongScrobbles}>SCR</span>
              <span>ART</span>
            </div>
            <ol style={styles.list}>
              {tracks.map((item, index) => (
                <li 
                  key={item.song + index} 
                  style={{
                    ...styles.listItem, 
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f7f7f7' // Fundo alternado Branco / Cinza claro
                  }}
                >
                  <span style={styles.rank}>{index + 1}</span>
                  <span style={styles.flagWrapper}>{renderFlag(item.country_code || item.country)}</span>
                  <span style={styles.itemName}>{item.song}</span>
                  <span style={styles.count}>{item.scrobbles}</span>
                  <span style={styles.artistLabel}>{item.artist}</span>
                </li>
              ))}
              {tracks.length === 0 && <p style={styles.noData}>Nenhum registo encontrado para este período.</p>}
            </ol>
          </div>

        </div>
      )}
    </div>
  );
}

// Estilos corporativos sincronizados com o padrão visual global do app
const styles = {
  container: {
    padding: '30px 20px',
    maxWidth: '850px',
    margin: '0 auto',
    fontFamily: "'Bebas Neue', Arial, sans-serif",
    letterSpacing: '0.6px',
    color: '#1a1a1a'
  },
  periodTabs: {
    display: 'flex',
    justifyContent: 'center',
    gap: '45px',
    fontSize: '22px',
    marginBottom: '20px',
    textTransform: 'uppercase'
  },
  tabLink: {
    cursor: 'pointer',
    color: '#95a5a6',
    transition: 'color 0.2s ease, border-color 0.2s ease',
    paddingBottom: '2px',
    borderBottom: '2px solid transparent'
  },
  tabActive: {
    color: '#39b54a', // Padrão Verde do item Charts
    borderColor: '#39b54a',
    fontWeight: 'bold'
  },
  navigationRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '35px',
    marginBottom: '35px'
  },
  arrowBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    color: '#2c3e50',
    transition: 'color 0.2s ease'
  },
  periodTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: 0,
    minWidth: '110px',
    textAlign: 'center',
    color: '#2c3e50',
    letterSpacing: '1px'
  },
  loading: {
    textAlign: 'center',
    fontSize: '15px',
    padding: '60px 0',
    fontFamily: 'monospace',
    color: '#7f8c8d'
  },
  tablesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '45px'
  },
  section: {
    width: '100%'
  },
  sectionHeader: {
    display: 'flex',
    fontWeight: 'bold',
    borderBottom: '2px solid #2c3e50',
    paddingBottom: '5px',
    marginBottom: '6px',
    fontSize: '17px',
    color: '#2c3e50'
  },
  headerRightScrobbles: {
    marginLeft: 'auto',
    marginRight: '22px'
  },
  headerRightSongScrobbles: {
    marginLeft: 'auto',
    marginRight: '148px'
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    border: '1px solid #e2e8f0',
    borderRadius: '5px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '11px 16px',
    fontSize: '15px',
    borderBottom: '1px solid #edf2f7',
    fontFamily: 'monospace', // Mantém o alinhamento em grid perfeito dos dados textuais
    letterSpacing: '0px'
  },
  rank: {
    width: '30px',
    fontWeight: 'bold',
    color: '#a0aec0'
  },
  flagWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '14px',
    width: '20px',
    justifyContent: 'center'
  },
  flagImage: {
    borderRadius: '1px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
  },
  flagPlaceholder: {
    fontSize: '13px',
    color: '#cbd5e0'
  },
  itemName: {
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontWeight: '600',
    color: '#2d3748'
  },
  count: {
    marginLeft: 'auto',
    width: '55px',
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#39b54a' // Valor em verde conforme o padrão Charts
  },
  artistLabel: {
    width: '160px',
    marginLeft: '30px',
    textAlign: 'left',
    textTransform: 'uppercase',
    color: '#718096',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '13.5px'
  },
  noData: {
    fontSize: '14px',
    color: '#718096',
    fontStyle: 'italic',
    padding: '20px',
    margin: 0,
    textAlign: 'center',
    backgroundColor: '#fff'
  }
};
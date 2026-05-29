// src/pages/top10.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Ajuste o caminho se o seu cliente do Supabase estiver noutro diretório

export default function Top10Charts() {
  // Define o mês inicial (Maio de 2026, baseado no seu layout)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); 
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formata a data para exibir no cabeçalho (Ex: "MAY 26")
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }).toUpperCase();
  };

  // Funções de navegação das setas (retroceder e avançar meses)
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Efeito que monitoriza a mudança de mês e faz o fetch automático nas Views do banco
  useEffect(() => {
    async function fetchTop10() {
      setLoading(true);
      
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // Ajuste porque os meses em JS vão de 0 a 11

      try {
        // 1. Procura os dados na View de Artistas filtrando pelo ano e mês selecionado
        const { data: artistsData, error: errArt } = await supabase
          .from('view_top10_artists') // Substitua pelo nome exato da sua View de Artistas se for diferente
          .select('*')
          .eq('ano', year)
          .eq('mes', month)
          .order('scrobble_count', { ascending: false })
          .limit(10);

        // 2. Procura os dados na View de Músicas filtrando pelo ano e mês selecionado
        const { data: tracksData, error: errTrack } = await supabase
          .from('view_top10_tracks') // Substitua pelo nome exato da sua View de Músicas se for diferente
          .select('*')
          .eq('ano', year)
          .eq('mes', month)
          .order('scrobble_count', { ascending: false })
          .limit(10);

        if (!errArt) setArtists(artistsData || []);
        if (!errTrack) setTracks(tracksData || []);
        
        if (errArt) console.error("Erro na view de artistas:", errArt);
        if (errTrack) console.error("Erro na view de músicas:", errTrack);

      } catch (error) {
        console.error("Erro ao carregar dados do Top 10:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTop10();
  }, [currentDate]);

  return (
    <div className="top10-container" style={styles.container}>
      {/* Abas de Período */}
      <div style={styles.periodTabs}>
        <span style={{ fontWeight: 'bold', cursor: 'pointer' }}>Monthly</span>
        <span style={{ cursor: 'pointer', opacity: 0.4 }}>Annually</span>
      </div>

      {/* Controlos de Navegação Temporal */}
      <div style={styles.navigationRow}>
        <button onClick={handlePrevMonth} style={styles.arrowBtn} aria-label="Mês anterior">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#000" strokeWidth="1.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        
        <h2 style={styles.monthTitle}>{formatMonthYear(currentDate)}</h2>
        
        <button onClick={handleNextMonth} style={styles.arrowBtn} aria-label="Próximo mês">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#000" strokeWidth="1.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>A carregar dados do banco de dados...</div>
      ) : (
        <div style={styles.tablesGrid}>
          
          {/* SECÇÃO: TOP 10 ARTISTS */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <span>TOP 10 ARTISTS</span>
              <span style={{ marginLeft: 'auto', marginRight: '45px' }}>SRC</span>
            </div>
            <ol style={styles.list}>
              {artists.map((item, index) => (
                <li key={item.artist_id || index} style={styles.listItem}>
                  <span style={styles.rank}>{index + 1}</span>
                  <span style={styles.itemName}>XXX {item.artist_name}</span>
                  <span style={styles.count}>{item.scrobble_count}</span>
                </li>
              ))}
              {artists.length === 0 && <p style={styles.noData}>Nenhum scrobble registado este mês.</p>}
            </ol>
          </div>

          {/* SECÇÃO: TOP 10 TRACKS */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <span>TOP 10 TRACKS</span>
              <span style={{ marginLeft: 'auto', marginRight: '160px' }}>SCR</span>
              <span>ART</span>
            </div>
            <ol style={styles.list}>
              {tracks.map((item, index) => (
                <li key={item.track_id || index} style={styles.listItem}>
                  <span style={styles.rank}>{index + 1}</span>
                  <span style={styles.itemName}>XXX {item.track_title}</span>
                  <span style={styles.count}>{item.scrobble_count}</span>
                  <span style={styles.artistLabel}>{item.artist_name}</span>
                </li>
              ))}
              {tracks.length === 0 && <p style={styles.noData}>Nenhuma música registada este mês.</p>}
            </ol>
          </div>

        </div>
      )}
    </div>
  );
}

// Estilização limpa e minimalista em monospace idêntica ao screenshot informativo
const styles = {
  container: {
    padding: '40px 20px',
    maxWidth: '700px',
    margin: '0 auto',
    fontFamily: 'monospace',
    color: '#000',
    backgroundColor: '#fff'
  },
  periodTabs: {
    display: 'flex',
    justifyContent: 'center',
    gap: '60px',
    fontSize: '15px',
    marginBottom: '30px',
    textTransform: 'uppercase'
  },
  navigationRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '50px',
    marginBottom: '35px'
  },
  arrowBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    outline: 'none'
  },
  monthTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    margin: 0,
    minWidth: '80px',
    textAlign: 'center'
  },
  loading: {
    textAlign: 'center',
    fontSize: '14px',
    padding: '40px 0',
    color: '#666'
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
    borderBottom: '1px solid #000',
    paddingBottom: '5px',
    marginBottom: '10px',
    fontSize: '13px'
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    lineHeight: '1.4'
  },
  rank: {
    width: '25px',
    textAlign: 'left',
    color: '#000'
  },
  itemName: {
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: '10px'
  },
  count: {
    marginLeft: 'auto',
    width: '40px',
    textAlign: 'right',
    fontWeight: 'normal'
  },
  artistLabel: {
    width: '180px',
    marginLeft: '20px',
    textAlign: 'left',
    textTransform: 'uppercase',
    color: '#000',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  noData: {
    fontSize: '12px',
    color: '#777',
    fontStyle: 'italic',
    marginTop: '5px'
  }
};
// src/pages/top10.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Ajuste o caminho se necessário conforme seu projeto

export default function Top10Charts() {
  // Inicializa o mês em Novembro de 2025 (conforme o print do seu app)
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)); 
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formata a data para o cabeçalho (Ex: "NOV 25")
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }).toUpperCase();
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  useEffect(() => {
    async function fetchTop10() {
      setLoading(true);
      
      const targetYear = currentDate.getFullYear();
      const targetMonth = currentDate.getMonth() + 1; // JS conta meses de 0 a 11

      try {
        // 1. Consome a sua View Real de Artistas Mensais
        const { data: artistsData, error: errArt } = await supabase
          .from('vw_top_artists_monthly')
          .select('*')
          .eq('year', targetYear)
          .eq('month', targetMonth)
          .order('scrobbles', { ascending: false })      // Critério principal: Mais reproduções
          .order('last_scrobble', { ascending: false })  // Desempate: Ouvido mais recentemente
          .limit(10);

        // 2. Consome a sua View Real de Músicas Mensais
        const { data: tracksData, error: errTrack } = await supabase
          .from('vw_top_songs_monthly')
          .select('*')
          .eq('year', targetYear)
          .eq('month', targetMonth)
          .order('scrobbles', { ascending: false })      // Critério principal
          .order('last_scrobble', { ascending: false })  // Desempate
          .limit(10);

        if (!errArt) setArtists(artistsData || []);
        if (!errTrack) setTracks(tracksData || []);
        
        if (errArt) console.error("Erro na view vw_top_artists_monthly:", errArt);
        if (errTrack) console.error("Erro na view vw_top_songs_monthly:", errTrack);

      } catch (error) {
        console.error("Erro de conexão ao buscar Top 10:", error);
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
                <li key={item.artist + index} style={styles.listItem}>
                  <span style={styles.rank}>{index + 1}</span>
                  <span style={styles.itemName}>XXX {item.artist}</span>
                  <span style={styles.count}>{item.scrobbles}</span>
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
                <li key={item.song + index} style={styles.listItem}>
                  <span style={styles.rank}>{index + 1}</span>
                  <span style={styles.itemName}>XXX {item.song}</span>
                  <span style={styles.count}>{item.scrobbles}</span>
                  <span style={styles.artistLabel}>{item.artist}</span>
                </li>
              ))}
              {tracks.length === 0 && <p style={styles.noData}>Nenhuma música registrada este mês.</p>}
            </ol>
          </div>

        </div>
      )}
    </div>
  );
}

// Estilização mantida intacta
const styles = {
  container: { padding: '40px 20px', maxWidth: '700px', margin: '0 auto', fontFamily: 'monospace', color: '#000', backgroundColor: '#fff' },
  periodTabs: { display: 'flex', justifyContent: 'center', gap: '60px', fontSize: '15px', marginBottom: '30px', textTransform: 'uppercase' },
  navigationRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '50px', marginBottom: '35px' },
  arrowBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', outline: 'none' },
  monthTitle: { fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px', margin: 0, minWidth: '80px', textAlign: 'center' },
  loading: { textAlign: 'center', fontSize: '14px', padding: '40px 0', color: '#666' },
  tablesGrid: { display: 'flex', flexDirection: 'column', gap: '45px' },
  section: { width: '100%' },
  sectionHeader: { display: 'flex', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '5px', marginBottom: '10px', fontSize: '13px' },
  list: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' },
  listItem: { display: 'flex', alignItems: 'center', fontSize: '14px', lineHeight: '1.4' },
  rank: { width: '25px', textAlign: 'left', color: '#000' },
  itemName: { textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '10px' },
  count: { marginLeft: 'auto', width: '40px', textAlign: 'right' },
  artistLabel: { width: '180px', marginLeft: '20px', textAlign: 'left', textTransform: 'uppercase', color: '#000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  noData: { fontSize: '12px', color: '#777', fontStyle: 'italic', marginTop: '5px' }
};
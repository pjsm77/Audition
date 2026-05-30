// src/pages/profile.jsx
import { useState } from 'react';

const artistMock = {
  name: "Midnight Oil",
  rating: 4.8,
  country: "Austrália",
  city: "Sydney",
  genre: "Alternative Rock / Punk Rock",
  totalScrobbles: 3450,
  globalRanking: 12,
  language: "Inglês",
  topTracks: [
    { title: "Beds Are Burning", scrobbles: 420 },
    { title: "Blue Sky Mine", scrobbles: 310 },
    { title: "The Dead Heart", scrobbles: 285 }
  ]
};

export default function Profile() {
  const [counter, setCounter] = useState(0);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>{artistMock.name}</h1>
          <span style={styles.badge}>{artistMock.genre}</span>
        </div>
        
        <div style={styles.infoGrid}>
          <div style={styles.infoBox}>
            <span style={styles.label}>Scrobbles</span>
            <span style={styles.value}>{artistMock.totalScrobbles}</span>
          </div>
          <div style={styles.infoBox}>
            <span style={styles.label}>Ranking</span>
            <span style={styles.value}>#{artistMock.globalRanking}</span>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Top Tracks (Mock)</h3>
          {artistMock.topTracks.map((track, i) => (
            <div key={i} style={styles.trackRow}>
              <span>{i+1}. {track.title}</span>
              <span style={{ color: '#94a3b8' }}>{track.scrobbles} mjs</span>
            </div>
          ))}
        </div>

        {/* Bloco de teste interativo para validar o React State */}
        <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #334155', paddingTop: '15px' }}>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>Teste de Interatividade React:</p>
          <button style={styles.btn} onClick={() => setCounter(counter + 1)}>
            Cliques: {counter}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '450px', margin: '40px auto', padding: '0 16px', fontFamily: 'sans-serif', color: '#f8fafc' },
  card: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' },
  header: { marginBottom: '20px' },
  title: { margin: '0 0 4px 0', fontSize: '24px', fontWeight: 'bold', color: '#fff' },
  badge: { fontSize: '12px', backgroundColor: '#1e293b', color: '#38bdf8', padding: '4px 10px', borderRadius: '99px', display: 'inline-block' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' },
  infoBox: { backgroundColor: '#020617', border: '1px solid #334155', padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  label: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' },
  value: { fontSize: '20px', fontWeight: 'bold', marginTop: '4px', color: '#10b981' },
  section: { backgroundColor: '#020617', padding: '14px', borderRadius: '12px' },
  sectionTitle: { margin: '0 0 10px 0', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' },
  trackRow: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', padding: '6px 0', borderBottom: '1px solid #1e293b' },
  btn: { backgroundColor: '#10b981', color: '#000', border: 'none', padding: '6px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '6px' }
};
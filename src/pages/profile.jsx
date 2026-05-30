import { useState } from 'react';

const artistMock = {
  name: "Midnight Oil",
  rating: 4.8,
  country: "Austrália",
  city: "Sydney",
  countryCode: "au",
  language: "Inglês",
  genre: "Alternative Rock / Punk Rock",
  globalRanking: 12,
  totalScrobbles: 3450,
  trendingPosition: "3º no Trend Mensal",
  daysSinceLastScrobble: 2,
  recencyScore: 95,
  guitarSetlistCount: 5,
  photo: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60",
  topTracks: [
    { title: "Beds Are Burning", scrobbles: 420, inSetlist: true },
    { title: "Blue Sky Mine", scrobbles: 310, inSetlist: true },
    { title: "The Dead Heart", scrobbles: 285, inSetlist: false },
    { title: "Forgotten Years", scrobbles: 190, inSetlist: true },
    { title: "Power and the Passion", scrobbles: 155, inSetlist: false }
  ],
  collectionAlbums: [
    { title: "Diesel and Dust", year: 1987, format: "Vinil", rating: 5 },
    { title: "Blue Sky Mining", year: 1990, format: "CD", rating: 4.5 },
    { title: "Red Sails in the Sunset", year: 1984, format: "Digital", rating: 4 }
  ],
  charts: {
    years: ["2022", "2023", "2024", "2025", "2026"],
    scrobbles: [450, 720, 1100, 980, 200]
  },
  similarArtists: ["The Living End", "Cold Chisel", "Hoodoo Gurus", "INXS"]
};

const ProfileIcon = ({ name }) => {
  const icons = {
    user: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />,
    disc: <circle cx="12" cy="12" r="10" /><path d="M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0" />,
    music: <path d="M9 18V5l12-2v13M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm12-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
    charts: <path d="M18 20V10M12 20V4M6 20v-6" />
  };
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

export default function Profile() {
  const [activeTab, setActiveTab] = useState('main');

  const tabs = [
    { id: 'main', label: 'Principal', icon: 'user' },
    { id: 'albums', label: 'Coleção', icon: 'disc' },
    { id: 'tracks', label: 'Tracks', icon: 'music' },
    { id: 'charts', label: 'Stats', icon: 'charts' }
  ];

  return (
    <div style={styles.pageContainer}>
      {/* HEADER */}
      <div style={styles.header}>
        <img src={artistMock.photo} style={styles.headerBg} alt="" />
        <div style={styles.headerOverlay} />
        <div style={styles.headerContent}>
          <img src={artistMock.photo} style={styles.avatar} alt={artistMock.name} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={styles.title}>{artistMock.name}</h1>
              <img src={`https://flagcdn.com/w20/${artistMock.countryCode}.png`} style={{ h: '12px', borderRadius: '2px' }} alt="" />
            </div>
            <p style={styles.subtitle}>{artistMock.genre}</p>
            <div style={styles.metaRow}>
              <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>★ {artistMock.rating}</span>
              <span>•</span>
              <span>📍 {artistMock.city}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABS NAVEGAÇÃO */}
      <div style={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tabButton,
              borderBottomColor: activeTab === tab.id ? '#10b981' : 'transparent',
              color: activeTab === tab.id ? '#34d399' : '#94a3b8',
              backgroundColor: activeTab === tab.id ? 'rgba(15, 23, 42, 0.6)' : 'transparent'
            }}
          >
            <ProfileIcon name={tab.icon} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      <div style={{ padding: '16px' }}>
        {activeTab === 'main' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={styles.grid}>
              <div style={styles.cardCenter}>
                <p style={styles.cardLabel}>Scrobbles</p>
                <p style={{ ...styles.cardValue, color: '#10b981' }}>{artistMock.totalScrobbles}</p>
              </div>
              <div style={styles.cardCenter}>
                <p style={styles.cardLabel}>Ranking</p>
                <p style={{ ...styles.cardValue, color: '#38bdf8' }}>#{artistMock.globalRanking}</p>
              </div>
            </div>

            <div style={styles.listCard}>
              <div style={styles.listRow}><span style={{ color: '#94a3b8' }}>Último scrobble:</span><span>{artistMock.daysSinceLastScrobble} dias atrás</span></div>
              <div style={styles.listRow}><span style={{ color: '#94a3b8' }}>Score de Recência:</span><span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{artistMock.recencyScore}/100</span></div>
              <div style={styles.listRow}><span style={{ color: '#94a3b8' }}>Status:</span><span style={styles.badge}>{artistMock.trendingPosition}</span></div>
              <div style={styles.listRow}><span style={{ color: '#94a3b8' }}>Idioma:</span><span>{artistMock.language}</span></div>
            </div>

            <div style={styles.banner}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', color: '#a7f3d0' }}>Repertório no Violão</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#34d399' }}>Prontas para tocar</p>
              </div>
              <div style={styles.bannerCount}>{artistMock.guitarSetlistCount}</div>
            </div>

            <div>
              <h3 style={styles.sectionTitle}>Similares</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {artistMock.similarArtists.map((a, i) => (
                  <span key={i} style={styles.tag}>{a}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'albums' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {artistMock.collectionAlbums.map((album, i) => (
              <div key={i} style={styles.listItem}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{album.title}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{album.year} • <span style={{ color: '#10b981' }}>{album.format}</span></p>
                </div>
                <span style={{ color: '#fbbf24', fontSize: '12px' }}>★ {album.rating}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tracks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {artistMock.topTracks.map((track, i) => (
              <div key={i} style={styles.listItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', width: '16px' }}>{i + 1}</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{track.title}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{track.scrobbles} scrobbles</p>
                  </div>
                </div>
                {track.inSetlist && <span style={styles.badgeMini}>VIOLÃO</span>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'charts' && (
          <div style={styles.listCard}>
            <h3 style={styles.sectionTitle}>Histórico por Ano</h3>
            <div style={styles.chartWrapper}>
              {artistMock.charts.years.map((year, i) => {
                const val = artistMock.charts.scrobbles[i];
                const pct = (val / 1100) * 100;
                return (
                  <div key={year} style={styles.chartColumn}>
                    <span style={{ fontSize: '9px', color: '#10b981', fontWeight: 'bold' }}>{val}</span>
                    <div style={{ ...styles.chartBar, height: `${pct}%` }} />
                    <span style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>{year}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: { maxWidth: '450px', margin: '0 auto', backgroundColor: '#020617', minHeight: '100screen', color: '#f8fafc', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', fontFamily: 'sans-serif' },
  header: { position: 'relative', height: '192px', backgroundColor: '#1e293b', overflow: 'hidden' },
  headerBg: { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3, filter: 'blur(4px)', transform: 'scale(1.05)', position: 'absolute' },
  headerOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, #020617, transparent)' },
  headerContent: { position: 'absolute', bottom: '16px', left: '16px', right: '16px', display: 'flex', alignItems: 'flex-end', gap: '16px' },
  avatar: { width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #10b981' },
  title: { margin: 0, fontSize: '20px', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  subtitle: { margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  metaRow: { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '12px', color: '#cbd5e1' },
  tabBar: { position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #334155', display: 'flex', overflowX: 'auto' },
  tabButton: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 16px', fontSize: '14px', fontWeight: '600', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s', background: 'none' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  cardCenter: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px', textAlign: 'center' },
  cardLabel: { margin: 0, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' },
  cardValue: { margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900 },
  listCard: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px' },
  listRow: { display: 'flex', justifyContent: 'between', justifyContent: 'space-between', fontSize: '14px', padding: '4px 0' },
  badge: { color: '#c084fc', fontSize: '12px', padding: '2px 8px', backgroundColor: 'rgba(168, 85, 247, 0.1)', borderRadius: '9999px', border: '1px solid rgba(168, 85, 247, 0.2)' },
  badgeMini: { fontSize: '9px', fontWeight: '900', backgroundColor: 'rgba(16px, 185px, 129px, 0.1)', color: '#34d399', padding: '2px 6px', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '4px' },
  banner: { background: 'linear-gradient(to right, rgba(6, 78, 59, 0.4), rgba(13, 148, 136, 0.4))', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  bannerCount: { backgroundColor: '#10b981', color: '#020617', fontWeight: 900, padding: '4px 12px', borderRadius: '8px', fontSize: '16px' },
  sectionTitle: { margin: '0 0 8px 0', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#94a3b8' },
  tag: { fontSize: '12px', padding: '4px 10px', backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#cbd5e1', borderRadius: '8px' },
  listItem: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chartWrapper: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '112px', paddingTop: '16px', backgroundColor: '#020617', padding: '8px', borderRadius: '8px', border: '1px solid #0f172a' },
  chartColumn: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
  chartBar: { width: '16px', background: 'linear-gradient(to top, #059669, #34d399)', borderRadius: '2px 2px 0 0' }
};
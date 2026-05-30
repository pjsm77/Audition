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
  fansCount: { deezer: "1.2M", spotify: "2.5M", lastfm: "850K" },
  links: [
    { name: "Official Website", url: "#" },
    { name: "Wikipedia", url: "#" },
    { name: "Last.fm", url: "#" },
    { name: "Deezer", url: "#" }
  ],
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
  deezerAlbums: [
    { title: "Resist", year: 2022, tracksCount: 12 },
    { title: "The Makarrata Project", year: 2020, tracksCount: 7 },
    { title: "Capricornia", year: 2002, tracksCount: 11 }
  ],
  charts: {
    years: ["2022", "2023", "2024", "2025", "2026"],
    scrobbles: [450, 720, 1100, 980, 200]
  },
  similarArtists: ["The Living End", "Cold Chisel", "Hoodoo Gurus", "INXS"]
};

// Ícones SVG Inline mapeados para as abas
const Icons = {
  user: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  disc: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  music: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),
  heart: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  chart: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  link: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
};

export default function Profile() {
  const [activeTab, setActiveTab] = useState('main');

  const tabs = [
    { id: 'main', label: 'Principal', icon: 'user' },
    { id: 'albums', label: 'Coleção', icon: 'disc' },
    { id: 'tracks', label: 'Tracks', icon: 'music' },
    { id: 'deezer', label: 'Deezer', icon: 'heart' },
    { id: 'charts', label: 'Stats', icon: 'chart' },
    { id: 'links', label: 'Links', icon: 'link' },
  ];

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        
        {/* HEADER DO PERFIL */}
        <div style={styles.header}>
          <img src={artistMock.photo} style={styles.bgImage} alt="" />
          <div style={styles.overlay} />
          <div style={styles.headerContent}>
            <img src={artistMock.photo} style={styles.avatar} alt={artistMock.name} />
            <div style={styles.headerText}>
              <div style={styles.titleRow}>
                <h1 style={styles.name}>{artistMock.name}</h1>
                <img src={`https://flagcdn.com/w20/${artistMock.countryCode}.png`} style={styles.flag} alt="" />
              </div>
              <p style={styles.genre}>{artistMock.genre}</p>
              <div style={styles.metaRow}>
                <span style={styles.rating}>★ {artistMock.rating}</span>
                <span>•</span>
                <span>📍 {artistMock.city}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ABAS NAVEGAÇÃO */}
        <div style={styles.tabsContainer}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComponent = Icons[tab.icon];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.tabButton,
                  borderBottomColor: isActive ? '#10b981' : 'transparent',
                  color: isActive ? '#10b981' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(30, 41, 59, 0.5)' : 'transparent'
                }}
              >
                <span style={styles.tabIcon}><IconComponent /></span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* CONTEÚDO DINÂMICO DAS ABAS */}
        <div style={styles.contentBody}>
          
          {/* TAB 1: PRINCIPAL */}
          {activeTab === 'main' && (
            <div style={styles.animateFade}>
              <div style={styles.grid}>
                <div style={styles.infoCard}>
                  <p style={styles.cardLabel}>Scrobbles</p>
                  <p style={{ ...styles.cardValue, color: '#10b981' }}>{artistMock.totalScrobbles}</p>
                </div>
                <div style={styles.infoCard}>
                  <p style={styles.cardLabel}>Ranking</p>
                  <p style={{ ...styles.cardValue, color: '#38bdf8' }}>#{artistMock.globalRanking}</p>
                </div>
              </div>

              <div style={styles.metaList}>
                <div style={styles.metaItem}><span style={styles.textMuted}>Último scrobble:</span><span>{artistMock.daysSinceLastScrobble} dias atrás</span></div>
                <div style={styles.metaItem}><span style={styles.textMuted}>Score de Recência:</span><span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{artistMock.recencyScore}/100</span></div>
                <div style={styles.metaItem}><span style={styles.textMuted}>Status:</span><span style={styles.trendBadge}>{artistMock.trendingPosition}</span></div>
                <div style={styles.metaItem}><span style={styles.textMuted}>Idioma:</span><span>{artistMock.language}</span></div>
              </div>

              <div style={styles.guitarBanner}>
                <div>
                  <h3 style={styles.bannerTitle}>Repertório no Violão</h3>
                  <p style={styles.bannerSubtitle}>Prontas para tocar</p>
                </div>
                <div style={styles.bannerCounter}>{artistMock.guitarSetlistCount}</div>
              </div>

              <div>
                <h3 style={styles.sectionLabel}>Similares</h3>
                <div style={styles.chipGroup}>
                  {artistMock.similarArtists.map((artist, i) => (
                    <span key={i} style={styles.chip}>{artist}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COLEÇÃO */}
          {activeTab === 'albums' && (
            <div style={styles.listContainer}>
              {artistMock.collectionAlbums.map((album, i) => (
                <div key={i} style={styles.listItem}>
                  <div>
                    <h4 style={styles.itemTitle}>{album.title}</h4>
                    <p style={styles.itemSubtitle}>{album.year} • <span style={{ color: '#10b981' }}>{album.format}</span></p>
                  </div>
                  <span style={{ color: '#fbbf24', fontSize: '13px' }}>★ {album.rating}</span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: TRACKS */}
          {activeTab === 'tracks' && (
            <div style={styles.listContainer}>
              {artistMock.topTracks.map((track, i) => (
                <div key={i} style={styles.listItem}>
                  <div style={styles.flexCenter}>
                    <span style={styles.rowNumber}>{i + 1}</span>
                    <div>
                      <h4 style={styles.itemTitle}>{track.title}</h4>
                      <p style={styles.itemSubtitle}>{track.scrobbles} scrobbles</p>
                    </div>
                  </div>
                  {track.inSetlist && <span style={styles.rowBadge}>VIOLÃO</span>}
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: DEEZER */}
          {activeTab === 'deezer' && (
            <div style={styles.listContainer}>
              <div style={styles.fansGrid}>
                <div style={styles.fanBox}><span>Deezer</span><strong>{artistMock.fansCount.deezer}</strong></div>
                <div style={styles.fanBox}><span>Spotify</span><strong>{artistMock.fansCount.spotify}</strong></div>
                <div style={styles.fanBox}><span>Last.fm</span><strong>{artistMock.fansCount.lastfm}</strong></div>
              </div>
              {artistMock.deezerAlbums.map((album, i) => (
                <div key={i} style={styles.listItem}>
                  <div>
                    <h4 style={styles.itemTitle}>{album.title}</h4>
                    <p style={styles.itemSubtitle}>{album.year} • {album.tracksCount} faixas</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: STATS (GRÁFICO) */}
          {activeTab === 'charts' && (
            <div style={styles.chartCard}>
              <h3 style={styles.sectionLabel}>Histórico por Ano</h3>
              <div style={styles.chartWrapper}>
                {artistMock.charts.years.map((year, i) => {
                  const val = artistMock.charts.scrobbles[i];
                  const maxVal = 1100; 
                  const percentageHeight = (val / maxVal) * 100;
                  return (
                    <div key={year} style={styles.chartColumn}>
                      <span style={styles.chartValue}>{val}</span>
                      <div style={{ ...styles.chartBar, height: `${percentageHeight}%` }} />
                      <span style={styles.chartYear}>{year}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: LINKS */}
          {activeTab === 'links' && (
            <div style={styles.listContainer}>
              {artistMock.links.map((link, i) => (
                <a key={i} href={link.url} style={styles.linkRow}>
                  <span>{link.name}</span>
                  <span style={{ fontSize: '11px' }}>↗</span>
                </a>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Estilos limpos usando CSS nativo com escopo fixo e responsivo
const styles = {
  pageWrapper: { minHeight: '100vh', backgroundColor: '#0f172a', padding: '20px 0', fontFamily: 'sans-serif', color: '#f8fafc' },
  container: { maxWidth: '440px', margin: '0 auto', backgroundColor: '#020617', minHeight: '90vh', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)', border: '1px solid #1e293b', position: 'relative' },
  header: { relative: 'true', height: '192px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'end' },
  bgImage: { width: '100%', height: '100%', objectCover: 'cover', opacity: 0.35, filter: 'blur(4px)', position: 'absolute', transform: 'scale(1.05)' },
  overlay: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(to top, #020617, transparent)' },
  headerContent: { position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', width: '100%' },
  avatar: { width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #10b981' },
  headerText: { flex: 1, minWidth: 0 },
  titleRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  name: { margin: 0, fontSize: '20px', fontWeight: '900', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  flag: { height: '12px', borderRadius: '2px' },
  genre: { margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  metaRow: { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '12px', color: '#cbd5e1' },
  rating: { color: '#fbbf24', fontWeight: 'bold' },
  tabsContainer: { position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'rgba(2, 6, 23, 0.9)', borderBottom: '1px solid #1e293b', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', gap: '4px' },
  tabButton: { display: 'flex', alignItems: 'center', gap: '8px', px: '20px', padding: '14px 20px', fontSize: '14px', fontWeight: '600', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' },
  tabIcon: { display: 'flex', alignItems: 'center' },
  contentBody: { padding: '16px', spaceY: '16px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' },
  infoCard: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px', textAlign: 'center' },
  cardLabel: { margin: 0, fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', tracking: 'wider' },
  cardValue: { margin: '4px 0 0 0', fontSize: '20px', fontWeight: '900' },
  metaList: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', marginBottom: '16px' },
  metaItem: { display: 'flex', justifyContent: 'space-between' },
  textMuted: { color: '#94a3b8' },
  trendBadge: { color: '#c084fc', fontSize: '12px', padding: '2px 8px', backgroundColor: 'rgba(168, 85, 247, 0.1)', borderRadius: '99px', border: '1px solid rgba(168, 85, 247, 0.2)' },
  guitarBanner: { backgroundImage: 'linear-gradient(to right, rgba(16, 185, 129, 0.15), rgba(20, 184, 166, 0.15))', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  bannerTitle: { margin: 0, fontWeight: 'bold', color: '#6ee7b7', fontSize: '14px' },
  bannerSubtitle: { margin: 0, fontSize: '12px', color: 'rgba(16, 185, 129, 0.8)' },
  bannerCounter: { backgroundColor: '#10b981', color: '#020617', fontWeight: '900', padding: '4px 12px', borderRadius: '8px', fontSize: '16px' },
  sectionLabel: { margin: '0 0 8px 0', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#94a3b8' },
  chipGroup: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  chip: { fontSize: '12px', padding: '4px 10px', backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#cbd5e1', borderRadius: '8px' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '8px' },
  listItem: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#fff' },
  itemSubtitle: { margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' },
  flexCenter: { display: 'flex', alignItems: 'center', gap: '12px' },
  rowNumber: { fontSize: '12px', fontWeight: 'bold', color: '#64748b', width: '14px' },
  rowBadge: { fontSize: '9px', fontWeight: '900', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 6px', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '4px' },
  fansGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' },
  fanBox: { backgroundColor: '#0f172a', padding: '10px', borderRadius: '10px', textAlign: 'center', fontSize: '11px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '2px', border: '1px solid #1e293b' },
  chartCard: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px' },
  chartWrapper: { display: 'flex', alignItems: 'end', justifyContent: 'space-between', height: '112px', paddingTop: '16px', backgroundColor: '#020617', padding: '8px', borderRadius: '8px', border: '1px solid #0f172a' },
  chartColumn: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
  chartValue: { fontSize: '9px', color: '#10b981', fontWeight: 'bold' },
  chartBar: { width: '16px', backgroundImage: 'linear-gradient(to top, #059669, #10b981)', borderRadius: '2px 2px 0 0', transition: 'height 0.3s' },
  chartYear: { fontSize: '9px', color: '#64748b', marginTop: '4px' },
  linkRow: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#38bdf8', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }
};
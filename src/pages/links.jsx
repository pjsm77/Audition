import React from 'react';

const Links = () => {
  const links = [
    { name: 'Spotify', url: 'https://open.spotify.com', color: '#1DB954' },
    { name: 'Deezer', url: 'https://www.deezer.com', color: '#EF5466' },
    { name: 'Last.fm', url: 'https://www.last.fm', color: '#D51007' },
    { name: 'MusicBrainz', url: 'https://musicbrainz.org', color: '#EB743B' },
    { name: 'Discogs', url: 'https://www.discogs.com', color: '#333333' },
    { name: 'AllMusic Guide', url: 'https://www.allmusic.com', color: '#24A1DE' },
    { name: 'Rate Your Music', url: 'https://rateyourmusic.com', color: '#2C4A5E' },
    { name: 'Songstats', url: 'https://songstats.com', color: '#FF5A5F' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.profileImg}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1DB954" width="40px" height="40px">
            <path d="M0 0h24v24H0z" fill="none"/>
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <h1 style={styles.title}>Plataformas de Música</h1>
        <p style={styles.subtitle}>Estatísticas, catalogação, streaming e bancos de dados da minha coleção</p>

        <div style={styles.linksContainer}>
          {links.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.linkCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = link.color;
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 6px 20px ${link.color}66`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'linear-gradient(135deg, #0f0f12 0%, #17171c 100%)',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    textAlign: 'center',
  },
  profileImg: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#a0a0a8',
    marginBottom: '32px',
    lineHeight: '1.5',
  },
  linksContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  linkCard: {
    display: 'block',
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '16px',
    transition: 'all 0.25s ease-in-out',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  }
};

export default Links;
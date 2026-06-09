import React, { useEffect, useState } from 'react';
// Ajuste o caminho abaixo de acordo com a estrutura do seu projeto
import { supabase } from '../supabaseClient'; 

// Mapeamento para garantir que os códigos do banco batam com o flagcdn
const countryFlagMap = {
  'BR': 'BR',
  'US': 'US',
  'UY': 'UY',
  'AU': 'AU',
  'CA': 'CA',
  'PL': 'PL',
  'SE': 'SE',
  'IE': 'IE',
  'DE': 'DE',
  'ES': 'ES',
  'GB': 'GB'
};

const decades = ['1980', '1990', '2000', '2010', '2020'];

export default function HallOfFame() {
  const [groupedData, setGroupedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHallOfFame() {
      try {
        setLoading(true);
        
        // Buscando os dados da nova tabela ordenados por artista
        const { data, error: supabaseError } = await supabase
          .from('tbl_hall_of_fame')
          .select('artist, country_code, decade')
          .order('artist', { ascending: true });

        if (supabaseError) throw supabaseError;

        // Agrupando os dados retornados pelas décadas definidas
        const grouped = decades.reduce((acc, decade) => {
          acc[decade] = data.filter(item => item.decade === decade);
          return acc;
        }, {});

        setGroupedData(grouped);
      } catch (err) {
        console.error('Erro ao carregar o Hall of Fame:', err);
        setError('Não foi possível carregar os artistas.');
      } finally {
        setLoading(false);
      }
    }

    fetchHallOfFame();
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingText}>CARREGANDO A GLÓRIA ETERNA...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorText}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Cabeçalho estilo Conmebol Libertadores */}
      <header style={styles.header}>
        <div style={styles.subtitle}>- MY PERSONAL -</div>
        <h1 style={styles.title}>HALL OF FAME</h1>
        <div style={styles.tagline}>A GLÓRIA ETERNA DA MÚSICA</div>
      </header>

      {/* Grid de Décadas */}
      <div style={styles.grid}>
        {decades.map((decade) => (
          <div key={decade} style={styles.card}>
            {/* Header da Década com estilo dourado degradê */}
            <div style={styles.cardHeader}>
              <span style={styles.cardHeaderText}>ANOS {decade}</span>
            </div>
            
            {/* Lista de Artistas vindos do Supabase */}
            <div style={styles.artistList}>
              {groupedData[decade] && groupedData[decade].length > 0 ? (
                groupedData[decade].map((item, index) => (
                  <div key={index} style={styles.artistRow}>
                    {/* Bandeira do País */}
                    <div style={styles.flagContainer}>
                      <img 
                        src={`https://flagcdn.com/w40/${(countryFlagMap[item.country_code] || item.country_code).toLowerCase()}.png`}
                        alt={item.country_code}
                        style={styles.flagImage}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <span style={styles.flagFallback}>{item.country_code}</span>
                    </div>
                    {/* Nome do Artista */}
                    <span style={styles.artistName}>{item.artist}</span>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>Nenhum artista cadastrado</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#050505',
    backgroundImage: 'linear-gradient(135deg, #050505 0%, #121212 100%)',
    minHeight: '100vh',
    padding: '40px 20px',
    fontFamily: '"Montserrat", "Arial Black", -apple-system, sans-serif',
    color: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  loadingText: {
    marginTop: '20vh',
    fontSize: '18px',
    letterSpacing: '3px',
    color: '#d4af37',
    fontWeight: 'bold',
  },
  errorText: {
    marginTop: '20vh',
    fontSize: '16px',
    color: '#ff4d4d',
    letterSpacing: '1px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '50px',
    letterSpacing: '3px',
  },
  subtitle: {
    color: '#d4af37',
    fontSize: '14px',
    fontWeight: '600',
    opacity: 0.8,
  },
  title: {
    fontSize: '36px',
    fontWeight: '900',
    margin: '5px 0',
    background: 'linear-gradient(180deg, #FFF 30%, #d4af37 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0px 4px 10px rgba(0, 0, 0, 0.7)',
  },
  tagline: {
    color: '#d4af37',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '5px',
    marginTop: '5px',
    opacity: 0.9,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
    width: '100%',
    maxWidth: '1200px',
    padding: '0 10px',
  },
  card: {
    backgroundColor: 'rgba(15, 15, 15, 0.75)',
    border: '1px solid rgba(212, 175, 55, 0.15)',
    borderRadius: '4px',
    padding: '4px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(5px)',
  },
  cardHeader: {
    background: 'linear-gradient(90deg, #9a741e 0%, #d4af37 50%, #9a741e 100%)',
    borderRadius: '3px 3px 0 0',
    padding: '8px 15px',
    textAlign: 'center',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
  },
  cardHeaderText: {
    color: '#000000',
    fontSize: '15px',
    fontWeight: '800',
    letterSpacing: '2px',
  },
  artistList: {
    padding: '8px 4px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  artistRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 14px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '2px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
  },
  flagContainer: {
    width: '32px',
    height: '22px',
    marginRight: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: '2px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
  },
  flagImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  flagFallback: {
    display: 'none',
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#d4af37',
  },
  artistName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#EAEAEA',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  emptyState: {
    textAlign: 'center',
    padding: '20px',
    color: '#666',
    fontSize: '12px',
    fontStyle: 'italic',
  }
};
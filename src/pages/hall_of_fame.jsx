import React, { useEffect, useState } from 'react';
// Ajuste o caminho abaixo para bater com a configuração do seu Supabase
import { supabase } from '../supabaseClient'; 

// Mapeamento de ISO codes do banco de dados para o flagcdn
const countryFlagMap = {
  'BR': 'br',
  'US': 'us',
  'UY': 'uy',
  'AU': 'au',
  'CA': 'ca',
  'PL': 'pl',
  'SE': 'se',
  'IE': 'ie', 
  'DE': 'de',
  'ES': 'es',
  'GB': 'gb'  
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
        
        // Busca os dados na tabela trazendo os artistas em ordem alfabética
        const { data, error: supabaseError } = await supabase
          .from('tbl_hall_of_fame')
          .select('artist, country_code, decade')
          .order('artist', { ascending: true });

        if (supabaseError) throw supabaseError;

        // Agrupa dinamicamente os artistas por década
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
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>CARREGANDO A GLÓRIA ETERNA...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.errorText}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Cabeçalho colado nos blocos */}
      <header style={styles.header}>
        <h1 style={styles.title}>HALL OF FAME</h1>
      </header>

      {/* Grid de Décadas */}
      <div style={styles.grid}>
        {decades.map((decade) => (
          <div key={decade} style={styles.card}>
            {/* Header exibe apenas o número da década */}
            <div style={styles.cardHeader}>
              <span style={styles.cardHeaderText}>{decade}</span>
            </div>
            
            {/* Lista ultra compacta de Artistas */}
            <div style={styles.artistList}>
              {groupedData[decade] && groupedData[decade].length > 0 ? (
                groupedData[decade].map((item, index) => (
                  <div key={index} style={styles.artistRow}>
                    {/* Bandeira micro */}
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
                    {/* Nome do Artista menor */}
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
    width: '100%',
    padding: '10px 20px 80px 20px', // Reduzido padding superior ao mínimo e adicionado espaço inferior para o menu flutuante
    fontFamily: '"Montserrat", "Arial Black", -apple-system, sans-serif',
    color: '#FFFFFF',
    boxSizing: 'border-box'
  },
  loadingContainer: {
    backgroundColor: '#050505',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Montserrat", sans-serif',
  },
  loadingText: {
    fontSize: '18px',
    letterSpacing: '3px',
    color: '#d4af37',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: '16px',
    color: '#ff4d4d',
    letterSpacing: '1px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '8px',        // Espaço mínimo absoluto do título para as caixas
    marginTop: '5px',
    letterSpacing: '3px',
  },
  title: {
    fontSize: '34px',
    fontWeight: '900',
    margin: '0',                
    padding: '0',
    background: 'linear-gradient(180deg, #FFF 30%, #d4af37 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0px 4px 10px rgba(0, 0, 0, 0.7)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', 
    gap: '12px',                // Reduzido espaçamento entre blocos
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: 'rgba(15, 15, 15, 0.85)',
    border: '1px solid rgba(212, 175, 55, 0.15)',
    borderRadius: '4px',
    padding: '1px',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(5px)',
    height: 'fit-content',
  },
  cardHeader: {
    background: 'linear-gradient(90deg, #9a741e 0%, #d4af37 50%, #9a741e 100%)',
    borderRadius: '3px 3px 0 0',
    padding: '3px 10px',        // Cabeçalho da década extremamente fino
    textAlign: 'center',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
  },
  cardHeaderText: {
    color: '#000000',
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '2px',
  },
  artistList: {
    padding: '1px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',                 
  },
  artistRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '1px 6px',         // Compactação máxima vertical (de 3px para 1px)
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '2px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.01)',
  },
  flagContainer: {
    width: '18px',              // Reduzido para encaixar no padding menor
    height: '12px',             
    marginRight: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: '1px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  flagImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  flagFallback: {
    display: 'none',
    fontSize: '7px',
    fontWeight: 'bold',
    color: '#d4af37',
  },
  artistName: {
    fontSize: '11px',           
    fontWeight: '700',
    color: '#EAEAEA',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',       
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '14px',         // Força consistência na altura do texto
  },
  emptyState: {
    textAlign: 'center',
    padding: '8px',
    color: '#555',
    fontSize: '10px',
    fontStyle: 'italic',
  }
};
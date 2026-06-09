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
    position: 'absolute',       // Força o desacoplamento de travas do container pai se houver
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflowY: 'auto',          // Força a existência de scrollbar interna caso o layout pai bloqueie
    padding: '20px 20px 40px 20px', // Reduzido padding superior
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
    marginBottom: '10px',       // Espaço mínimo para colar o título no grid
    marginTop: '10px',
    letterSpacing: '3px',
    width: '100%',
  },
  title: {
    fontSize: '36px',
    fontWeight: '900',
    margin: '0',                // Zera totalmente margens externas do h1
    padding: '0',
    background: 'linear-gradient(180deg, #FFF 30%, #d4af37 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0px 4px 10px rgba(0, 0, 0, 0.7)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', // Diminuído largura mínima do card para alinhar melhor
    gap: '15px',                // Reduzido espaço entre os blocos
    width: '100%',
    maxWidth: '1200px',
    padding: '0 5px',
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
    padding: '4px 10px',        // Ajuste fino de padding vertical
    textAlign: 'center',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
  },
  cardHeaderText: {
    color: '#000000',
    fontSize: '13px',
    fontWeight: '800',
    letterSpacing: '2px',
  },
  artistList: {
    padding: '2px 1px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',                 // Espaço mínimo absoluto entre linhas
  },
  artistRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '3px 8px',         // Reduzido vertical de 5px para 3px para achatar a linha ao máximo
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '2px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.01)',
  },
  flagContainer: {
    width: '20px',              // Reduzido de 24px para 20px
    height: '14px',             // Reduzido de 16px para 14px
    marginRight: '8px',
    display: 'flex',
    alignItems: 'center',
    justify',Content: 'center',
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
    fontSize: '8px',
    fontWeight: 'bold',
    color: '#d4af37',
  },
  artistName: {
    fontSize: '11px',           // Reduzido de 12px para 11px
    fontWeight: '700',
    color: '#EAEAEA',
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',       // Impede quebra de linha de nomes grandes comprometendo a altura
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  emptyState: {
    textAlign: 'center',
    padding: '10px',
    color: '#555',
    fontSize: '11px',
    fontStyle: 'italic',
  }
};
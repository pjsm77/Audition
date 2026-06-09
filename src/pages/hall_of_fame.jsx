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
      {/* Cabeçalho limpo apenas com o título principal */}
      <header style={styles.header}>
        <h1 style={styles.title}>HALL OF FAME</h1>
      </header>

      {/* Grid de Décadas com rolagem da página corrigida */}
      <div style={styles.grid}>
        {decades.map((decade) => (
          <div key={decade} style={styles.card}>
            {/* Header da Década com estilo dourado metálico */}
            <div style={styles.cardHeader}>
              <span style={styles.cardHeaderText}>ANOS {decade}</span>
            </div>
            
            {/* Lista compacta de Artistas */}
            <div style={styles.artistList}>
              {groupedData[decade] && groupedData[decade].length > 0 ? (
                groupedData[decade].map((item, index) => (
                  <div key={index} style={styles.artistRow}>
                    {/* Bandeira do País compactada */}
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
    height: 'auto',              // Garante que o container estique verticalmente com o conteúdo
    overflowY: 'visible',        // Libera explicitamente a rolagem vertical nativa
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
    marginBottom: '35px',       // Reduzido o espaço abaixo do título
    letterSpacing: '3px',
  },
  title: {
    fontSize: '38px',
    fontWeight: '900',
    margin: '0',
    background: 'linear-gradient(180deg, #FFF 30%, #d4af37 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0px 4px 10px rgba(0, 0, 0, 0.7)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',                // Diminuído o espaçamento entre os blocos de décadas
    width: '100%',
    maxWidth: '1200px',
    padding: '0 10px',
  },
  card: {
    backgroundColor: 'rgba(15, 15, 15, 0.75)',
    border: '1px solid rgba(212, 175, 55, 0.15)',
    borderRadius: '4px',
    padding: '2px',             // Reduzido o padding interno do card
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(5px)',
    height: 'fit-content',      // O card se adapta ao total de linhas sem forçar estiramentos estranhos
  },
  cardHeader: {
    background: 'linear-gradient(90deg, #9a741e 0%, #d4af37 50%, #9a741e 100%)',
    borderRadius: '3px 3px 0 0',
    padding: '6px 12px',        // Linha de cabeçalho da década ligeiramente mais fina
    textAlign: 'center',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
  },
  cardHeaderText: {
    color: '#000000',
    fontSize: '14px',
    fontWeight: '800',
    letterSpacing: '2px',
  },
  artistList: {
    padding: '4px 2px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',                 // Menor espaço possível entre uma linha e outra
  },
  artistRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '5px 10px',        // Reduzido drasticamente de 10px 14px para 5px 10px (linhas muito mais compactas)
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '2px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.01)',
  },
  flagContainer: {
    width: '24px',              // Reduzido o tamanho horizontal da bandeira de 32px para 24px
    height: '16px',             // Reduzido o tamanho vertical da bandeira de 22px para 16px
    marginRight: '10px',        // Aproximou a bandeira do texto do artista
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: '1px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  flagImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  flagFallback: {
    display: 'none',
    fontSize: '9px',
    fontWeight: 'bold',
    color: '#d4af37',
  },
  artistName: {
    fontSize: '12px',           // Ajuste sutil na fonte para harmonizar com a linha mais baixa
    fontWeight: '700',
    color: '#EAEAEA',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
  },
  emptyState: {
    textAlign: 'center',
    padding: '15px',
    color: '#666',
    fontSize: '11px',
    fontStyle: 'italic',
  }
};
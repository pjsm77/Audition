// src/pages/recent.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- MAPEAMENTO COMPLETO DE PAÍSES DO ARTISTS.JSX ---
const countryMap = {
  "[desconhecido]": "unknown", "afeganistão": "af", "áfrica do sul": "za", "alemanha": "de", 
  "andorra": "ad", "argélia": "dz", "argentina": "ar", "armênia": "am", "austrália": "au",
  "áustria": "at", "azerbaijão": "az", "bangladesh": "bd", "barbados": "bb", "bélgica": "be", 
  "bolívia": "bo", "bósnia e herzegovina": "ba", "brasil": "br", "bulgária": "bg", "canadá": "ca", 
  "chile": "cl", "china": "cn", "colômbia": "co", "coreia do sul": "kr", "costa rica": "cr", 
  "croácia": "hr", "cuba": "cu", "dinamarca": "dk", "egito": "eg", "emirados árabes unidos": "ae", 
  "equador": "ec", "escócia": "gb-sct", "eslováquia": "sk", "eslovênia": "si", "espanha": "es", 
  "estados unidos": "us", "estônia": "ee", "eua": "us", "finlândia": "fi", "frança": "fr", 
  "geórgia": "ge", "grécia": "gr", "guatemala": "gt", "hungria": "hu", "índia": "in", 
  "indonésia": "id", "inglaterra": "gb-eng", "irã": "ir", "irlanda": "ie", "islândia": "is", 
  "israel": "il", "itália": "it", "jamaica": "jm", "japão": "jp", "jordânia": "jo", "líbano": "lb",
  "luxemburgo": "lu", "malásia": "my", "malta": "mt", "marrocos": "ma", "méxico": "mx", 
  "mongólia": "mn", "montenegro": "me", "nigéria": "ng", "noruega": "no", "nova zelândia": "nz", 
  "país de gales": "gb-wls", "países baixos": "nl", "holanda": "nl", "panamá": "pa", 
  "paquistão": "pk", "paraguai": "py", "peru": "pe", "polônia": "pl", "portugal": "pt", 
  "quênia": "ke", "quirguistão": "kg", "reino unido": "gb", "república checa": "cz", 
  "romênia": "ro", "rússia": "ru", "sérvia": "rs", "síria": "sy", "sri lanka": "lk", 
  "suécia": "se", "suíça": "ch", "tailândia": "th", "taiwan": "tw", "tajiquistão": "tj", 
  "tunísia": "tn", "turquia": "tr", "ucrânia": "ua", "uruguai": "uy", "venezuela": "ve", 
  "vietnã": "vn", "zâmbia": "zm", "zimbábue": "zw"
};

const getCountryFlag = (countryName) => {
  if (!countryName) return null;
  const cleanName = countryName.toLowerCase().trim();
  const flagCode = countryMap[cleanName] || "un";

  if (flagCode === "unknown" || flagCode === "un") return null;

  return (
    <img 
      src={`https://flagcdn.com/32x24/${flagCode}.png`} 
      alt={countryName} 
      style={{ width: '16px', height: '12px', border: '0.5px solid #555', borderRadius: '1px', objectFit: 'cover' }} 
    />
  );
};

// --- COR DO SCORE DE RECÊNCIA DO ARTISTS.JSX ---
const getScoreBgColor = (score) => {
  if (score >= 90) return '#6dbe99';
  if (score >= 80) return '#86d03a';
  if (score >= 70) return '#b7d13e';
  if (score >= 60) return '#e0d341';
  if (score >= 50) return '#ffcc33';
  if (score >= 40) return '#ffaa33';
  if (score >= 30) return '#ff8833';
  if (score >= 20) return '#ff5f33';
  if (score >= 10) return '#ff4433';
  if (score >= 1) return '#e97b78';
  return '#aaaaaa';
};

// --- REGRAS DE COR DO ARTISTA ---
const getArtistColor = (rating, totalAlbums) => {
  if (rating === 'A') return '#6dbe99';
  if (rating === 'B') return '#a3e04d';
  if (rating === 'C') return '#f8c039';
  if (rating === 'D') return '#e97b78';
  if (totalAlbums > 0) return '#4d388c';
  return '#aaaaaa';
};

// --- COR DA BORDA DA PÍLULA DO GR ---
const getGRBadgeStyle = (gr) => {
  let borderColor = '#aaaaaa';
  if (gr > 0 && gr <= 100) borderColor = '#6dbe99';
  else if (gr > 100 && gr <= 300) borderColor = '#86d03a';
  else if (gr > 300 && gr <= 600) borderColor = '#ffcc33';
  else if (gr > 600 && gr <= 1000) borderColor = '#ffaa33';
  else if (gr > 1000 && gr <= 1500) borderColor = '#ff5f33';
  else if (gr > 1500 && gr <= 2000) borderColor = '#e97b78';

  return {
    fontSize: '9px',
    fontWeight: 'bold',
    color: borderColor,
    border: `1px solid ${borderColor}`,
    borderRadius: '3px',
    padding: '0px 4px',
    lineHeight: '1.1',
    display: 'inline-block'
  };
};

export default function Recent() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [artistGRMap, setArtistGRMap] = useState(new Map());
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState('ALL');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedFavorite, setSelectedFavorite] = useState('ALL');

  const isFiltered = Boolean(
    searchTerm.trim() || 
    selectedRating !== 'ALL' || 
    selectedCountry !== 'ALL' || 
    selectedFavorite !== 'ALL'
  );

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRating('ALL');
    setSelectedCountry('ALL');
    setSelectedFavorite('ALL');
  };

  const getStatusIndicator = (latestDate) => {
    const now = new Date();
    const scrobbleTime = new Date(latestDate);
    const diffMs = now - scrobbleTime;
    
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    const formattedDiff = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    let color = '#f44336';
    if (totalMinutes < 60) color = '#4caf50';
    else if (totalMinutes < 120) color = '#ffeb3b';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }}></div>
        <span style={{ fontSize: '10px', color: '#888', fontWeight: 'bold' }}>
          {formattedDiff}
        </span>
      </div>
    );
  };

  useEffect(() => {
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, []);

  useEffect(() => {
    async function initialLoad() {
      try {
        let loadedData = [];
        let offset = 0;
        let daysFound = 0;

        while (daysFound < 10 && offset < 2000) {
          const { data, error } = await supabase
            .from('recent_scrobbles_view')
            .select('*')
            .order('date', { ascending: false })
            .range(offset, offset + 499);
          
          if (error || !data || data.length === 0) break;
          
          loadedData = [...loadedData, ...data];
          const uniqueDays = new Set(loadedData.map(item => new Date(item.date).toLocaleDateString('en-US')));
          daysFound = uniqueDays.size;
          offset += 500;
        }

        setAllData(loadedData);
        setFilteredData(loadedData);
        setLoading(false);

        // Carrega o ranking para mapear a posição exata (GR) de cada artista
        const { data: grData } = await supabase.rpc('get_artist_ranking_full', { search_term: '' });
        if (grData) {
          const sorted = [...grData].sort((a, b) => (b.scrobbles - a.scrobbles) || a.artist.localeCompare(b.artist));
          const map = new Map();
          sorted.forEach((item, idx) => {
            if (item.artist) map.set(item.artist.toLowerCase().trim(), idx + 1);
          });
          setArtistGRMap(map);
        }

        const { data: fullData, error: fullError } = await supabase
          .from('recent_scrobbles_view')
          .select('*')
          .order('date', { ascending: false });
        
        if (!fullError && fullData) {
          setAllData(fullData);
          setFilteredData(prev => isFiltered ? prev : fullData);
        }
      } catch (err) {
        console.error("Erro na carga:", err);
        setLoading(false);
      }
    }
    initialLoad();
  }, []);

  // Aplicação dos Filtros
  useEffect(() => {
    let result = [...allData];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(item => (item.artist || '').toLowerCase().includes(term));
    }

    if (selectedRating !== 'ALL') {
      if (selectedRating === 'NULL') {
        result = result.filter(item => !item.artist_rating);
      } else {
        result = result.filter(item => item.artist_rating === selectedRating);
      }
    }

    if (selectedCountry !== 'ALL') {
      if (selectedCountry === 'NONE') {
        result = result.filter(item => !item.artist_country);
      } else {
        result = result.filter(item => item.artist_country === selectedCountry);
      }
    }

    if (selectedFavorite !== 'ALL') {
      const isFav = selectedFavorite === 'YES';
      result = result.filter(item => !!item.is_favorite === isFav);
    }

    setFilteredData(result);
    setCurrentPage(0);
  }, [searchTerm, selectedRating, selectedCountry, selectedFavorite, allData]);

  const groupData = (dataSet) => {
    const groups = {};
    dataSet.forEach(item => {
      if (!item.date) return;
      const dateKey = new Date(item.date).toLocaleDateString('en-US');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });
    return Object.values(groups);
  };

  const globalGroups = groupData(allData).slice(0, 10).reverse();

  const ITEMS_PER_PAGE = 50;
  const currentGroups = groupData(filteredData);

  const displayItems = isFiltered
    ? filteredData.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)
    : (currentGroups[currentPage] || []);

  const totalPages = isFiltered
    ? Math.ceil(filteredData.length / ITEMS_PER_PAGE)
    : currentGroups.length;

  const countryList = Array.from(
    new Set(allData.map(i => i.artist_country).filter(Boolean))
  ).sort();

  const chartData = {
    labels: globalGroups.map(g => new Date(g[0].date).getDate()),
    datasets: [{
      data: globalGroups.map(g => g.length),
      backgroundColor: '#ba0000',
      borderRadius: 2,
      barPercentage: 0.6
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { display: false, beginAtZero: true },
      x: { ticks: { color: '#888', font: { size: 9 } }, grid: { display: false } }
    }
  };

  const customLabelsPlugin = {
    id: 'customLabels',
    afterDraw: (chart) => {
      const ctx = chart.ctx;
      chart.data.datasets[0].data.forEach((val, i) => {
        const meta = chart.getDatasetMeta(0);
        if (!meta.data[i]) return;
        const x = meta.data[i].x;
        const base = meta.data[i].y; 
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(val, x, base - 5);
      });
    }
  };

  const openDeezer = (artist, album) => {
    if (!album || album === '—') {
      window.open(`https://www.deezer.com/search/${encodeURIComponent(artist)}`, '_blank');
      return;
    }
    const cb = 'dz_' + Date.now();
    window[cb] = (d) => {
      if (d.data && d.data[0]) {
        window.location.href = `deezer://www.deezer.com/album/${d.data[0].id}`;
        setTimeout(() => { if (document.hasFocus()) window.open(d.data[0].link, '_blank'); }, 500);
      } else {
        window.open(`https://www.deezer.com/search/${encodeURIComponent(artist + " " + album)}`, '_blank');
      }
      delete window[cb];
    };
    const s = document.createElement('script');
    s.src = `https://api.deezer.com/search/album?q=${encodeURIComponent(`album:"${album}" artist:"${artist}"`)}&output=jsonp&callback=${cb}`;
    document.body.appendChild(s);
  };

  const selectStyle = {
    backgroundColor: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '11px',
    height: '28px',
    padding: '0 6px',
    boxSizing: 'border-box',
    flex: 1
  };

  const formatDateWithTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  };

  if (loading) return <div style={{ padding: '20px', color: '#888', backgroundColor: '#121212', minHeight: '100vh' }}>Loading scrobbles...</div>;

  return (
    <div style={{ backgroundColor: '#121212', color: '#e0e0e0', fontFamily: 'Segoe UI, Roboto, sans-serif', height: '100vh', overflowY: 'scroll', WebkitOverflowScrolling: 'touch', padding: '10px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '1000px', margin: 'auto' }}>
        
        {/* GRÁFICO */}
        <div style={{ width: '100%', height: '140px', backgroundColor: '#1e1e1e', borderRadius: '8px', padding: '5px', boxSizing: 'border-box', marginBottom: '10px' }}>
          {allData.length > 0 && <Bar data={chartData} options={chartOptions} plugins={[customLabelsPlugin]} />}
        </div>

        {/* CONTROLES DE FILTRO */}
        <div style={{ backgroundColor: '#1e1e1e', padding: '10px', borderRadius: '8px', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="text" placeholder="Filter artist..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '6px 35px 6px 12px', backgroundColor: '#2a2a2a', border: '1px solid #444', borderRadius: '4px', color: '#fff', fontSize: '13px', height: '30px', boxSizing: 'border-box' }} />
            
            {isFiltered && (
              <button 
                onClick={clearFilters}
                style={{ backgroundColor: '#ba0000', color: '#fff', border: 'none', borderRadius: '4px', padding: '0 10px', height: '30px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                × Limpar
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <select value={selectedRating} onChange={(e) => setSelectedRating(e.target.value)} style={selectStyle}>
              <option value="ALL">Rating: Todos</option>
              <option value="A">Rating: A</option>
              <option value="B">Rating: B</option>
              <option value="C">Rating: C</option>
              <option value="D">Rating: D</option>
              <option value="NULL">Sem Rating</option>
            </select>

            <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} style={selectStyle}>
              <option value="ALL">País: Todos</option>
              {countryList.map((country, idx) => (
                <option key={idx} value={country}>{country}</option>
              ))}
              <option value="NONE">Sem País</option>
            </select>

            <select value={selectedFavorite} onChange={(e) => setSelectedFavorite(e.target.value)} style={selectStyle}>
              <option value="ALL">Favoritas: Todas</option>
              <option value="YES">Apenas Favoritas (♥)</option>
              <option value="NO">Não Favoritas</option>
            </select>
          </div>

          {!isFiltered && (
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'space-between', marginTop: '4px' }}>
              {currentGroups.slice(0, 10).map((g, i) => (
                <div key={i} onClick={() => { setCurrentPage(i); window.scrollTo(0, 0); }} style={{ background: currentPage === i ? '#ba0000' : '#333', borderColor: currentPage === i ? '#ba0000' : '#444', padding: '4px 0', borderRadius: '3px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', flex: 1, textAlign: 'center', border: '1px solid #444', color: '#fff' }}>
                  {new Date(g[0].date).getDate()}
                </div>
              ))}
            </div>
          )}

        </div>

        {/* LISTA */}
        <div style={{ background: '#1e1e1e', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
          
          {!isFiltered && displayItems.length > 0 && (
            <div style={{ background: '#252525', padding: '6px 15px', fontWeight: 'bold', color: '#ba0000', textTransform: 'capitalize', borderBottom: '2px solid #ba0000', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{new Date(displayItems[0].date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: '2-digit' })}</span>
              {currentPage === 0 && getStatusIndicator(displayItems[0].date)}
            </div>
          )}

          {displayItems.length > 0 ? (
            displayItems.map((item, idx) => {
              const artistColor = getArtistColor(item.artist_rating, item.total_albums);
              const flagElement = getCountryFlag(item.artist_country);
              const grPos = artistGRMap.get((item.artist || '').toLowerCase().trim());

              return (
                <div key={idx} onClick={() => openDeezer(item.artist, item.album)} style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', borderBottom: '1px solid #2a2a2a', gap: '12px', cursor: 'pointer' }}>
                  
                  <div>
                    <img src={item.album_art || 'https://lastfm.freetls.fastly.net/i/u/64s/4128a6eb29f94943c9d206c08e625904.png'} style={{ width: '55px', height: '55px', borderRadius: '3px', objectFit: 'cover', display: 'block' }} alt="album art" onError={(e) => { e.target.src = 'https://lastfm.freetls.fastly.net/i/u/64s/4128a6eb29f94943c9d206c08e625904.png'; }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    
                    {/* Linha 1: Nome da Música + Coração */}
                    <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{item.song}</span>
                      {item.is_favorite && (
                        <span style={{ color: '#e91e63', fontSize: '14px', lineHeight: 1 }} title="Música favorita">♥</span>
                      )}
                    </div>

                    {/* Linha 2: Nome do Artista (com cor de rating) + Total Scrobbles + GR + Score de Recência Retangular + Bandeira */}
                    <div style={{ fontSize: '12px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      
                      <span style={{ color: artistColor, fontWeight: 'bold' }}>{item.artist}</span>

                      {/* Total Scrobbles do Artista */}
                      {item.total_scrobbles > 0 && (
                        <span style={{ fontSize: '10px', color: '#ccc', fontWeight: 'bold' }}>
                          ({item.total_scrobbles.toLocaleString('pt-BR')})
                        </span>
                      )}

                      {/* Pílula de Posição GR */}
                      {grPos && (
                        <span style={getGRBadgeStyle(grPos)}>
                          {grPos}
                        </span>
                      )}

                      {/* Score de Recência (Retângulo com fundo colorido e fonte branca) */}
                      {item.artist_recency_score !== undefined && item.artist_recency_score !== null && (
                        <span style={{ 
                          backgroundColor: getScoreBgColor(item.artist_recency_score), 
                          color: '#ffffff', 
                          fontSize: '10px', 
                          fontWeight: 'bold',
                          padding: '1px 4px', 
                          borderRadius: '1px', 
                          lineHeight: '1.1',
                          display: 'inline-block'
                        }}>
                          {item.artist_recency_score}
                        </span>
                      )}

                      {/* País + Bandeira */}
                      {item.artist_country && (
                        <span style={{ color: '#888', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          • {flagElement} {item.artist_country}
                        </span>
                      )}
                    </div>

                    {/* Linha 3: Nome do Álbum + Qtd de Álbuns */}
                    <div style={{ color: '#888', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{item.album || '—'}</span>
                      {item.total_albums > 0 && (
                        <span style={{ color: '#666', fontSize: '10px' }}>
                          ({item.total_albums} {item.total_albums === 1 ? 'álbum' : 'álbuns'})
                        </span>
                      )}
                    </div>

                    {/* Linha 4: Data e Hora DD/MM/AA - HH:MM */}
                    <div style={{ color: '#888', fontSize: '10px', opacity: 0.7 }}>
                      {formatDateWithTime(item.date)}
                    </div>

                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Nenhum registro encontrado para os filtros aplicados.</div>
          )}
        </div>

        {/* PAGINAÇÃO */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', padding: '15px 10px' }}>
          <button disabled={currentPage === 0} onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo(0, 0); }} style={{ background: '#333', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', opacity: currentPage === 0 ? 0.15 : 1 }}>
            Previous
          </button>
          <span style={{ fontSize: '11px', color: '#888' }}>
            Página {currentPage + 1} de {totalPages || 1}
          </span>
          <button disabled={(currentPage + 1) >= totalPages} onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo(0, 0); }} style={{ background: '#333', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', opacity: (currentPage + 1) >= totalPages ? 0.15 : 1 }}>
            Next
          </button>
        </div>

        <div style={{ height: '60px' }}></div>
      </div>
    </div>
  );
}
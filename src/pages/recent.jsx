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

// --- FUNÇÃO PARA OBTER A BANDEIRA VIA FLAGCDN (USANDO O NOME OU CÓDIGO) ---
const getCountryFlag = (countryName) => {
  if (!countryName) return null;

  const codeMap = {
    'Brasil': 'br', 'Brazil': 'br',
    'Estados Unidos': 'us', 'United States': 'us', 'USA': 'us',
    'Reino Unido': 'gb', 'United Kingdom': 'gb', 'UK': 'gb',
    'Austrália': 'au', 'Australia': 'au',
    'Alemanha': 'de', 'Germany': 'de',
    'França': 'fr', 'France': 'fr',
    'Canadá': 'ca', 'Canada': 'ca',
    'Japão': 'jp', 'Japan': 'jp',
    'Itália': 'it', 'Italy': 'it',
    'Espanha': 'es', 'Spain': 'es',
    'Argentina': 'ar', 'Uruguai': 'uy', 'Uruguay': 'uy',
    'Irlanda': 'ie', 'Ireland': 'ie',
    'Suécia': 'se', 'Sweden': 'se',
    'Noruega': 'no', 'Norway': 'no',
    'Holanda': 'nl', 'Países Baixos': 'nl', 'Netherlands': 'nl',
    'Nova Zelândia': 'nz', 'New Zealand': 'nz',
    'México': 'mx', 'Chile': 'cl', 'Colômbia': 'co', 'Portugal': 'pt'
  };

  const code = codeMap[countryName];
  if (!code) return null;

  return (
    <img 
      src={`https://flagcdn.com/16x12/${code}.png`} 
      alt={countryName} 
      style={{ width: '16px', height: '12px', borderRadius: '1px', objectFit: 'cover' }} 
    />
  );
};

// --- FUNÇÃO DE COR BASEADA NO RATING / COLEÇÃO ---
const getArtistColor = (rating, totalAlbums) => {
  if (rating === 'A') return '#6dbe99';
  if (rating === 'B') return '#a3e04d';
  if (rating === 'C') return '#f8c039';
  if (rating === 'D') return '#e97b78';
  
  if (totalAlbums > 0) return '#4d388c';
  return '#aaaaaa';
};

export default function Recent() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Estados dos Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState('ALL');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedFavorite, setSelectedFavorite] = useState('ALL');

  // --- FUNÇÃO PARA FORMATO HH:MM ---
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

        const { data: fullData, error: fullError } = await supabase
          .from('recent_scrobbles_view')
          .select('*')
          .order('date', { ascending: false });
        
        if (!fullError && fullData) {
          setAllData(fullData);
          setFilteredData(prev => searchTerm.trim() ? prev : fullData);
        }
      } catch (err) {
        console.error("Erro na carga:", err);
        setLoading(false);
      }
    }
    initialLoad();
  }, []);

  // Aplicação Dinâmica dos Filtros
  useEffect(() => {
    let result = [...allData];

    // Filtro por Nome do Artista
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(item => (item.artist || '').toLowerCase().includes(term));
    }

    // Filtro por Rating do Artista
    if (selectedRating !== 'ALL') {
      if (selectedRating === 'NULL') {
        result = result.filter(item => !item.artist_rating);
      } else {
        result = result.filter(item => item.artist_rating === selectedRating);
      }
    }

    // Filtro por País
    if (selectedCountry !== 'ALL') {
      if (selectedCountry === 'NONE') {
        result = result.filter(item => !item.artist_country);
      } else {
        result = result.filter(item => item.artist_country === selectedCountry);
      }
    }

    // Filtro por Músicas Favoritas
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
  const currentGroups = groupData(filteredData);
  const currentDayData = currentGroups[currentPage] || null;

  // Lista única de países cadastrados para o dropdown
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

  if (loading) return <div style={{ padding: '20px', color: '#888', backgroundColor: '#121212', minHeight: '100vh' }}>Loading scrobbles...</div>;

  return (
    <div style={{ backgroundColor: '#121212', color: '#e0e0e0', fontFamily: 'Segoe UI, Roboto, sans-serif', height: '100vh', overflowY: 'scroll', WebkitOverflowScrolling: 'touch', padding: '10px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '1000px', margin: 'auto' }}>
        
        <div style={{ width: '100%', height: '140px', backgroundColor: '#1e1e1e', borderRadius: '8px', padding: '5px', boxSizing: 'border-box', marginBottom: '10px' }}>
          {allData.length > 0 && <Bar data={chartData} options={chartOptions} plugins={[customLabelsPlugin]} />}
        </div>

        {/* BARRA DE FILTROS */}
        <div style={{ backgroundColor: '#1e1e1e', padding: '10px', borderRadius: '8px', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input type="text" placeholder="Filter artist..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '6px 35px 6px 12px', backgroundColor: '#2a2a2a', border: '1px solid #444', borderRadius: '4px', color: '#fff', fontSize: '13px', height: '30px', boxSizing: 'border-box' }} />
            {searchTerm && <span onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '10px', cursor: 'pointer', color: '#888', fontWeight: 'bold', fontSize: '16px' }}>×</span>}
          </div>

          {/* CONTROLES DOS FILTROS */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            
            {/* Filtro Rating */}
            <select value={selectedRating} onChange={(e) => setSelectedRating(e.target.value)} style={selectStyle}>
              <option value="ALL">Rating: Todos</option>
              <option value="A">Rating: A</option>
              <option value="B">Rating: B</option>
              <option value="C">Rating: C</option>
              <option value="D">Rating: D</option>
              <option value="NULL">Sem Rating</option>
            </select>

            {/* Filtro País */}
            <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} style={selectStyle}>
              <option value="ALL">País: Todos</option>
              {countryList.map((country, idx) => (
                <option key={idx} value={country}>{country}</option>
              ))}
              <option value="NONE">Sem País</option>
            </select>

            {/* Filtro Favoritas */}
            <select value={selectedFavorite} onChange={(e) => setSelectedFavorite(e.target.value)} style={selectStyle}>
              <option value="ALL">Favoritas: Todas</option>
              <option value="YES">Apenas Favoritas (♥)</option>
              <option value="NO">Não Favoritas</option>
            </select>

          </div>

          {/* NAVEGAÇÃO DE DIAS */}
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'space-between', marginTop: '4px' }}>
            {currentGroups.slice(0, 10).map((g, i) => (
              <div key={i} onClick={() => { setCurrentPage(i); window.scrollTo(0, 0); }} style={{ background: currentPage === i ? '#ba0000' : '#333', borderColor: currentPage === i ? '#ba0000' : '#444', padding: '4px 0', borderRadius: '3px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', flex: 1, textAlign: 'center', border: '1px solid #444', color: '#fff' }}>
                {new Date(g[0].date).getDate()}
              </div>
            ))}
          </div>

        </div>

        {/* LISTA DE MÚSICAS */}
        <div style={{ background: '#1e1e1e', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
          {currentDayData ? (
            <>
              <div style={{ background: '#252525', padding: '6px 15px', fontWeight: 'bold', color: '#ba0000', textTransform: 'capitalize', borderBottom: '2px solid #ba0000', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{new Date(currentDayData[0].date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: '2-digit' })}</span>
                {currentPage === 0 && getStatusIndicator(currentDayData[0].date)}
              </div>

              {currentDayData.map((item, idx) => {
                const artistColor = getArtistColor(item.artist_rating, item.total_albums);
                const flagElement = getCountryFlag(item.artist_country);

                return (
                  <div key={idx} onClick={() => openDeezer(item.artist, item.album)} style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', borderBottom: '1px solid #2a2a2a', gap: '12px', cursor: 'pointer' }}>
                    <div>
                      <img src={item.album_art || 'https://lastfm.freetls.fastly.net/i/u/64s/4128a6eb29f94943c9d206c08e625904.png'} style={{ width: '55px', height: '55px', borderRadius: '3px', objectFit: 'cover', display: 'block' }} alt="album art" onError={(e) => { e.target.src = 'https://lastfm.freetls.fastly.net/i/u/64s/4128a6eb29f94943c9d206c08e625904.png'; }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      
                      {/* Música + Coração Maior */}
                      <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{item.song}</span>
                        {item.is_favorite && (
                          <span style={{ color: '#e91e63', fontSize: '14px', lineHeight: 1 }} title="Música favorita">♥</span>
                        )}
                      </div>

                      {/* Artista + Rating + Bandeira do País */}
                      <div style={{ color: artistColor, fontSize: '12px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{item.artist}</span>

                        {item.artist_rating && (
                          <span style={{ backgroundColor: '#2a2a2a', color: artistColor, border: `1px solid ${artistColor}`, padding: '0px 4px', borderRadius: '3px', fontSize: '9px', fontWeight: 'bold' }}>
                            {item.artist_rating}
                          </span>
                        )}

                        {item.artist_country && (
                          <span style={{ color: '#888', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            • {flagElement} {item.artist_country}
                          </span>
                        )}
                      </div>

                      {/* Álbum + Contagem de Álbuns */}
                      <div style={{ color: '#888', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{item.album || '—'}</span>
                        {item.total_albums > 0 && (
                          <span style={{ color: '#666', fontSize: '10px' }}>
                            ({item.total_albums} {item.total_albums === 1 ? 'álbum' : 'álbuns'})
                          </span>
                        )}
                      </div>

                      {/* Horário */}
                      <div style={{ color: '#888', fontSize: '10px', opacity: 0.7 }}>
                        {new Date(item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>

                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No data found for the applied filters.</div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', padding: '15px 10px' }}>
          <button disabled={currentPage === 0} onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo(0, 0); }} style={{ background: '#333', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', opacity: currentPage === 0 ? 0.15 : 1 }}>
            Previous
          </button>
          <span style={{ fontSize: '11px', color: '#888' }}>
            Day {currentPage + 1} of {currentGroups.length || 1}
          </span>
          <button disabled={(currentPage + 1) >= currentGroups.length} onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo(0, 0); }} style={{ background: '#333', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', opacity: (currentPage + 1) >= currentGroups.length ? 0.15 : 1 }}>
            Next
          </button>
        </div>

        <div style={{ height: '60px' }}></div>
      </div>
    </div>
  );
}
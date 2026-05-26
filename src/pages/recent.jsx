// src/pages/recent.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Garanta que este client usa a URL e Key do seu HTML
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

export default function Recent() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // --- FORÇAR LIBERAÇÃO DO SCROLL NO NAVEGADOR ---
  useEffect(() => {
    // Força o HTML e o Body do app a permitirem a rolagem de conteúdo
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    
    // Limpa as propriedades caso mude de página/componente
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, []);

  // --- 1. CARGA DOS DADOS IDÊNTICA AO SEU HTML ---
  useEffect(() => {
    async function initialLoad() {
      try {
        let loadedData = [];
        let offset = 0;
        let daysFound = 0;

        // Loop em blocos idêntico ao do seu arquivo html
        while (daysFound < 10 && offset < 2000) {
          const { data, error } = await supabase
            .from('recent_scrobbles_view') // Nome exato do seu HTML
            .select('*')
            .order('date', { ascending: false })
            .range(offset, offset + 499);
          
          if (error || !data || data.length === 0) break;
          
          loadedData = [...loadedData, ...data];
          // Agrupamento usando padrão 'en-US' para consistência das chaves de data
          const uniqueDays = new Set(loadedData.map(item => new Date(item.date).toLocaleDateString('en-US')));
          daysFound = uniqueDays.size;
          offset += 500;
        }

        setAllData(loadedData);
        setFilteredData(loadedData);
        setLoading(false);

        // Carrega o resto da biblioteca em background
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

  // --- 2. REGRA DE AGRUPAMENTO POR DATA ---
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

  // --- 3. FILTRAGEM DINÂMICA ---
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    const filtered = allData.filter(item => 
      (item.artist || '').toLowerCase().includes(term)
    );
    setFilteredData(filtered);
    setCurrentPage(0); 
  }, [searchTerm, allData]);

  const globalGroups = groupData(allData).slice(0, 10).reverse();
  const currentGroups = groupData(filteredData);
  const currentDayData = currentGroups[currentPage] || null;

  // --- 4. CONFIGURAÇÃO DO CHART.JS ---
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

  // --- 5. DEEZER DEEP LINK ---
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

  if (loading) return <div style={{ padding: '20px', color: '#888', backgroundColor: '#121212', minHeight: '100vh' }}>Loading scrobbles...</div>;

  return (
    <div style={{ backgroundColor: '#121212', color: '#e0e0e0', fontFamily: 'Segoe UI, Roboto, sans-serif', minHeight: '100vh', padding: '10px', boxSizing: 'border-box', overflowY: 'auto' }}>
      <div style={{ maxWidth: '1000px', margin: 'auto' }}>
        
        {/* GRÁFICO DE BARRAS */}
        <div style={{ width: '100%', height: '140px', backgroundColor: '#1e1e1e', borderRadius: '8px', padding: '5px', boxSizing: 'border-box', marginBottom: '10px' }}>
          {allData.length > 0 && <Bar data={chartData} options={chartOptions} plugins={[customLabelsPlugin]} />}
        </div>

        {/* CONTROLES */}
        <div style={{ backgroundColor: '#1e1e1e', padding: '10px', borderRadius: '8px', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Filter artist..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '6px 35px 6px 12px', backgroundColor: '#2a2a2a', border: '1px solid #444', borderRadius: '4px', color: '#fff', fontSize: '13px', height: '30px', boxSizing: 'border-box' }}
            />
            {searchTerm && <span onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '10px', cursor: 'pointer', color: '#888', fontWeight: 'bold', fontSize: '16px' }}>×</span>}
          </div>

          {/* QUADRADINHOS DOS DIAS */}
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'space-between' }}>
            {currentGroups.slice(0, 10).map((g, i) => (
              <div
                key={i}
                onClick={() => { setCurrentPage(i); window.scrollTo(0, 0); }}
                style={{
                  background: currentPage === i ? '#ba0000' : '#333',
                  borderColor: currentPage === i ? '#ba0000' : '#444',
                  padding: '4px 0', borderRadius: '3px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', flex: 1, textAlign: 'center', border: '1px solid #444', color: '#fff'
                }}
              >
                {new Date(g[0].date).getDate()}
              </div>
            ))}
          </div>
        </div>

        {/* LISTA CONTAINER */}
        <div style={{ background: '#1e1e1e', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
          {currentDayData ? (
            <>
              {/* Formato de Data em Inglês */}
              <div style={{ background: '#252525', padding: '6px 15px', fontWeight: 'bold', color: '#ba0000', textTransform: 'capitalize', borderBottom: '2px solid #ba0000', fontSize: '13px' }}>
                {new Date(currentDayData[0].date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: '2-digit' })}
              </div>

              {currentDayData.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => openDeezer(item.artist, item.album)}
                  style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', borderBottom: '1px solid #2a2a2a', gap: '12px', cursor: 'pointer' }}
                >
                  <div>
                    <img 
                      src={item.album_art || 'https://lastfm.freetls.fastly.net/i/u/64s/4128a6eb29f94943c9d206c08e625904.png'} 
                      style={{ width: '55px', height: '55px', borderRadius: '3px', objectFit: 'cover', display: 'block' }} 
                      alt="album art"
                      onError={(e) => { e.target.src = 'https://lastfm.freetls.fastly.net/i/u/64s/4128a6eb29f94943c9d206c08e625904.png'; }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.song}</div>
                    <div style={{ color: '#e0e0e0', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.artist}</div>
                    <div style={{ color: '#888', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.album || '—'}</div>
                    <div style={{ color: '#888', fontSize: '10px', opacity: 0.7 }}>
                      {/* Formato de Hora em Inglês (AM/PM) */}
                      {new Date(item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No data found for the applied filters.</div>
          )}
        </div>

        {/* CONTROLES INFERIORES */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', padding: '15px 10px' }}>
          <button 
            disabled={currentPage === 0} 
            onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo(0, 0); }}
            style={{ background: '#333', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', opacity: currentPage === 0 ? 0.15 : 1 }}
          >
            Previous
          </button>
          <span style={{ fontSize: '11px', color: '#888' }}>
            Day {currentPage + 1} of {currentGroups.length || 1}
          </span>
          <button 
            disabled={(currentPage + 1) >= currentGroups.length} 
            onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo(0, 0); }}
            style={{ background: '#333', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', opacity: (currentPage + 1) >= currentGroups.length ? 0.15 : 1 }}
          >
            Next
          </button>
        </div>

        <div style={{ height: '60px' }}></div>
      </div>
    </div>
  );
}
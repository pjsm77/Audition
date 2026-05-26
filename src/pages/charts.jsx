// src/pages/charts.jsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables, ChartDataLabels);

export default function MusicCharts() {
  const [entityType, setEntityType] = useState('track');
  const [currentLevel, setCurrentLevel] = useState('year');
  const [selectedYear, setSelectedYear] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let start = '2014-01-01';
      let end = '2026-12-31';

      if (currentLevel === 'month' && selectedYear) {
        start = `${selectedYear}-01-01`;
        end = `${selectedYear}-12-31`;
      }

      try {
        const { data, error } = await supabase.rpc('get_scrobble_chart_stats', {
          entidade_tipo: entityType,
          entidade_nome: '%',
          periodo_tipo: currentLevel,
          data_inicio: start,
          data_fim: end
        });

        if (error) throw error;
        if (data) setChartData(data);
      } catch (err) {
        console.error("Erro na carga do gráfico:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [entityType, currentLevel, selectedYear]);

  useEffect(() => {
    if (!canvasRef.current || chartData.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartData.map(d => d.data_label),
        datasets: [{
          label: 'Qty',
          data: chartData.map(d => d.quantidade),
          backgroundColor: '#2c3e50', // Azul escuro sóbrio combinando com o tema claro
          hoverBackgroundColor: '#1a252f',
          borderRadius: 4,
          indexAxis: 'y'
        }]
      },
      options: {
        indexAxis: 'y',
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          x: { display: false },
          y: {
            grid: { display: false },
            ticks: { color: '#000', font: { size: 13, family: "'Bebas Neue', cursive" } }
          }
        },
        plugins: {
          legend: { display: false },
          datalabels: {
            color: '#000',
            anchor: 'end',
            align: 'right',
            offset: 5,
            font: { weight: 'bold', size: 11, family: 'sans-serif' },
            formatter: (val) => val > 0 ? val.toLocaleString() : ''
          }
        },
        onClick: (e, el) => {
          if (el.length > 0 && currentLevel === 'year') {
            const index = el[0].index;
            const label = chartInstanceRef.current.data.labels[index];
            setCurrentLevel('month');
            setSelectedYear(label);
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartData, currentLevel]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Bebas Neue', cursive", backgroundColor: '#ffffff' }}>
      
      {/* Topo / Cabeçalho de Seleção no estilo das tabelas */}
      <div style={{ display: 'flex', background: '#f1f1f1', borderBottom: '2px solid #ddd', height: '45px', alignItems: 'center', padding: '0 15px', gap: '20px' }}>
        {[
          { id: 'track', label: 'TRACKS' },
          { id: 'album', label: 'ALBUMS' },
          { id: 'artist', label: 'ARTISTS' }
        ].map(item => (
          <label key={item.id} style={{ fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="radio"
              name="entity"
              value={item.id}
              checked={entityType === item.id}
              onChange={(e) => setEntityType(e.target.value)}
              style={{ accentColor: '#2c3e50' }}
            />
            <span style={{ color: entityType === item.id ? '#000' : '#777', fontWeight: entityType === item.id ? 'bold' : 'normal' }}>
              {item.label}
            </span>
          </label>
        ))}
      </div>

      {/* Espaço do Gráfico */}
      <div style={{ flex: 1, padding: '15px', position: 'relative', minHeight: 0 }}>
        {loading && (
          <div style={{ position: 'absolute', color: '#666', fontSize: '24px' }}>
            Loading...
          </div>
        )}
        <canvas ref={canvasRef} id="drillChart"></canvas>
      </div>

      {/* Rodapé Padrão da sua aplicação */}
      <div style={{ height: '45px', background: '#f1f1f1', display: 'flex', alignItems: 'center', borderTop: '1px solid #ddd', padding: '0 15px' }}>
        <button 
          onClick={() => { if (currentLevel === 'month') { setCurrentLevel('year'); setSelectedYear(null); } }} 
          style={{ 
            background: currentLevel === 'month' ? '#2c3e50' : '#e0e0e0', 
            color: currentLevel === 'month' ? 'white' : '#999', 
            border: 'none', 
            padding: '4px 12px', 
            borderRadius: '4px', 
            cursor: currentLevel === 'month' ? 'pointer' : 'default', 
            fontFamily: "'Bebas Neue', cursive",
            fontSize: '14px'
          }}
        >
          {currentLevel === 'year' ? 'ANUAL' : `« BACK TO ANUAL (${selectedYear})`}
        </button>
        <span style={{ fontSize: '14px', marginLeft: 'auto', color: '#555', fontWeight: 'bold' }}>
          {currentLevel === 'year' ? 'ANUAL' : `MONTHLY - ${selectedYear}`}
        </span>
      </div>

    </div>
  );
}
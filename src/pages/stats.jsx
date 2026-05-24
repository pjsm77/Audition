import React, { useEffect, useState } from 'react';

// Card estruturado em lista vertical com estilo inline garantido
const StatCard = ({ title, value, iconPath }) => (
  <div 
    className="rounded-xl"
    style={{ 
      backgroundColor: '#e0f2fe', // Azul claro (slate-100 / sky-100)
      border: '2px solid #7dd3fc', // Borda azul um pouco mais escura para dar destaque
      padding: '16px',
      marginBottom: '12px', // Espaçamento para o card de baixo
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'between',
      width: '100%',
      boxSizing: 'border-box',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
    }}
  >
    {/* Bloco de Texto (Título em inglês + Valor) */}
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ fontSize: '12px', fontWeight: '700', color: '#0369a1', textTransform: 'uppercase', tracking: 'wider' }}>
        {title}
      </span>
      <h3 style={{ margin: 0, fontSize: '26px', fontWeight: '900', color: '#0c4a6e', tracking: 'tight' }}>
        {value !== null ? value.toLocaleString() : '...'}
      </h3>
    </div>

    {/* Ícone Contido à Direita */}
    <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#0369a1' }}>
      <svg 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        strokeWidth="2.5"
        style={{ width: '24px', height: '24px', minWidth: '24px', minHeight: '24px', display: 'block' }}
      >
        {iconPath}
      </svg>
    </div>
  </div>
);

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats({
          artists: 1240,
          albums: 3420,
          tracks: 45890,
          countries: 42,
          scrobbles: 184500
        });
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ color: '#64748b', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full min-h-screen bg-slate-50 p-4 flex flex-col"
      style={{ boxSizing: 'border-box', paddingBottom: '32px' }}
    >
      
      {/* Título Simplificado */}
      <header style={{ marginBottom: '20px', paddingLeft: '2px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.025em', color: '#0f172a' }}>
          Stats
        </h1>
      </header>

      {/* Lista de Cards - Um embaixo do outro */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        
        <StatCard 
          title="Artists" 
          value={stats?.artists} 
          iconPath={<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />}
        />

        <StatCard 
          title="Albums" 
          value={stats?.albums} 
          iconPath={<path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 0L21 8.25M19.5 6V12m0 0.5a3 3 0 11-6 0 3 3 0 016 0zM6 10.5a3 3 0 11-6 0 3 3 0 016 0zM6 10.5h13.5" />}
        />

        <StatCard 
          title="Tracks" 
          value={stats?.tracks} 
          iconPath={<path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm12-3c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zM9 10l12-3" />}
        />

        <StatCard 
          title="Countries" 
          value={stats?.countries} 
          iconPath={<path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.003 9.003 0 018.716 4.253M12 3a9.003 9.003 0 00-8.716 4.253M12 12h.008v.008H12V12z" />}
        />

        <StatCard 
          title="Scrobbles" 
          value={stats?.scrobbles} 
          iconPath={<path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653z" />}
        />

      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';

// Componente de Card com tamanho controlado e layout limpo
const StatCard = ({ title, value, iconPath, gridSpan = "" }) => (
  <div className={`bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[110px] ${gridSpan}`}>
    {/* Topo do Card: Ícone pequeno + Título */}
    <div className="flex items-center gap-2">
      <div className="text-slate-700 flex-shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          {iconPath}
        </svg>
      </div>
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
        {title}
      </span>
    </div>

    {/* Base do Card: Valor numérico */}
    <div className="mt-2">
      <h3 className="text-2xl font-black text-slate-800 tracking-tight">
        {value !== null ? value.toLocaleString() : '...'}
      </h3>
    </div>
  </div>
);

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simulando o retorno da sua vw_stats
        setStats({
          total_artists: 1240,
          total_albums: 3420,
          total_tracks: 45890,
          total_countries: 42,
          total_scrobbles: 184500
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
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">
          Carregando dados...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 p-4 flex flex-col pb-24">
      
      {/* Cabeçalho */}
      <header className="mb-5 pl-1">
        <h1 className="text-xl font-black tracking-tight uppercase text-slate-900">
          Dashboard de Música
        </h1>
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
          Visão geral da sua biblioteca em tempo real
        </p>
      </header>

      {/* Grid de Cards - Ajustado para caber perfeitamente no Mobile e Desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* Card: Artistas */}
        <StatCard 
          title="Artistas" 
          value={stats?.total_artists} 
          iconPath={<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />}
        />

        {/* Card: Álbuns */}
        <StatCard 
          title="Álbuns" 
          value={stats?.total_albums} 
          iconPath={<path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 0L21 8.25M19.5 6V12m0 0.5a3 3 0 11-6 0 3 3 0 016 0zM6 10.5a3 3 0 11-6 0 3 3 0 016 0zM6 10.5h13.5" />}
        />

        {/* Card: Músicas */}
        <StatCard 
          title="Músicas" 
          value={stats?.total_tracks} 
          iconPath={<path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm12-3c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zM9 10l12-3" />}
        />

        {/* Card: Países */}
        <StatCard 
          title="Países" 
          value={stats?.total_countries} 
          iconPath={<path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.003 9.003 0 018.716 4.253M12 3a9.003 9.003 0 00-8.716 4.253M12 12h.008v.008H12V12z" />}
        />

        {/* Card: Scrobbles - Ocupa 2 colunas no mobile para fechar o layout bonito */}
        <StatCard 
          title="Scrobbles" 
          value={stats?.total_scrobbles} 
          gridSpan="col-span-2 sm:col-span-1"
          iconPath={<path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653z" />}
        />

      </div>
    </div>
  );
}
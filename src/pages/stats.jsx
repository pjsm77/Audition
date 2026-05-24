import React, { useEffect, useState } from 'react';

// Card moderno com proporção flexível para preencher a tela
const StatCard = ({ title, value, iconPath, gradient }) => (
  <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:border-slate-700 hover:scale-[1.01] group flex-1">
    {/* Gradiente de fundo sutil no hover */}
    <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${gradient}`} />
    
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{title}</span>
      <div className={`p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 shadow-inner`}>
        <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          {iconPath}
        </svg>
      </div>
    </div>

    <div className="mt-auto">
      <h3 className="text-4xl xl:text-5xl font-black text-white tracking-tight">
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
        // Simulando o retorno da vw_stats para teste:
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
      <div className="flex justify-center items-center h-screen bg-[#0b0f19]">
        <div className="text-slate-400 font-medium tracking-widest animate-pulse uppercase text-xs">
          Sincronizando dados...
        </div>
      </div>
    );
  }

  return (
    // h-screen + overflow-hidden garante que NADA saia da tela ou crie barras de rolagem
    <div className="h-screen w-full bg-[#0b0f19] text-slate-100 p-6 md:p-8 flex flex-col overflow-hidden font-sans">
      
      {/* Header Fixo */}
      <header className="mb-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="text-xl font-bold tracking-tight text-slate-200">Dashboard de Música</h1>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">Visão geral da sua biblioteca em tempo real</p>
      </header>

      {/* Grid Dinâmico: se adapta verticalmente para ocupar o espaço restante */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 min-h-0">
        
        <StatCard 
          title="Artistas" 
          value={stats?.total_artists} 
          gradient="bg-blue-500"
          iconPath={<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />}
        />

        <StatCard 
          title="Álbuns" 
          value={stats?.total_albums} 
          gradient="bg-emerald-500"
          iconPath={<path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 0L21 8.25M19.5 6V12m0 0.5a3 3 0 11-6 0 3 3 0 016 0zM6 10.5a3 3 0 11-6 0 3 3 0 016 0zM6 10.5h13.5" />}
        />

        <StatCard 
          title="Músicas" 
          value={stats?.total_tracks} 
          gradient="bg-purple-500"
          iconPath={<path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm12-3c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zM9 10l12-3" />}
        />

        <StatCard 
          title="Países" 
          value={stats?.total_countries} 
          gradient="bg-amber-500"
          iconPath={<path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.003 9.003 0 018.716 4.253M12 3a9.003 9.003 0 00-8.716 4.253M12 12h.008v.008H12V12z" />}
        />

        <StatCard 
          title="Scrobbles" 
          value={stats?.total_scrobbles} 
          gradient="bg-rose-500"
          iconPath={<path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653z" />}
        />

      </div>
    </div>
  );
}
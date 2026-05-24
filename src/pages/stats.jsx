import React, { useEffect, useState } from 'react';

// Componente Interno de Card com ícones SVG inline
const StatCard = ({ title, value, iconPath, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800 mt-1">
        {value !== null ? value.toLocaleString() : '...'}
      </h3>
    </div>
    <div className={`p-3 rounded-lg text-white ${color}`}>
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
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
        // Exemplo: const { data } = await supabase.from('vw_stats').select('*').single();
        // setStats(data);
        
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
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="text-slate-500 font-medium animate-pulse">Carregando estatísticas...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Minha Coleção Musical</h1>
        <p className="text-sm text-slate-500">Dados gerais e histórico de reprodução</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {/* Card: Artistas */}
        <StatCard 
          title="Artistas" 
          value={stats?.total_artists} 
          color="bg-blue-500" 
          iconPath={<path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.771m.019 3.193a9.093 9.093 0 013.741.479m11.138-8.87a3.375 3.375 0 10-4.969-4.134 3.375 3.375 0 004.969 4.134zM4.965 11.01a3.375 3.375 0 11-4.97-4.134 3.375 3.375 0 014.97 4.134zM12 11a3 3 0 100-6 3 3 0 000 6z" />}
        />

        {/* Card: Álbuns */}
        <StatCard 
          title="Álbuns" 
          value={stats?.total_albums} 
          color="bg-emerald-500" 
          iconPath={<path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 0L21 8.25M19.5 6V12m0 0.5a3 3 0 11-6 0 3 3 0 016 0zM6 10.5a3 3 0 11-6 0 3 3 0 016 0zM6 10.5h13.5" />}
        />

        {/* Card: Músicas */}
        <StatCard 
          title="Músicas" 
          value={stats?.total_tracks} 
          color="bg-purple-500" 
          iconPath={<path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm12-3c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zM9 10l12-3" />}
        />

        {/* Card: Países */}
        <StatCard 
          title="Países" 
          value={stats?.total_countries} 
          color="bg-amber-500" 
          iconPath={<path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.59a1.5 1.5 0 00.732.996l.825.427a1.5 1.5 0 01.812 1.332v1.123a1.5 1.5 0 001.5 1.5h1.122a1.5 1.5 0 011.06.44l1.104 1.103a1.5 1.5 0 010 2.122l-1.104 1.104a1.5 1.5 0 01-1.06.44H4.5A2.25 2.25 0 012.25 15V6.115a2.25 2.25 0 012.25-2.25h1.123a1.5 1.5 0 011.492 1.325z" />}
        />

        {/* Card: Scrobbles */}
        <StatCard 
          title="Scrobbles" 
          value={stats?.total_scrobbles} 
          color="bg-rose-500" 
          iconPath={<path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653z" />}
        />
      </div>
    </div>
  );
}
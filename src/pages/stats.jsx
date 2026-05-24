import React, { useEffect, useState } from 'react';
import { Music, Disc, Users, Globe, Play } from 'lucide-react';

// Componente Interno de Card para organização e reutilização
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800 mt-1">
        {value !== null ? value.toLocaleString() : '...'}
      </h3>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Substitua pela sua chamada de API real (Ex: Supabase, Axios, Fetch)
    const fetchStats = async () => {
      try {
        // Exemplo fictício de fetch para buscar a view:
        // const { data } = await supabase.from('vw_stats').select('*').single();
        // setStats(data);
        
        // Simulando o retorno da vw_stats:
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
        <p className="text-slate-500 font-medium">Carregando estatísticas...</p>
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
        <StatCard 
          title="Artistas" 
          value={stats?.total_artists} 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Álbuns" 
          value={stats?.total_albums} 
          icon={Disc} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Músicas" 
          value={stats?.total_tracks} 
          icon={Music} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Países" 
          value={stats?.total_countries} 
          icon={Globe} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Scrobbles" 
          value={stats?.total_scrobbles} 
          icon={Play} 
          color="bg-rose-500" 
        />
      </div>
    </div>
  );
}
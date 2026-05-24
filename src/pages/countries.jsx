import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Ajuste o caminho do seu cliente Supabase

export default function Countries() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCountryStats() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('v_countries_stats')
          .select('*'); // Removemos o .order fixo daqui para usar o padrão da View
  
        if (error) throw error;
        
        // LOG DE CONTROLE: Abra o console do navegador (F12) para ver o que retornou
        console.log("Dados retornados da View:", data);
        
        setCountries(data || []);
      } catch (error) {
        console.error('Erro ao buscar estatísticas dos países:', error.message);
      } finally {
        setLoading(false);
      }
    }
  
    fetchCountryStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#121214] text-white">
        <p className="text-gray-400 font-medium">Carregando estatísticas dos países...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121214] text-[#e1e1e6] p-4 font-sans selection:bg-green-500 selection:text-black">
      <div className="max-w-6xl mx-auto overflow-x-auto rounded-lg border border-[#29292e] bg-[#1c1c1f]">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#29292e] text-[#8d8d99] font-semibold text-xs tracking-wider uppercase bg-[#18181c]">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">País</th>
              <th className="py-3 px-4 text-center">Art</th>
              <th className="py-3 px-4 text-center">Alb</th>
              <th className="py-3 px-4 text-center">Mús Únic</th>
              <th className="py-3 px-4 text-center">Scrobbles</th>
              <th className="py-3 px-4 text-center">Horas</th>
              <th className="py-3 px-4 text-center w-28">Ratings (3 | 2 | 1)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#29292e]">
            {countries.map((country, index) => (
              <tr 
                key={country.id_country} 
                className="hover:bg-[#202024] transition-colors duration-150 group"
              >
                {/* Posição */}
                <td className="py-3 px-4 text-center font-mono text-[#8d8d99] group-hover:text-white">
                  {index + 1}
                </td>
                
                {/* Bandeira + Nome (Em inglês como solicitado) */}
                <td className="py-3 px-4 flex items-center gap-3 font-semibold text-white">
                  <img 
                    src={`https://flagcdn.com/w40/${country.country_code.toLowerCase()}.png`} 
                    alt={`Bandeira de ${country.country_name}`}
                    className="w-6 h-auto rounded-sm shadow-sm object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }} 
                  />
                  <span className="uppercase tracking-wide">{country.country_name}</span>
                </td>

                {/* Total Artistas */}
                <td className="py-3 px-4 text-center font-bold text-white">
                  {country.total_artists}
                </td>

                {/* Total Álbuns */}
                <td className="py-3 px-4 text-center font-mono text-[#c4c4cc]">
                  {country.total_albums}
                </td>

                {/* Músicas Únicas */}
                <td className="py-3 px-4 text-center font-mono text-[#c4c4cc]">
                  {country.total_unique_songs}
                </td>

                {/* Total Scrobbles */}
                <td className="py-3 px-4 text-center font-mono font-semibold text-green-400">
                  {country.total_scrobbles?.toLocaleString('pt-BR')}
                </td>

                {/* Horas Escutadas */}
                <td className="py-3 px-4 text-center font-mono text-cyan-400">
                  {country.total_hours_listened}h
                </td>

                {/* Ratings Bloco (3, 2, 1) */}
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-2 font-mono text-xs font-bold">
                    <span className="text-green-500">{country.rating_3_count}</span>
                    <span className="text-gray-600">|</span>
                    <span className="text-yellow-500">{country.rating_2_count}</span>
                    <span className="text-gray-600">|</span>
                    <span className="text-red-500">{country.rating_1_count}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
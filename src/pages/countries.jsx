import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; 

export default function Countries() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Controle de Ordenação: campo atual e direção (asc ou desc)
  const [sortConfig, setSortConfig] = useState({ key: 'total_artists', direction: 'desc' });

  useEffect(() => {
    async function fetchCountryStats() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('v_countries_stats')
          .select('*');

        if (error) throw error;

        // Se a ordem padrão inicial for total_artists desc, aplicamos aqui
        const sortedData = [...(data || [])].sort((a, b) => b.total_artists - a.total_artists);
        setCountries(sortedData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCountryStats();
  }, []);

  // Função de Ordenação Dinâmica
  const handleSort = (key) => {
    let direction = 'desc'; // Padrão para quase todos os campos primeiro
    
    if (key === 'country_name') {
      // Nome do país ordena ASC primeiro por padrão alfabético
      direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // Outros campos ordenam DESC primeiro. Se já for o atual desc, inverte para asc
      if (sortConfig.key === key && sortConfig.direction === 'desc') {
        direction = 'asc';
      }
    }

    const sortedData = [...countries].sort((a, b) => {
      let valA = a[key];
      let valB = b[key];

      // Tratamento para strings
      if (typeof valA === 'string') {
        return direction === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }

      // Tratamento para números
      return direction === 'asc' ? valA - valB : valB - valA;
    });

    setSortConfig({ key, direction });
    setCountries(sortedData);
  };

  // Ícone indicador de direção na coluna correspondente
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ▴' : ' ▾';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#121214] text-gray-400 font-sans">
        Carregando estatísticas...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121214] text-[#e1e1e6] p-4 font-sans antialiased">
      <div className="max-w-6xl mx-auto overflow-x-auto rounded-md bg-[#121214]">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#29292e] text-[#8d8d99] font-bold text-xs uppercase tracking-wider bg-[#121214]">
              <th className="py-3 px-2 w-12 text-center text-[#4e4e54]">#</th>
              <th 
                className="py-3 px-4 cursor-pointer hover:text-white select-none transition-colors"
                onClick={() => handleSort('country_name')}
              >
                País{getSortIcon('country_name')}
              </th>
              <th 
                className="py-3 px-4 text-center cursor-pointer hover:text-white select-none transition-colors"
                onClick={() => handleSort('total_artists')}
              >
                Art{getSortIcon('total_artists')}
              </th>
              <th 
                className="py-3 px-4 text-center cursor-pointer hover:text-white select-none transition-colors"
                onClick={() => handleSort('total_albums')}
              >
                Alb{getSortIcon('total_albums')}
              </th>
              <th 
                className="py-3 px-4 text-center cursor-pointer hover:text-white select-none transition-colors"
                onClick={() => handleSort('total_unique_songs')}
              >
                Mús{getSortIcon('total_unique_songs')}
              </th>
              <th 
                className="py-3 px-4 text-center cursor-pointer hover:text-white select-none transition-colors"
                onClick={() => handleSort('total_scrobbles')}
              >
                Scrobbles{getSortIcon('total_scrobbles')}
              </th>
              <th className="py-3 px-4 text-center w-36">Ratings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c1c1f]">
            {countries.map((country, index) => {
              // Cálculo de porcentagem para as barras horizontais empilhadas
              const total = country.total_artists || 1;
              const p3 = (country.rating_3_count / total) * 100;
              const p2 = (country.rating_2_count / total) * 100;
              const p1 = (country.rating_1_count / total) * 100;

              return (
                <tr 
                  key={country.id_country} 
                  className="hover:bg-[#1c1c1f] transition-colors border-b border-[#161618]/50"
                >
                  {/* Posição */}
                  <td className="py-3 px-2 text-center font-mono text-[#4e4e54]">
                    {index + 1}
                  </td>
                  
                  {/* Bandeira + Nome do País (Maiúsculo e em inglês) */}
                  <td className="py-3 px-4 flex items-center gap-3 font-bold text-[#e1e1e6]">
                    {/* Renderiza a flag usando o mesmo formato/caminho que você usa em albums.jsx */}
                    <span className={`fi fi-${country.country_code?.toLowerCase()} rounded-sm w-5 h-4 object-cover`} />
                    <span className="uppercase tracking-wide text-xs">{country.country_name}</span>
                  </td>

                  {/* Total de Artistas */}
                  <td className="py-3 px-4 text-center font-bold text-white">
                    {country.total_artists}
                  </td>

                  {/* Total de Álbuns */}
                  <td className="py-3 px-4 text-center font-medium text-[#a8a8b3]">
                    {country.total_albums}
                  </td>

                  {/* Total de Músicas (Faixas da tbl_tracks) */}
                  <td className="py-3 px-4 text-center font-medium text-[#a8a8b3]">
                    {country.total_unique_songs}
                  </td>

                  {/* Total Scrobbles Real */}
                  <td className="py-3 px-4 text-center font-mono font-medium text-[#a8a8b3]">
                    {country.total_scrobbles?.toLocaleString('pt-BR')}
                  </td>

                  {/* Coluna Ratings: Números coloridos + Barra Proporcional Empilhada */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-col gap-1 w-full justify-center">
                      {/* Valores numéricos coloridos */}
                      <div className="flex items-center justify-center gap-1.5 font-mono text-[11px] font-bold">
                        <span className="text-[#4ade80]">{country.rating_3_count}</span>
                        <span className="text-[#facc15]">{country.rating_2_count}</span>
                        <span className="text-[#f87171]">{country.rating_1_count}</span>
                      </div>
                      
                      {/* Barra empilhada horizontal (Proporção 100%) */}
                      <div className="w-full bg-[#29292e] h-1.5 rounded-full overflow-hidden flex">
                        {p3 > 0 && <div style={{ width: `${p3}%` }} className="bg-[#4ade80] h-full" title={`Nota 3: ${p3.toFixed(0)}%`} />}
                        {p2 > 0 && <div style={{ width: `${p2}%` }} className="bg-[#facc15] h-full" title={`Nota 2: ${p2.toFixed(0)}%`} />}
                        {p1 > 0 && <div style={{ width: `${p1}%` }} className="bg-[#f87171] h-full" title={`Nota 1: ${p1.toFixed(0)}%`} />}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
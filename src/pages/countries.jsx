import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; 

export default function Countries() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Ordenação padrão: Artistas por país, desc
  const [sortConfig, setSortConfig] = useState({ key: 'total_artists', direction: 'desc' });

  useEffect(() => {
    async function fetchCountryStats() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('v_countries_stats')
          .select('*');

        if (error) throw error;

        // Aplica a ordenação inicial padrão (total_artists desc)
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

  // Lógica de ordenação alternada
  const handleSort = (key) => {
    let direction = 'desc'; 
    
    if (key === 'country_name') {
      direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      if (sortConfig.key === key && sortConfig.direction === 'desc') {
        direction = 'asc';
      }
    }

    const sortedData = [...countries].sort((a, b) => {
      let valA = a[key];
      let valB = b[key];

      if (typeof valA === 'string') {
        return direction === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }

      return direction === 'asc' ? valA - valB : valB - valA;
    });

    setSortConfig({ key, direction });
    setCountries(sortedData);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white text-gray-500 font-sans">
        Carregando estatísticas dos países...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#444] p-4 font-sans antialiased">
      <div className="max-w-4xl mx-auto overflow-x-auto bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#ececec] text-[#9a9a9a] font-bold text-[10px] uppercase tracking-wider">
              <th className="py-3 px-2 w-12 text-center text-[#b5b5b5]">#</th>
              <th 
                className="py-3 px-4 cursor-pointer hover:text-black select-none transition-colors"
                onClick={() => handleSort('country_name')}
              >
                País {sortConfig.key === 'country_name' ? (sortConfig.direction === 'asc' ? '▴' : '▾') : ''}
              </th>
              <th 
                className="py-3 px-4 text-center cursor-pointer hover:text-black select-none transition-colors font-bold"
                onClick={() => handleSort('total_artists')}
              >
                Art {sortConfig.key === 'total_artists' ? (sortConfig.direction === 'asc' ? '▴' : '▾') : ''}
              </th>
              <th 
                className="py-3 px-4 text-center cursor-pointer hover:text-black select-none transition-colors font-bold"
                onClick={() => handleSort('total_albums')}
              >
                Alb {sortConfig.key === 'total_albums' ? (sortConfig.direction === 'asc' ? '▴' : '▾') : ''}
              </th>
              <th 
                className="py-3 px-4 text-center cursor-pointer hover:text-black select-none transition-colors font-bold"
                onClick={() => handleSort('total_unique_songs')}
              >
                Mús {sortConfig.key === 'total_unique_songs' ? (sortConfig.direction === 'asc' ? '▴' : '▾') : ''}
              </th>
              <th 
                className="py-3 px-4 text-center cursor-pointer hover:text-black select-none transition-colors font-bold"
                onClick={() => handleSort('total_scrobbles')}
              >
                Scrobbles {sortConfig.key === 'total_scrobbles' ? (sortConfig.direction === 'asc' ? '▴' : '▾') : ''}
              </th>
              <th className="py-3 px-4 text-center font-bold">Ratings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5f5f5]">
            {countries.map((country, index) => {
              const total = country.total_artists || 1;
              const p3 = (country.rating_3_count / total) * 100;
              const p2 = (country.rating_2_count / total) * 100;
              const p1 = (country.rating_1_count / total) * 100;

              return (
                <tr 
                  key={country.id_country} 
                  className="hover:bg-[#fcfcfc] transition-colors"
                >
                  {/* Posição */}
                  <td className="py-3 px-2 text-center font-mono text-[13px] text-[#b5b5b5]">
                    {index + 1}
                  </td>
                  
                  {/* Bandeira + Nome do País em Inglês, Caixa Alta e Bold */}
                  <td className="py-3 px-4 flex items-center gap-3 font-extrabold text-[#2c2c2c]">
                    <span className={`fi fi-${country.country_code?.toLowerCase()} rounded-sm w-6 h-4 object-cover shadow-sm`} />
                    <span className="tracking-wide text-[12px] uppercase">{country.country_name}</span>
                  </td>

                  {/* Total Artistas (Em negrito escuro igual ao print) */}
                  <td className="py-3 px-4 text-center font-extrabold text-[#2c2c2c] text-[14px]">
                    {country.total_artists}
                  </td>

                  {/* Total Álbuns */}
                  <td className="py-3 px-4 text-center font-normal text-[#7c7c7c] text-[13px]">
                    {country.total_albums}
                  </td>

                  {/* Total Músicas */}
                  <td className="py-3 px-4 text-center font-normal text-[#7c7c7c] text-[13px]">
                    {country.total_unique_songs}
                  </td>

                  {/* Total Scrobbles Reais */}
                  <td className="py-3 px-4 text-center font-normal text-[#7c7c7c] text-[13px]">
                    {country.total_scrobbles?.toLocaleString('pt-BR')}
                  </td>

                  {/* Detalhe de Ratings com Números Coloridos e Barra Empilhada */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col items-center gap-1 w-24 mx-auto">
                      <div className="flex items-center justify-center gap-1 font-sans text-[11px] font-bold">
                        <span className="text-[#4caf50]">{country.rating_3_count}</span>
                        <span className="text-[#ff9800]">{country.rating_2_count}</span>
                        <span className="text-[#f44336]">{country.rating_1_count}</span>
                      </div>
                      
                      {/* Barra horizontal de proporção do país */}
                      <div className="w-full bg-[#f0f0f0] h-1 rounded-full overflow-hidden flex">
                        {p3 > 0 && <div style={{ width: `${p3}%` }} className="bg-[#4caf50] h-full" />}
                        {p2 > 0 && <div style={{ width: `${p2}%` }} className="bg-[#ff9800] h-full" />}
                        {p1 > 0 && <div style={{ width: `${p1}%` }} className="bg-[#f44336] h-full" />}
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
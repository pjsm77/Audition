import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; 

export default function Countries() {
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de Busca e Paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  
  // Ordenação padrão: Artistas desc
  const [sortConfig, setSortConfig] = useState({ key: 'total_artists', direction: 'desc' });

  useEffect(() => {
    async function fetchCountryStats() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('v_countries_stats')
          .select('*');

        if (error) throw error;

        // Ordenação inicial padrão
        const sortedData = [...(data || [])].sort((a, b) => b.total_artists - a.total_artists);
        setCountries(sortedData);
        setFilteredCountries(sortedData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCountryStats();
  }, []);

  // Monitora a busca para filtrar os países e resetar para a primeira página
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = countries.filter(c => 
      c.country_name?.toLowerCase().includes(term) || 
      c.portuguese_name?.toLowerCase().includes(term)
    );
    setFilteredCountries(filtered);
    setCurrentPage(1);
  }, [searchTerm, countries]);

  // Lógica de ordenação alternada pelas colunas
  const handleSort = (key) => {
    let direction = 'desc'; 
    
    if (key === 'country_name') {
      direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      if (sortConfig.key === key && sortConfig.direction === 'desc') {
        direction = 'asc';
      }
    }

    const sortedData = [...filteredCountries].sort((a, b) => {
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
    setFilteredCountries(sortedData);
  };

  // Cálculos de Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCountries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCountries.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 bg-white text-gray-500 font-sans">
        Carregando estatísticas dos países...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white text-[#444] p-4 font-sans antialiased raw-scroll">
      <div className="max-w-4xl mx-auto bg-white mb-20">
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
                className="py-3 px-4 text-center cursor-pointer hover:text-black select-none transition-colors"
                onClick={() => handleSort('total_artists')}
              >
                Art {sortConfig.key === 'total_artists' ? (sortConfig.direction === 'asc' ? '▴' : '▾') : ''}
              </th>
              <th 
                className="py-3 px-4 text-center cursor-pointer hover:text-black select-none transition-colors"
                onClick={() => handleSort('total_albums')}
              >
                Alb {sortConfig.key === 'total_albums' ? (sortConfig.direction === 'asc' ? '▴' : '▾') : ''}
              </th>
              <th 
                className="py-3 px-4 text-center cursor-pointer hover:text-black select-none transition-colors"
                onClick={() => handleSort('total_unique_songs')}
              >
                Mús {sortConfig.key === 'total_unique_songs' ? (sortConfig.direction === 'asc' ? '▴' : '▾') : ''}
              </th>
              <th 
                className="py-3 px-4 text-center cursor-pointer hover:text-black select-none transition-colors"
                onClick={() => handleSort('total_scrobbles')}
              >
                Scrobbles {sortConfig.key === 'total_scrobbles' ? (sortConfig.direction === 'asc' ? '▴' : '▾') : ''}
              </th>
              <th className="py-3 px-4 text-center w-28">Ratings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ececec]">
            {currentItems.map((country, index) => {
              const globalIndex = indexOfFirstItem + index + 1;
              const total = country.total_artists || 1;
              const p3 = (country.rating_3_count / total) * 100;
              const p2 = (country.rating_2_count / total) * 100;
              const p1 = (country.rating_1_count / total) * 100;

              return (
                <tr key={country.id_country} className="hover:bg-[#fcfcfc] transition-colors">
                  {/* Posição Real Global */}
                  <td className="py-3 px-2 text-center font-mono text-[13px] text-[#b5b5b5]">
                    {globalIndex}
                  </td>
                  
                  {/* Bandeira + Nome do País */}
                  <td className="py-3 px-4 flex items-center gap-3 font-extrabold text-[#2c2c2c]">
                    <span 
                      className={`fi fi-${country.country_code?.toLowerCase()} flag-icon`} 
                      style={{ width: '22px', height: '16px', borderRadius: '2px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                    />
                    <span className="tracking-wide text-[12px] uppercase">{country.country_name}</span>
                  </td>

                  {/* Total Artistas */}
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

                  {/* Total Scrobbles */}
                  <td className="py-3 px-4 text-center font-normal text-[#7c7c7c] text-[13px]">
                    {country.total_scrobbles?.toLocaleString('pt-BR')}
                  </td>

                  {/* Ratings */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col items-center gap-1 w-24 mx-auto">
                      <div className="flex items-center justify-center gap-1 font-sans text-[11px] font-bold">
                        <span className="text-[#4caf50]">{country.rating_3_count}</span>
                        <span className="text-[#ff9800]">{country.rating_2_count}</span>
                        <span className="text-[#f44336]">{country.rating_1_count}</span>
                      </div>
                      
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

      {/* Rodapé Fixo de Controles (Idêntico ao do albums.jsx) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#ececec] px-4 py-3 flex items-center justify-between shadow-[0_-2px_10px_rgba(0,0,0,0.03)] z-50 max-w-4xl mx-auto">
        
        {/* Input de Busca */}
        <input
          type="text"
          placeholder="Buscar país..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-1.5 text-xs border border-[#e0e0e0] rounded-md focus:outline-none focus:border-gray-400 w-48 text-[#2c2c2c] font-medium"
        />

        {/* Paginação Dinâmica */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 border border-[#e0e0e0] rounded-md disabled:opacity-40 font-bold hover:bg-gray-50 text-gray-600"
            >
              &lt;
            </button>
            
            <span className="text-[#7c7c7c] px-2 font-medium">
              Pág. <b>{currentPage}</b> de {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 border border-[#e0e0e0] rounded-md disabled:opacity-40 font-bold hover:bg-gray-50 text-gray-600"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
// src/pages/tracks.jsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

export default function Tracks() {
  // --- ESTADOS GLOBAIS DA PÁGINA ---
  const [fullRawData, setFullRawData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedArtistFilter, setSelectedArtistFilter] = useState(null);
  
  // Referência para o input de busca
  const searchInputRef = useRef(null);
  
  // Ordenação Principal (Baseada nas colunas do seu modal)
  const [sortCol, setSortCol] = useState('total_scrobbles'); // TOT desc por padrão
  const [sortAsc, setSortAsc] = useState(false);

  const limit = 50;

// Altere apenas a função loadData dentro do useEffect do tracks.jsx
useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('scrobbles_unificados')
          .select('ranking_no_artista_unico, ranking_geral_unico, total_scrobbles, dias_ultima_execucao, track_name, artist')
          .gte('total_scrobbles', 10); // 🔥 FILTRO ADICIONADO AQUI: Traz apenas com 10 ou mais scrobbles
  
        if (error) throw error;
  
        setFullRawData(data || []);
      } catch (err) {
        console.error("Erro geral na carga de faixas:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);
  
  // Injeta o foco assim que a barra de busca abre
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Filtros e Ordenação
  useEffect(() => {
    let result = fullRawData.filter(item => {
      // Busca por termo (Varre nome da música ou nome do artista)
      const matchesSearch = 
        (item.track_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.artist || "").toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por clique no artista
      const matchesArtistFilter = !selectedArtistFilter || item.artist.toLowerCase() === selectedArtistFilter.toLowerCase();

      return matchesSearch && matchesArtistFilter;
    });

    // Lógica de Ordenação
    result.sort((a, b) => {
      let valA = a[sortCol];
      let valB = b[sortCol];

      if (sortCol === 'track_name' || sortCol === 'artist') {
        const strA = String(valA || "");
        const strB = String(valB || "");
        return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
      }

      // Nulos em 'dias_ultima_execucao' jogados para o fim
      if (sortCol === 'dias_ultima_execucao') {
        valA = valA ?? 999999;
        valB = valB ?? 999999;
      }

      const numA = Number(valA) ?? 0;
      const numB = Number(valB) ?? 0;

      if (numA === numB) {
        return String(a.track_name || "").localeCompare(String(b.track_name || ""));
      }
      return sortAsc ? numA - numB : numB - numA;
    });

    setFilteredData(result);
  }, [fullRawData, searchTerm, selectedArtistFilter, sortCol, sortAsc]);

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      // Texto padrão asc, numéricos desc
      setSortAsc(col === 'track_name' || col === 'artist' ? true : false);
    }
    setOffset(0);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedArtistFilter(null);
    setOffset(0);
  };

  const pagedData = filteredData.slice(offset, offset + limit);
  const totalPages = Math.ceil(filteredData.length / limit) || 1;

  if (loading) {
    return <div style={{ padding: '20px', color: '#666', fontSize: '24px', fontFamily: "'Bebas Neue', cursive" }}>Loading Tracks...</div>;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Bebas Neue', cursive" }}>
      
      <div 
        className="table-wrapper" 
        style={{ 
          flex: 1, 
          overflowY: 'auto',  
          overflowX: 'auto',  
          width: '100%',
          position: 'relative'
        }}
      >
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '12px', minWidth: '800px' }}>
          <thead>
            <tr>
              <th style={thFixedStyle(0, '30px')}>POS</th>
              <th onClick={() => handleSort('ranking_no_artista_unico')} style={{ ...thStyle, width: '40px', color: sortCol === 'ranking_no_artista_unico' ? '#1DB954' : '#000' }}>#A ⇅</th>
              <th onClick={() => handleSort('ranking_gener_unico')} style={{ ...thStyle, width: '40px', color: sortCol === 'ranking_geral_unico' ? '#1DB954' : '#000' }}>#G ⇅</th>
              <th onClick={() => handleSort('total_scrobbles')} style={{ ...thStyle, width: '70px', textAlign: 'right', color: sortCol === 'total_scrobbles' ? '#1DB954' : '#000' }}>TOT ⇅</th>
              <th onClick={() => handleSort('dias_ultima_execucao')} style={{ ...thStyle, width: '60px', textAlign: 'center', color: sortCol === 'dias_ultima_execucao' ? '#1DB954' : '#000' }}>DAYS ⇅</th>
              <th onClick={() => handleSort('track_name')} style={{ ...thStyle, color: sortCol === 'track_name' ? '#1DB954' : '#000' }}>TITLE ⇅</th>
              <th onClick={() => handleSort('artist')} style={{ ...thStyle, width: '250px', color: sortCol === 'artist' ? '#1DB954' : '#000', borderLeft: '1px solid #ddd' }}>ARTIST ⇅</th>
            </tr>
          </thead>
          <tbody>
            {pagedData.map((item, index) => {
              const lastFmUrl = `https://www.last.fm/music/${encodeURIComponent(item.artist)}/_/${encodeURIComponent(item.track_name)}`;

              return (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f8f8' }}>
                  {/* Posição atual da página */}
                  <td style={tdFixedStyle(0, '30px', 'center', '#1DB954', index)}>
                    {offset + index + 1}
                  </td>

                  {/* Ranking no Artista (#A) */}
                  <td style={{ ...tdStyle, color: '#1DB954', fontWeight: 'bold', paddingLeft: '5px' }}>
                    {item.ranking_no_artista_unico}
                  </td>

                  {/* Ranking Geral (#G) */}
                  <td style={{ ...tdStyle, color: '#777', fontSize: '10px' }}>
                    {item.ranking_geral_unico}
                  </td>

                  {/* Total de Scrobbles (TOT) */}
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 'bold', paddingRight: '5px' }}>
                    {(item.total_scrobbles || 0).toLocaleString('pt-BR')}
                  </td>

                  {/* Dias desde a última execução (DAYS) */}
                  <td style={{ ...tdStyle, textAlign: 'center', fontSize: '11px' }}>
                    {item.dias_ultima_execucao === null ? '-' : item.dias_ultima_execucao}
                  </td>

                  {/* Nome da Música (TITLE) */}
                  <td 
                    style={{ ...tdStyle, color: '#222', fontWeight: 'bold', fontSize: '14px', letterSpacing: '0.3px' }}
                    onClick={() => window.open(lastFmUrl, '_blank')}
                    title="Abrir música no Last.fm"
                  >
                    {item.track_name}
                  </td>

                  {/* Nome do Artista (ARTIST) */}
                  <td 
                    style={{ ...tdStyle, color: '#3498db', fontWeight: 'bold', fontSize: '14px', borderLeft: '1px solid #e0e0e0', paddingLeft: '8px' }}
                    onClick={() => { setOffset(0); setSelectedArtistFilter(item.artist); }}
                    title={`Filtrar apenas faixas de ${item.artist}`}
                  >
                    {item.artist.toUpperCase()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* RODAPÉ DO PAGINADOR */}
      <div style={{ height: '45px', background: '#f1f1f1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid #ddd', padding: '0 10px', gap: '10px', zIndex: 950 }}>
        <button style={btnFooterStyle} onClick={() => setOffset(Math.max(0, offset - limit))}>«</button>
        <select 
          style={{ fontFamily: "'Bebas Neue', cursive", borderRadius: '4px', fontSize: '15px', height: '26px', padding: '0 4px' }} 
          value={Math.floor(offset / limit) + 1} 
          onChange={(e) => setOffset((Number(e.target.value) - 1) * limit)}
        >
          {Array.from({ length: totalPages }, (_, i) => (
            <option key={i} value={i + 1}>PÁG {i + 1}</option>
          ))}
        </select>
        <button style={btnFooterStyle} onClick={() => { if (offset + limit < filteredData.length) setOffset(offset + limit); }}>»</button>
        <button style={btnFooterStyle} onClick={() => setShowSearch(!showSearch)}>🔍</button>
        
        {(selectedArtistFilter || searchTerm) && (
          <button style={{ ...btnFooterStyle, color: '#e97b78', fontSize: '13px' }} onClick={clearFilters}>CLEAR ({selectedArtistFilter ? 'FILTRO ARTISTA' : 'BUSCA'})</button>
        )}
        
        <span style={{ fontSize: '14px', marginLeft: 'auto', color: '#555', fontWeight: 'bold' }}>{filteredData.length} FAIXAS</span>
      </div>

      {/* BUSCA EM OVERLAY */}
      {showSearch && (
        <div style={{ position: 'fixed', bottom: '45px', left: 0, width: '100%', background: 'white', padding: '8px 15px', boxShadow: '0 -3px 10px rgba(0,0,0,0.15)', zIndex: 999, display: 'flex', gap: '10px', boxSizing: 'border-box' }}>
          <input 
            ref={searchInputRef}
            type="text" 
            value={searchTerm} 
            onChange={(e) => { setOffset(0); setSearchTerm(e.target.value); }} 
            placeholder="BUSCAR FAIXA OU ARTISTA EM TEMPO REAL..." 
            style={{ flex: 1, padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', fontFamily: "'Roboto', sans-serif" }} 
          />
          <button onClick={() => setShowSearch(false)} style={{ background: '#2c3e50', color: 'white', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer', fontFamily: "'Bebas Neue', cursive" }}>OK</button>
        </div>
      )}

    </div>
  );
}

// --- ESTILOS INLINE AUXILIARES ---
const thStyle = { background: '#f1f1f1', position: 'sticky', top: 0, zIndex: 900, padding: '6px 2px', borderBottom: '2px solid #ddd', textAlign: 'left', fontFamily: "'Bebas Neue', cursive", cursor: 'pointer' };
const tdStyle = { padding: '5px 2px', borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap', textAlign: 'left', lineHeight: '1.2', cursor: 'pointer', fontFamily: "'Bebas Neue', cursive" };
const btnFooterStyle = { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '2px 8px', display: 'flex', alignItems: 'center', height: '100%', fontFamily: "'Bebas Neue', cursive" };

const thFixedStyle = (left, width) => ({
  background: '#f1f1f1', position: 'sticky', top: 0, left: left, width: width, minWidth: width, maxWidth: width, zIndex: 910, padding: '6px 2px', borderBottom: '2px solid #ddd', textAlign: 'center', fontFamily: "'Bebas Neue', cursive"
});

const tdFixedStyle = (left, width, align, color, index) => ({
  position: 'sticky', left: left, width: width, minWidth: width, maxWidth: width, zIndex: 400, backgroundColor: index % 2 === 0 ? '#fff' : '#f8f8f8', color: color, textAlign: align, padding: '5px 2px', borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap', lineHeight: '1.2', fontFamily: "'Bebas Neue', cursive"
});
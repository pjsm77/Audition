// src/pages/languages.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Languages() {
  // --- ESTADOS GLOBAIS DA PÁGINA ---
  const [fullRawData, setFullRawData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Ordenação Padrão: Artistas por idioma, desc (total_artists)
  const [sortCol, setSortCol] = useState('total_artists');
  const [sortAsc, setSortAsc] = useState(false);

  const limit = 30; // Mostrar 30 por página

  useEffect(() => {
    async function loadLanguageStats() {
      setLoading(true);
      try {
        // CORREÇÃO: Garanta que está puxando da view correta
        const { data, error } = await supabase
          .from('vw_languages')
          .select('*');

        if (error) throw error;

        let base = data || [];
        // Ordenação inicial padrão
        base.sort((a, b) => b.total_artists - a.total_artists);
        setFullRawData(base);
      } catch (err) {
        console.error("Erro na carga de idiomas (vw_languages):", err);
      } finally {
        setLoading(false);
      }
    }
    loadLanguageStats();
  }, []);

  useEffect(() => {
    let result = fullRawData.filter(item => {
      const term = searchTerm.toLowerCase();
      return (item.language || "").toLowerCase().includes(term);
    });

    // ENGINE DE ORDENAÇÃO DINÂMICA ALINHADO COM O SQL
    result.sort((a, b) => {
      let valA = a[sortCol];
      let valB = b[sortCol];

      if (sortCol === 'language') {
        const strA = String(valA || "");
        const strB = String(valB || "");
        return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
      }

      const numA = Number(valA) || 0;
      const numB = Number(valB) || 0;

      if (numA === numB) {
        return String(a.language || "").localeCompare(String(b.language || ""));
      }
      return sortAsc ? numA - numB : numB - numA;
    });

    setFilteredData(result);
  }, [fullRawData, searchTerm, sortCol, sortAsc]);

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      if (col === 'language') {
        setSortAsc(true);
      } else {
        setSortAsc(false);
      }
    }
    setOffset(0);
  };

  const pagedData = filteredData.slice(offset, offset + limit);
  const totalPages = Math.ceil(filteredData.length / limit) || 1;

  if (loading) {
    return (
      <div style={{ padding: '20px', color: '#666', fontSize: '24px', fontFamily: "'Bebas Neue', cursive" }}>
        CARREGANDO ESTATÍSTICAS DE IDIOMAS...
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Bebas Neue', cursive", backgroundColor: '#ffffff' }}>
      
      {/* WRAPPER COM SCROLL NATIVO */}
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
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '14px', minWidth: '600px' }}>
          <thead>
            <tr>
              <th onClick={() => handleSort('total_artists')} style={thFixedStyle('fixed', 0, '35px', 'center')}>#</th>
              <th onClick={() => handleSort('language')} style={thStyle}>LANGUAGE</th>
              <th onClick={() => handleSort('total_artists')} style={{ ...thStyle, textAlign: 'center' }}>
                ART {sortCol === 'total_artists' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('total_albums')} style={{ ...thStyle, textAlign: 'center' }}>
                ALB {sortCol === 'total_albums' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              {/* Alinhado para ordenar pela chave correta do banco (total_unique_songs) */}
              <th onClick={() => handleSort('total_unique_songs')} style={{ ...thStyle, textAlign: 'center' }}>
                TRA {sortCol === 'total_unique_songs' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('total_scrobbles')} style={{ ...thStyle, textAlign: 'center' }}>
                SCROBBLES {sortCol === 'total_scrobbles' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th style={{ ...thStyle, textAlign: 'center', width: '110px' }}>RATINGS</th>
            </tr>
          </thead>
          <tbody>
            {pagedData.map((item, index) => {
              const total = item.total_artists || 1;
              const p3 = (item.rating_3_count / total) * 100;
              const p2 = (item.rating_2_count / total) * 100;
              const p1 = (item.rating_1_count / total) * 100;

              return (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f8f8' }}>
                  
                  {/* # Posição Global */}
                  <td style={tdFixedStyle('fixed', 0, '35px', 'center', '#b5b5b5', index)}>
                    {offset + index + 1}
                  </td>
                  
                  {/* IDIOMA EM CAIXA ALTA */}
                  <td style={{ ...tdStyle, fontWeight: 'bold', borderBottom: '1px solid #e0e0e0', paddingLeft: '8px' }}>
                    <span style={{ fontSize: '15px', letterSpacing: '0.3px', color: '#000' }}>
                      {item.language ? item.language.toUpperCase() : '-'}
                    </span>
                  </td>

                  {/* ART (Total Artistas) */}
                  <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold', color: '#000', fontSize: '15px' }}>
                    {item.total_artists}
                  </td>

                  {/* ALB (Total Álbuns) */}
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#222' }}>
                    {item.total_albums}
                  </td>

                  {/* TRA (Total Músicas Únicas) */}
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#222' }}>
                    {item.total_unique_songs}
                  </td>

                  {/* SCROBBLES */}
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#222' }}>
                    {item.total_scrobbles ? item.total_scrobbles.toLocaleString('pt-BR') : 0}
                  </td>

                  {/* RATINGS (Gráfico de barras proporcional inline) */}
                  <td style={{ ...tdStyle, padding: '3px 6px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px', width: '100%' }}>
                      
                      <div style={{ display: 'flex', gap: '5px', fontSize: '11px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>
                        <span style={{ color: '#4caf50' }}>{item.rating_3_count}</span>
                        <span style={{ color: '#ff9800' }}>{item.rating_2_count}</span>
                        <span style={{ color: '#f44336' }}>{item.rating_1_count}</span>
                      </div>
                      
                      <div style={{ width: '100%', maxWidth: '80px', backgroundColor: '#e2e2e2', height: '2.5px', borderRadius: '1px', overflow: 'hidden', display: 'flex' }}>
                        {p3 > 0 && <div style={{ width: `${p3}%`, backgroundColor: '#4caf50', height: '100%' }} />}
                        {p2 > 0 && <div style={{ width: `${p2}%`, backgroundColor: '#ff9800', height: '100%' }} />}
                        {p1 > 0 && <div style={{ width: `${p1}%`, backgroundColor: '#f44336', height: '100%' }} />}
                      </div>

                    </div>
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
        
        {searchTerm && (
          <button style={{ ...btnFooterStyle, color: '#e97b78', fontSize: '13px' }} onClick={() => setSearchTerm('')}>CLEAR</button>
        )}
        
        <span style={{ fontSize: '14px', marginLeft: 'auto', color: '#555', fontWeight: 'bold' }}>{filteredData.length} IDIOMAS</span>
      </div>

      {/* OVERLAY DE BUSCA FLUTUANTE */}
      {showSearch && (
        <div style={{ position: 'fixed', bottom: '45px', left: 0, width: '100%', background: 'white', padding: '8px 15px', boxShadow: '0 -3px 10px rgba(0,0,0,0.15)', zIndex: 999, display: 'flex', gap: '10px', boxSizing: 'border-box' }}>
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => { setOffset(0); setSearchTerm(e.target.value); }} 
            placeholder="BUSCAR IDIOMA..." 
            style={{ flex: 1, padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', fontFamily: "'Roboto', sans-serif" }} 
          />
          <button onClick={() => setShowSearch(false)} style={{ background: '#2c3e50', color: 'white', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer', fontFamily: "'Bebas Neue', cursive" }}>OK</button>
        </div>
      )}

    </div>
  );
}

const thStyle = { background: '#f1f1f1', position: 'sticky', top: 0, zIndex: 900, padding: '5px 4px', borderBottom: '2px solid #ddd', textAlign: 'left', fontFamily: "'Bebas Neue', cursive", cursor: 'pointer', selectNone: 'none' };
const tdStyle = { padding: '4px 4px', borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap', textAlign: 'left', lineHeight: '1.2', fontFamily: "'Bebas Neue', cursive" };
const btnFooterStyle = { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '2px 8px', display: 'flex', alignItems: 'center', height: '100%', fontFamily: "'Bebas Neue', cursive" };

const thFixedStyle = (pos, left, width, align = 'left') => ({
  background: '#f1f1f1', position: 'sticky', top: 0, left: left, width: width, minWidth: width, maxWidth: width, zIndex: 910, padding: '5px 4px', borderBottom: '2px solid #ddd', textAlign: align, fontFamily: "'Bebas Neue', cursive"
});

const tdFixedStyle = (pos, left, width, align, color, index) => ({
  position: 'sticky', left: left, width: width, minWidth: width, maxWidth: width, zIndex: 400, backgroundColor: index % 2 === 0 ? '#fff' : '#f8f8f8', color: color, textAlign: align, padding: '4px 4px', borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap', lineHeight: '1.2', fontFamily: "'Bebas Neue', cursive"
});
// src/pages/tracks.jsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

export default function Tracks() {
  // --- GLOBAL PAGE STATES ---
  const [fullRawData, setFullRawData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedArtistFilter, setSelectedArtistFilter] = useState(null);
  
  const searchInputRef = useRef(null);
  const [sortCol, setSortCol] = useState('total_scrobbles'); 
  const [sortAsc, setSortAsc] = useState(false);

  const limit = 50;

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('scrobbles_unificados')
          .select('ranking_no_artista_unico, ranking_geral_unico, total_scrobbles, dias_ultima_execucao, track_name, artist')
          .gte('total_scrobbles', 10);

        if (error) throw error;
        setFullRawData(data || []);
      } catch (err) {
        console.error("General error loading tracks:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    let result = fullRawData.filter(item => {
      const matchesSearch = 
        (item.track_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.artist || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesArtistFilter = !selectedArtistFilter || item.artist.toLowerCase() === selectedArtistFilter.toLowerCase();
      return matchesSearch && matchesArtistFilter;
    });

    result.sort((a, b) => {
      let valA = a[sortCol];
      let valB = b[sortCol];

      if (sortCol === 'track_name' || sortCol === 'artist') {
        return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
      }
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
      setSortAsc(col === 'track_name' || col === 'artist');
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
    return <div style={{ padding: '15px', color: '#666', fontSize: '20px', fontFamily: "'Bebas Neue', cursive" }}>Loading Tracks...</div>;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Bebas Neue', cursive" }}>
      
      {/* CSS injection for text truncation and responsive tweaks */}
      <style>{`
        @media (max-width: 480px) {
          .hide-mobile { display: none !important; }
          .track-title { max-width: 110px !important; }
          .artist-title { max-width: 90px !important; }
        }
      `}</style>

      <div 
        className="table-wrapper" 
        style={{ 
          flex: 1, 
          overflowY: 'auto',  
          overflowX: 'auto',  
          width: '100%',
          position: 'relative',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '11px', minWidth: '100%' }}>
          <thead>
            <tr>
              <th style={thFixedStyle(0, '18px')}>N°</th>
              <th onClick={() => handleSort('ranking_no_artista_unico')} className="hide-mobile" style={{ ...thStyle, width: '25px', color: sortCol === 'ranking_no_artista_unico' ? '#1DB954' : '#000' }}>#A</th>
              <th onClick={() => handleSort('ranking_geral_unico')} style={{ ...thStyle, width: '35px', textAlign: 'right', color: sortCol === 'ranking_geral_unico' ? '#1DB954' : '#000' }}>#G</th>
              <th onClick={() => handleSort('total_scrobbles')} style={{ ...thStyle, width: '45px', textAlign: 'right', color: sortCol === 'total_scrobbles' ? '#1DB954' : '#000' }}>TOT</th>
              <th onClick={() => handleSort('dias_ultima_execucao')} style={{ ...thStyle, width: '35px', textAlign: 'center', color: sortCol === 'dias_ultima_execucao' ? '#1DB954' : '#000' }}>DAYS</th>
              <th onClick={() => handleSort('track_name')} style={{ ...thStyle, color: sortCol === 'track_name' ? '#1DB954' : '#000', paddingLeft: '6px' }}>TRACK</th>
              <th onClick={() => handleSort('artist')} style={{ ...thStyle, width: '110px', color: sortCol === 'artist' ? '#1DB954' : '#000', borderLeft: '1px solid #ddd', paddingLeft: '6px' }}>ARTIST</th>
            </tr>
          </thead>
          <tbody>
            {pagedData.map((item, index) => {
// MODIFICAÇÃO DOS LINKS DO DEEZER (Coloque dentro do pagedData.map)
const encodedQueryTrack = encodeURIComponent(`${item.artist} ${item.track_name}`);
const encodedQueryArtist = encodeURIComponent(item.artist);

// Usando o redirecionador de busca específico do Deezer que conversa melhor com o App
const deezerTrackUrl = `https://www.deezer.com/search?q=${encodedQueryTrack}`;
const deezerArtistUrl = `https://www.deezer.com/search?q=${encodedQueryArtist}`;

              return (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f8f8' }}>
                  {/* Sticky Line Number */}
                  <td style={tdFixedStyle(0, '18px', 'center', '#1DB954', index)}>
                    {offset + index + 1}
                  </td>

                  {/* Artist Ranking (Hidden on Mobile Portrait) */}
                  <td className="hide-mobile" style={{ ...tdStyle, color: '#1DB954', fontWeight: 'bold', paddingLeft: '2px' }}>
                    {item.ranking_no_artista_unico}
                  </td>

                  {/* Global Ranking - Aligned right to match space perfectly */}
                  <td style={{ ...tdStyle, color: '#777', fontSize: '10px', textAlign: 'right', paddingRight: '2px' }}>
                    {item.ranking_geral_unico}
                  </td>

                  {/* Total Scrobbles */}
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 'bold', paddingRight: '4px', fontSize: '11px' }}>
                    {item.total_scrobbles}
                  </td>

                  {/* Days Since Last Play */}
                  <td style={{ ...tdStyle, textAlign: 'center', fontSize: '10px', color: '#555' }}>
                    {item.dias_ultima_execucao === null ? '-' : item.dias_ultima_execucao}
                  </td>

                  {/* Track Name -> Opens Deezer Track */}
                  <td 
                    className="track-title"
                    style={{ ...tdStyle, color: '#222', fontWeight: 'bold', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px', paddingLeft: '6px' }}
                    onClick={() => window.open(deezerTrackUrl, '_blank')}
                    title={`Listen to "${item.track_name}" on Deezer`}
                  >
                    {item.track_name}
                  </td>

                  {/* Artist Name -> Filter on single click, holding/title shows target info */}
                  <td 
                    className="artist-title"
                    style={{ ...tdStyle, color: '#3498db', fontWeight: 'bold', fontSize: '12px', borderLeft: '1px solid #e0e0e0', paddingLeft: '6px', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '110px' }}
                    onClick={(e) => {
                      // Se clicar segurando Ctrl/Cmd, ou se preferir o fluxo nativo: abre o Deezer. 
                      // Caso queira que o clique duplo ou o clique normal faça um ou outro, deixei o padrão:
                      // Clique normal filtra na tabela. Adicionei o comportamento de abrir o Deezer no link abaixo.
                      if (e.metaKey || e.ctrlKey) {
                        window.open(deezerArtistUrl, '_blank');
                      } else {
                        setOffset(0); 
                        setSelectedArtistFilter(item.artist);
                      }
                    }}
                    onDoubleClick={() => window.open(deezerArtistUrl, '_blank')}
                    title={`Click to filter. Double-click to open ${item.artist} on Deezer`}
                  >
                    {item.artist.toUpperCase()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FOOTER PAGINATION CONTROL */}
      <div style={{ height: '40px', background: '#f1f1f1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid #ddd', padding: '0 8px', gap: '5px', zIndex: 950 }}>
        <button style={btnFooterStyle} onClick={() => setOffset(Math.max(0, offset - limit))}>«</button>
        <select 
          style={{ fontFamily: "'Bebas Neue', cursive", borderRadius: '4px', fontSize: '14px', height: '24px', padding: '0 2px' }} 
          value={Math.floor(offset / limit) + 1} 
          onChange={(e) => setOffset((Number(e.target.value) - 1) * limit)}
        >
          {Array.from({ length: totalPages }, (_, i) => (
            <option key={i} value={i + 1}>P{i + 1}</option>
          ))}
        </select>
        <button style={btnFooterStyle} onClick={() => { if (offset + limit < filteredData.length) setOffset(offset + limit); }}>»</button>
        <button style={btnFooterStyle} onClick={() => setShowSearch(!showSearch)}>🔍</button>
        
        {(selectedArtistFilter || searchTerm) && (
          <button style={{ ...btnFooterStyle, color: '#e97b78', fontSize: '11px', padding: '2px 4px' }} onClick={clearFilters}>CLR</button>
        )}
        
        <span style={{ fontSize: '12px', marginLeft: 'auto', color: '#555', fontWeight: 'bold' }}>{filteredData.length} TRACKS</span>
      </div>

      {/* OVERLAY SEARCH BAR */}
      {showSearch && (
        <div style={{ position: 'fixed', bottom: '40px', left: 0, width: '100%', background: 'white', padding: '6px 10px', boxShadow: '0 -2px 8px rgba(0,0,0,0.15)', zIndex: 999, display: 'flex', gap: '8px', boxSizing: 'border-box' }}>
          <input 
            ref={searchInputRef}
            type="text" 
            value={searchTerm} 
            onChange={(e) => { setOffset(0); setSearchTerm(e.target.value); }} 
            placeholder="SEARCH TRACK OR ARTIST..." 
            style={{ flex: 1, padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', fontFamily: "'Roboto', sans-serif" }}
          />
          <button onClick={() => setShowSearch(false)} style={{ background: '#2c3e50', color: 'white', border: 'none', padding: '0 10px', borderRadius: '4px', cursor: 'pointer', fontFamily: "'Bebas Neue', cursive", fontSize: '13px' }}>OK</button>
        </div>
      )}

    </div>
  );
}

// --- ULTRA-COMPACT INLINE STYLES ---
const thStyle = { background: '#f1f1f1', position: 'sticky', top: 0, zIndex: 900, padding: '4px 2px', borderBottom: '2px solid #ddd', textAlign: 'left', fontFamily: "'Bebas Neue', cursive", cursor: 'pointer', fontSize: '11px' };
const tdStyle = { padding: '4px 2px', borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap', textAlign: 'left', lineHeight: '1.1', cursor: 'pointer', fontFamily: "'Bebas Neue', cursive" };
const btnFooterStyle = { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '2px 6px', display: 'flex', alignItems: 'center', height: '100%', fontFamily: "'Bebas Neue', cursive" };

const thFixedStyle = (left, width) => ({
  background: '#f1f1f1', position: 'sticky', top: 0, left: left, width: width, minWidth: width, maxWidth: width, zIndex: 910, padding: '4px 2px', borderBottom: '2px solid #ddd', textAlign: 'center', fontFamily: "'Bebas Neue', cursive", fontSize: '11px'
});

const tdFixedStyle = (left, width, align, color, index) => ({
  position: 'sticky', left: left, width: width, minWidth: width, maxWidth: width, zIndex: 400, backgroundColor: index % 2 === 0 ? '#fff' : '#f8f8f8', color: color, textAlign: align, padding: '4px 2px', borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap', lineHeight: '1.1', fontFamily: "'Bebas Neue', cursive"
});
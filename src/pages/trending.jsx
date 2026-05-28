// src/pages/trending.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Trending() {
  // --- STATE MANAGEMENT ---
  const [fullRawData, setFullRawData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Default Sorting: Score Descending
  const [sortCol, setSortCol] = useState('score');
  const [sortAsc, setSortAsc] = useState(false);

  const limit = 30; // 30 items per page

  // ISO Flag Mapping dictionary matching your dynamic query text names
  const countryMap = {
    "[desconhecido]": "unknown", "afeganistão": "af", "áfrica do sul": "za", "alemanha": "de", 
    "andorra": "ad", "argélia": "dz", "argentina": "ar", "armênia": "am", "austrália": "au",
    "áustria": "at", "azerbaijão": "az", "bangladesh": "bd", "barbados": "bb", "bélgica": "be", 
    "bolívia": "bo", "bósnia e herzegovina": "ba", "brasil": "br", "bulgária": "bg", "canadá": "ca", 
    "chile": "cl", "china": "cn", "colômbia": "co", "coreia do sul": "kr", "costa rica": "cr", 
    "croácia": "hr", "cuba": "cu", "dinamarca": "dk", "egito": "eg", "emirados árabes unidos": "ae", 
    "equador": "ec", "escócia": "gb-sct", "eslováquia": "sk", "eslovênia": "si", "espanha": "es", 
    "estados unidos": "us", "estônia": "ee", "eua": "us", "finlândia": "fi", "frança": "fr", 
    "geórgia": "ge", "grécia": "gr", "guatemala": "gt", "hungria": "hu", "índia": "in", 
    "indonésia": "id", "inglaterra": "gb-eng", "irã": "ir", "irlanda": "ie", "islândia": "is", 
    "israel": "il", "itália": "it", "jamaica": "jm", "japão": "jp", "jordânia": "jo", "líbano": "lb",
    "luxemburgo": "lu", "malásia": "my", "malta": "mt", "marrocos": "ma", "méxico": "mx", 
    "mongólia": "mn", "montenegro": "me", "nigéria": "ng", "noruega": "no", "nova zelândia": "nz", 
    "país de gales": "gb-wls", "países baixos": "nl", "holanda": "nl", "panamá": "pa", 
    "paquistão": "pk", "paraguai": "py", "peru": "pe", "polônia": "pl", "portugal": "pt", 
    "quênia": "ke", "quirguistão": "kg", "reino unido": "gb", "república checa": "cz", 
    "romênia": "ro", "rússia": "ru", "sérvia": "rs", "síria": "sy", "sri lanka": "lk", 
    "suécia": "se", "suíça": "ch", "tailândia": "th", "taiwan": "tw", "tajiquistão": "tj", 
    "tunísia": "tn", "turquia": "tr", "ucrânia": "ua", "uruguai": "uy", "venezuela": "ve", 
    "vietnã": "vn", "zâmbia": "zm", "zimbábue": "zw"
  };

  useEffect(() => {
    async function loadTrendingStats() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('vw_trending_artists_30_days')
          .select('*');

        if (error) throw error;

        let base = data || [];
        base.sort((a, b) => b.score - a.score);
        setFullRawData(base);
      } catch (err) {
        console.error("Error loading trending views:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTrendingStats();
  }, []);

  useEffect(() => {
    let result = fullRawData.filter(item => {
      const term = searchTerm.toLowerCase();
      return (
        (item.artist || "").toLowerCase().includes(term) ||
        (item.country_name || "").toLowerCase().includes(term)
      );
    });

    // DINAMIC SORT ENGINE
    result.sort((a, b) => {
      let valA = a[sortCol];
      let valB = b[sortCol];

      if (sortCol === 'artist') {
        const strA = String(valA || "");
        const strB = String(valB || "");
        return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
      }

      const numA = Number(valA) || 0;
      const numB = Number(valB) || 0;

      if (numA === numB) {
        return String(a.artist || "").localeCompare(String(b.artist || ""));
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
      if (col === 'artist') {
        setSortAsc(true);
      } else {
        setSortAsc(false);
      }
    }
    setOffset(0);
  };

  // Helper method to set color based on tbl_artists rating checks
  const getArtistColor = (rating) => {
    if (rating === 3) return '#4caf50'; // Green
    if (rating === 2) return '#ff9800'; // Orange
    if (rating === 1) return '#f44336'; // Red
    return '#000000'; // Default black (unrated)
  };

  const pagedData = filteredData.slice(offset, offset + limit);
  const totalPages = Math.ceil(filteredData.length / limit) || 1;

  if (loading) {
    return (
      <div style={{ padding: '20px', color: '#666', fontSize: '24px', fontFamily: "'Bebas Neue', cursive" }}>
        LOADING...
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Bebas Neue', cursive", backgroundColor: '#ffffff' }}>
      
      {/* MOBILE OPTIMIZED CONTAINER SCROLL VIEW */}
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
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '13px', minWidth: '100%' }}>
          <thead>
            <tr>
              <th onClick={() => handleSort('score')} style={thFixedStyle('fixed', 0, '28px', 'center')}>#</th>
              <th onClick={() => handleSort('artist')} style={thStyle}>ARTIST</th>
              <th onClick={() => handleSort('score')} style={{ ...thStyle, textAlign: 'center' }}>
                SCO {sortCol === 'score' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('scrobbles')} style={{ ...thStyle, textAlign: 'center' }}>
                SCR {sortCol === 'scrobbles' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('tracks')} style={{ ...thStyle, textAlign: 'center' }}>
                TRA {sortCol === 'tracks' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('days')} style={{ ...thStyle, textAlign: 'center' }}>
                DAY {sortCol === 'days' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {pagedData.map((item, index) => {
              const flagCode = countryMap[(item.country_name || "").toLowerCase().trim()] || "un";
              const artistColor = getArtistColor(item.rating);
              
              return (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f8f8' }}>
                  
                  {/* Position Index Box */}
                  <td style={tdFixedStyle('fixed', 0, '28px', 'center', '#b5b5b5', index)}>
                    {offset + index + 1}
                  </td>
                  
                  {/* Flag + Colored Artist Name on Restricted Width */}
                  <td style={{ ...tdStyle, display: 'flex', alignItems: 'center', gap: '5px', borderBottom: '1px solid #e0e0e0' }}>
                    <img 
                      src={`https://flagcdn.com/32x24/${flagCode}.png`} 
                      style={{ width: '18px', height: '13px', border: '0.5px solid #bbb', display: 'inline-block', objectFit: 'cover', flexShrink: 0 }}
                      alt="" 
                    />
                    <span style={{ 
                      fontSize: '14px', 
                      letterSpacing: '0.2px', 
                      color: artistColor, 
                      fontWeight: 'bold',
                      maxWidth: '115px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}>
                      {item.artist ? item.artist.toUpperCase() : '-'}
                    </span>
                  </td>

                  {/* Weight Score */}
                  <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold', color: '#000', fontSize: '14px' }}>
                    {item.score}
                  </td>

                  {/* Raw Playback Count */}
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#222' }}>
                    {item.scrobbles}
                  </td>

                  {/* Distinct Track Count */}
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#222' }}>
                    {item.tracks}
                  </td>

                  {/* Days elapsed since last play */}
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#000', fontSize: '14px' }}>
                    {item.days}
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FOOTER PAGINATION CONTROL BOX */}
      <div style={{ height: '45px', background: '#f1f1f1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid #ddd', padding: '0 8px', gap: '8px', zIndex: 950 }}>
        <button style={btnFooterStyle} onClick={() => setOffset(Math.max(0, offset - limit))}>«</button>
        <select 
          style={{ fontFamily: "'Bebas Neue', cursive", borderRadius: '4px', fontSize: '14px', height: '26px', padding: '0 2px' }} 
          value={Math.floor(offset / limit) + 1} 
          onChange={(e) => setOffset((Number(e.target.value) - 1) * limit)}
        >
          {Array.from({ length: totalPages }, (_, i) => (
            <option key={i} value={i + 1}>PAGE {i + 1}</option>
          ))}
        </select>
        <button style={btnFooterStyle} onClick={() => { if (offset + limit < filteredData.length) setOffset(offset + limit); }}>»</button>
        <button style={btnFooterStyle} onClick={() => setShowSearch(!showSearch)}>🔍</button>
        
        {searchTerm && (
          <button style={{ ...btnFooterStyle, color: '#e97b78', fontSize: '12px' }} onClick={() => setSearchTerm('')}>CLEAR</button>
        )}
        
        <span style={{ fontSize: '13px', marginLeft: 'auto', color: '#555', fontWeight: 'bold' }}>{filteredData.length} ARTISTS</span>
      </div>

      {/* OVERLAY SEARCH CONTAINER WINDOW */}
      {showSearch && (
        <div style={{ position: 'fixed', bottom: '45px', left: 0, width: '100%', background: 'white', padding: '8px 15px', boxShadow: '0 -3px 10px rgba(0,0,0,0.15)', zIndex: 999, display: 'flex', gap: '10px', boxSizing: 'border-box' }}>
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => { setOffset(0); setSearchTerm(e.target.value); }} 
            placeholder="SEARCH ARTIST OR COUNTRY..." 
            style={{ flex: 1, padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', fontFamily: "'Roboto', sans-serif" }} 
          />
          <button onClick={() => setShowSearch(false)} style={{ background: '#2c3e50', color: 'white', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer', fontFamily: "'Bebas Neue', cursive" }}>OK</button>
        </div>
      )}

    </div>
  );
}

// --- OPTIMIZED STYLINGS ---
const thStyle = { background: '#f1f1f1', position: 'sticky', top: 0, zIndex: 900, padding: '5px 3px', borderBottom: '2px solid #ddd', textAlign: 'left', fontFamily: "'Bebas Neue', cursive", cursor: 'pointer', selectNone: 'none' };
const tdStyle = { padding: '4px 3px', borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap', textAlign: 'left', lineHeight: '1.2', fontFamily: "'Bebas Neue', cursive" };
const btnFooterStyle = { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', padding: '2px 6px', display: 'flex', alignItems: 'center', height: '100%', fontFamily: "'Bebas Neue', cursive" };

const thFixedStyle = (pos, left, width, align = 'left') => ({
  background: '#f1f1f1', position: 'sticky', top: 0, left: left, width: width, minWidth: width, maxWidth: width, zIndex: 910, padding: '5px 3px', borderBottom: '2px solid #ddd', textAlign: align, fontFamily: "'Bebas Neue', cursive"
});

const tdFixedStyle = (pos, left, width, align, color, index) => ({
  position: 'sticky', left: left, width: width, minWidth: width, maxWidth: width, zIndex: 400, backgroundColor: index % 2 === 0 ? '#fff' : '#f8f8f8', color: color, textAlign: align, padding: '4px 3px', borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap', lineHeight: '1.2', fontFamily: "'Bebas Neue', cursive"
});
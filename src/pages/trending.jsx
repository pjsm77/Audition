// src/pages/trending.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Trending() {
  // --- ESTADOS GLOBAIS DA PÁGINA ---
  const [fullRawData, setFullRawData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Ordenação Padrão: Artistas por Score desc
  const [sortCol, setSortCol] = useState('score');
  const [sortAsc, setSortAsc] = useState(false);

  const limit = 30; // Mostrar 30 por página

  // Dicionário de conversão idêntico para renderizar as flags corretas do país do artista
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
        // Ordenação inicial estrita baseada na View: score desc
        base.sort((a, b) => b.score - a.score);
        setFullRawData(base);
      } catch (err) {
        console.error("Erro na carga do trending:", err);
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

    // ENGINE DE ORDENAÇÃO DINÂMICO
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
      // Para a coluna 'days', se quisermos ver quem tocamos mais recentemente no topo (0 dias), a lógica invertida pode ser interessante. 
      // Mas mantendo o padrão numérico do seu motor original:
      return sortAsc ? numA - numB : numB - numA;
    });

    setFilteredData(result);
  }, [fullRawData, searchTerm, sortCol, sortAsc]);

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      // Exceção do nome do artista: inicia alfabético (true). Todos os outros numéricos iniciam desc (false)
      if (col === 'artist') {
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
        Loading...
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Bebas Neue', cursive", backgroundColor: '#ffffff' }}>
      
      {/* WRAPPER COM SCROLL VERTICAL E HORIZONTAL NATIVO LIBERADO */}
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
              <th onClick={() => handleSort('score')} style={thFixedStyle('fixed', 0, '35px', 'center')}>#</th>
              <th onClick={() => handleSort('artist')} style={thStyle}>ARTISTA</th>
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
              // Resgata o código exato da flag usando o padrão do countryMap
              const flagCode = countryMap[(item.country_name || "").toLowerCase().trim()] || "un";
              
              return (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f8f8' }}>
                  
                  {/* Posição Global Fixa à esquerda */}
                  <td style={tdFixedStyle('fixed', 0, '35px', 'center', '#b5b5b5', index)}>
                    {offset + index + 1}
                  </td>
                  
                  {/* Bandeira + Nome do Artista em Caixa Alta */}
                  <td style={{ ...tdStyle, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e0e0e0' }}>
                    <img 
                      src={`https://flagcdn.com/32x24/${flagCode}.png`} 
                      style={{ width: '24px', height: '18px', border: '0.5px solid #bbb', display: 'inline-block', objectFit: 'cover' }}
                      alt="" 
                    />
                    <span style={{ fontSize: '15px', letterSpacing: '0.3px', color: '#000' }}>
                      {item.artist ? item.artist.toUpperCase() : '-'}
                    </span>
                  </td>

                  {/* Score de Frescor (Negrito com destaque) */}
                  <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold', color: '#000', fontSize: '15px' }}>
                    {item.score}
                  </td>

                  {/* Total de Scrobbles brutos */}
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#222' }}>
                    {item.scrobbles}
                  </td>

                  {/* Faixas Distintas */}
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#222' }}>
                    {item.tracks}
                  </td>

                  {/* Dias desde a última reprodução (Ativo, em fonte preta normal) */}
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#000', fontSize: '15px' }}>
                    {item.days}
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
        
        {(searchTerm) && (
          <button style={{ ...btnFooterStyle, color: '#e97b78', fontSize: '13px' }} onClick={() => setSearchTerm('')}>CLEAR</button>
        )}
        
        <span style={{ fontSize: '14px', marginLeft: 'auto', color: '#555', fontWeight: 'bold' }}>{filteredData.length} ARTISTAS</span>
      </div>

      {/* OVERLAY DE BUSCA FLUTUANTE EM TEMPO REAL */}
      {showSearch && (
        <div style={{ position: 'fixed', bottom: '45px', left: 0, width: '100%', background: 'white', padding: '8px 15px', boxShadow: '0 -3px 10px rgba(0,0,0,0.15)', zIndex: 999, display: 'flex', gap: '10px', boxSizing: 'border-box' }}>
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => { setOffset(0); setSearchTerm(e.target.value); }} 
            placeholder="BUSCAR ARTISTA OU PAÍS..." 
            style={{ flex: 1, padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', fontFamily: "'Roboto', sans-serif" }} 
          />
          <button onClick={() => setShowSearch(false)} style={{ background: '#2c3e50', color: 'white', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer', fontFamily: "'Bebas Neue', cursive" }}>OK</button>
        </div>
      )}

    </div>
  );
}

// --- CONFIGURAÇÕES DE ESTILO AUXILIARES ---
const thStyle = { background: '#f1f1f1', position: 'sticky', top: 0, zIndex: 900, padding: '5px 4px', borderBottom: '2px solid #ddd', textAlign: 'left', fontFamily: "'Bebas Neue', cursive", cursor: 'pointer', selectNone: 'none' };
const tdStyle = { padding: '4px 4px', borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap', textAlign: 'left', lineHeight: '1.2', fontFamily: "'Bebas Neue', cursive" };
const btnFooterStyle = { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '2px 8px', display: 'flex', alignItems: 'center', height: '100%', fontFamily: "'Bebas Neue', cursive" };

const thFixedStyle = (pos, left, width, align = 'left') => ({
  background: '#f1f1f1', position: 'sticky', top: 0, left: left, width: width, minWidth: width, maxWidth: width, zIndex: 910, padding: '5px 4px', borderBottom: '2px solid #ddd', textAlign: align, fontFamily: "'Bebas Neue', cursive", cursor: 'pointer'
});

const tdFixedStyle = (pos, left, width, align, color, index) => ({
  position: 'sticky', left: left, width: width, minWidth: width, maxWidth: width, zIndex: 400, backgroundColor: index % 2 === 0 ? '#fff' : '#f8f8f8', color: color, textAlign: align, padding: '4px 4px', borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap', lineHeight: '1.2', fontFamily: "'Bebas Neue', cursive"
});
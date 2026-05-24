// src/components/FloatingMenu.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Fecha o menu se o usuário clicar em qualquer lugar fora dele
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="floating-menu-container" ref={menuRef} style={styles.container}>
      {/* Opções do Menu (Sitemap) */}
      <div 
        className={`floating-menu-options ${isOpen ? 'active' : ''}`} 
        style={{...styles.options, display: isOpen ? 'flex' : 'none'}}
      >
        <div style={styles.header}>Menu Principal</div>
        <Link to="/" className="menu-item" onClick={() => setIsOpen(false)} style={styles.item}><span style={styles.span}>1</span> Artists</Link>
        <Link to="/albums" className="menu-item" onClick={() => setIsOpen(false)} style={styles.item}><span style={styles.span}>2</span> Albums</Link>
        <Link to="/tracks" className="menu-item" onClick={() => setIsOpen(false)} style={styles.item}><span style={styles.span}>3</span> Tracks</Link>
        <Link to="/countries" className="menu-item" onClick={() => setIsOpen(false)} style={styles.item}><span style={styles.span}>4</span> Countries</Link>
        <Link to="/languages" className="menu-item" onClick={() => setIsOpen(false)} style={styles.item}><span style={styles.span}>5</span> Languages</Link>
        <Link to="/charts" className="menu-item" onClick={() => setIsOpen(false)} style={styles.item}><span style={styles.span}>6</span> Charts</Link>
        <Link to="/discover" className="menu-item" onClick={() => setIsOpen(false)} style={styles.item}><span style={styles.span}>7</span> Discover</Link>
        <Link to="/stats" className="menu-item" onClick={() => setIsOpen(false)} style={styles.item}><span style={styles.span}>8</span> Stats</Link>
        <Link to="/dashboard" className="menu-item" onClick={() => setIsOpen(false)} style={styles.item}><span style={styles.span}>9</span> Dashboard</Link>
        <Link to="/recent" className="menu-item" onClick={() => setIsOpen(false)} style={styles.item}><span style={styles.span}>10</span> Recent</Link>
        <Link to="/links" className="menu-item" onClick={() => setIsOpen(false)} style={styles.item}><span style={styles.span}>11</span> Links</Link>
        <Link to="/new-entries" className="menu-item" onClick={() => setIsOpen(false)} style={styles.item}><span style={styles.span}>12</span> New Entries</Link>
        <Link to="/debug" className="menu-item" onClick={() => setIsOpen(false)} style={styles.item}><span style={styles.span}>13</span> Debug</Link>
      </div>

      {/* Botão Flutuante Redondo (Corrigido propriedades do SVG) */}
      <button className="floating-menu-btn" onClick={() => setIsOpen(!isOpen)} style={styles.button}>
        <svg 
          viewBox="0 0 24 24" 
          width="24" 
          height="24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
      </button>
    </div>
  );
}

// Estilos corrigidos para os padrões do React (CamelCase nos zIndex e border)
const styles = {
  container: { position: 'fixed', bottom: '20px', left: '20px', zIndex: 9999, fontFamily: 'sans-serif' },
  button: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#2c3e50', color: 'white', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  options: { position: 'absolute', bottom: '60px', left: 0, width: '220px', maxHeight: '400px', overflowY: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', flexDirection: 'column', border: '1px solid #e0e0e0' },
  header: { padding: '10px 14px', backgroundColor: '#f8f9fa', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#7f8c8d', borderBottom: '1px solid #eee' },
  item: { display: 'flex', alignItems: 'center', padding: '10px 14px', color: '#333', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #f5f5f5' },
  span: { marginRight: '8px', color: '#95a5a6', fontSize: '12px', width: '18px', display: 'inline-block' }
};
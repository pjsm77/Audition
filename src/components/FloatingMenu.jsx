// src/components/FloatingMenu.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Disc, 
  Music, 
  Globe, 
  Languages, 
  BarChart2, 
  Compass, 
  PieChart, 
  LayoutDashboard, 
  Clock, 
  Link2, 
  PlusCircle, 
  Bug,
  Menu,
  X
} from 'lucide-react';

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { to: "/", label: "Artists", icon: <Users size={16} /> },
    { to: "/albums", label: "Albums", icon: <Disc size={16} /> },
    { to: "/tracks", label: "Tracks", icon: <Music size={16} /> },
    { to: "/countries", label: "Countries", icon: <Globe size={16} /> },
    { to: "/languages", label: "Languages", icon: <Languages size={16} /> },
    { to: "/charts", label: "Charts", icon: <BarChart2 size={16} /> },
    { to: "/discover", label: "Discover", icon: <Compass size={16} /> },
    { to: "/stats", label: "Stats", icon: <PieChart size={16} /> },
    { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { to: "/recent", label: "Recent", icon: <Clock size={16} /> },
    { to: "/links", label: "Links", icon: <Link2 size={16} /> },
    { to: "/new-entries", label: "New Entries", icon: <PlusCircle size={16} /> },
    { to: "/debug", label: "Debug", icon: <Bug size={16} /> },
  ];

  return (
    <div className="floating-menu-container" ref={menuRef} style={styles.container}>
      <div 
        className={`floating-menu-options ${isOpen ? 'active' : ''}`} 
        style={{...styles.options, display: isOpen ? 'flex' : 'none'}}
      >
        {menuItems.map((item, index) => (
          <Link 
            key={item.to}
            to={item.to} 
            className="menu-item" 
            onClick={() => setIsOpen(false)} 
            style={styles.item}
          >
            <span style={styles.number}>{index + 1}</span>
            <span style={styles.iconWrapper}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <button className="floating-menu-btn" onClick={() => setIsOpen(!isOpen)} style={styles.button}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  );
}

const styles = {
  container: { 
    position: 'fixed', 
    bottom: '20px', 
    left: '20px', 
    zIndex: 9999, 
    fontFamily: "'Bebas Neue', cursive", // Atualizado para a sua configuração padrão
    letterSpacing: '0.8px'               // Um ajuste sutil de espaçamento que cai muito bem com o estilo cursive/display da Bebas
  },
  button: { 
    width: '50px', 
    height: '50px', 
    borderRadius: '50%', 
    backgroundColor: '#2c3e50', 
    color: 'white', 
    border: 'none', 
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    transition: 'transform 0.2s ease'
  },
  options: { 
    position: 'absolute', 
    bottom: '60px', 
    left: 0, 
    width: '240px', 
    maxHeight: '580px', 
    overflowY: 'auto', 
    backgroundColor: 'white', 
    borderRadius: '8px', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)', 
    flexDirection: 'column', 
    border: '1px solid #e0e0e0',
    padding: '4px 0'
  },
  item: { 
    display: 'flex', 
    alignItems: 'center', 
    padding: '10px 14px', 
    color: '#333', 
    textDecoration: 'none', 
    fontSize: '18px',                  // Aumentado levemente para dar o destaque imponente que a Bebas Neue pede
    borderBottom: '1px solid #f5f5f5',
    transition: 'background-color 0.15s ease'
  },
  number: { 
    marginRight: '8px', 
    color: '#95a5a6', 
    fontSize: '11px', 
    width: '18px', 
    display: 'inline-block',
    textAlign: 'center',
    fontFamily: 'sans-serif'             // Mantido em sans-serif para garantir largura fixa e alinhamento dos números de dois dígitos
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '10px',
    color: '#7f8c8d'
  }
};
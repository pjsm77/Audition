// src/components/FloatingMenu.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  // Estilos inline para fixar o menu no canto inferior esquerdo
  const menuContainerStyle = {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    zIndex: 1000,
    fontFamily: 'Segoe UI, Roboto, sans-serif'
  };

  const buttonStyle = {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: '#ba0000',
    border: 'none',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
    transition: 'transform 0.2s'
  };

  const dropdownStyle = {
    position: 'absolute',
    bottom: '55px',
    left: '0',
    backgroundColor: '#1e1e1e',
    borderRadius: '8px',
    padding: '6px 0',
    minWidth: '130px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
    display: isOpen ? 'block' : 'none',
    border: '1px solid #333'
  };

  const itemStyle = {
    padding: '8px 16px',
    color: '#e0e0e0',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'background 0.2s',
  };

  return (
    <div style={menuContainerStyle}>
      {/* Todas as opções originais restauradas */}
      <div style={dropdownStyle}>
        <div 
          style={itemStyle} 
          onClick={() => handleNavigation('/artists')}
          onMouseEnter={(e) => e.target.style.background = '#2a2a2a'}
          onMouseLeave={(e) => e.target.style.background = 'transparent'}
        >
          Artistas
        </div>
        <div 
          style={itemStyle} 
          onClick={() => handleNavigation('/recent')}
          onMouseEnter={(e) => e.target.style.background = '#2a2a2a'}
          onMouseLeave={(e) => e.target.style.background = 'transparent'}
        >
          Recentes
        </div>
      </div>

      {/* Botão flutuante com propriedades SVG corrigidas para o React */}
      <button style={buttonStyle} onClick={toggleMenu}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}
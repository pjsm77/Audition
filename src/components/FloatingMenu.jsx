// src/components/FloatingMenu.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [chartsOpen, setChartsOpen] = useState(false); // Controla a sanfona de Charts
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setChartsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { 
      to: "/", 
      label: "Artists", 
      color: "#e6224c",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      )
    },
    { 
      to: "/albums", 
      label: "Albums", 
      color: "#f15a24",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    },
    { 
      to: "/tracks", 
      label: "Tracks", 
      color: "#f9a01b",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      )
    },
    { 
      to: "/countries", 
      label: "Countries", 
      color: "#ffd400",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      )
    },
    { 
      to: "/languages", 
      label: "Languages", 
      color: "#cedc00",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 8 6 6" />
          <path d="m4 14 6-6 2-3" />
          <path d="M2 5h12" />
          <path d="M7 2h1" />
          <path d="m22 22-5-10-5 10" />
          <path d="M14 18h6" />
        </svg>
      )
    },
    { 
      to: "/trending", 
      label: "Trending", 
      color: "#8cc63f",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      )
    },
    { 
      label: "Charts", 
      color: "#39b54a",
      isParent: true,
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      subItems: [
        { to: "/charts/top10", label: "Top 10" },
        { to: "/charts/scrobbles", label: "Scrobbles" }
      ]
    },
    { 
      to: "/discover", 
      label: "Discover", 
      color: "#00a651",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      )
    },
    { 
      to: "/stats", 
      label: "Stats", 
      color: "#00a99d",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
          <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
      )
    },
    { 
      to: "/dashboard", 
      label: "Dashboard", 
      color: "#29abe2",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      )
    },
    { 
      to: "/recent", 
      label: "Recent", 
      color: "#0071bc",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    },
    { 
      to: "/links", 
      label: "Links", 
      color: "#1b1464",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      )
    },
    { 
      to: "/new-entries", 
      label: "New Entries", 
      color: "#3e3a94",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      )
    },
    { 
      to: "/profile", 
      label: "Profile", 
      color: "#722e85",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    },
  ];

  return (
    <div className="floating-menu-container" ref={menuRef} style={styles.container}>
      <div 
        className={`floating-menu-options ${isOpen ? 'active' : ''}`} 
        style={{...styles.options, display: isOpen ? 'flex' : 'none'}}
      >
        {menuItems.map((item, index) => {
          if (item.isParent) {
            return (
              <div key={item.label} style={{ display: 'flex', flexDirection: 'column' }}>
                <div 
                  style={{ ...styles.item, cursor: 'pointer' }} 
                  onClick={() => setChartsOpen(!chartsOpen)}
                >
                  <span style={styles.number}>{index + 1}</span>
                  <span style={{...styles.iconWrapper, color: item.color}}>{item.icon}</span>
                  <span style={{ flexGrow: 1 }}>{item.label}</span>
                  <span style={{ fontSize: '10px', opacity: 0.5 }}>
                    {chartsOpen ? '▲' : '▼'}
                  </span>
                </div>
                
                {chartsOpen && item.subItems.map((sub, subIndex) => (
                  <Link
                    key={sub.to}
                    to={sub.to.startsWith('/') ? sub.to : `/${sub.to}`}
                    onClick={() => {
                      setIsOpen(false);
                      setChartsOpen(false);
                    }}
                    style={styles.subItem}
                  >
                    <span style={styles.subNumber}>{index + 1}.{subIndex + 1}</span>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: item.color, marginRight: '12px' }} />
                    <span>{sub.label}</span>
                  </Link>
                ))}
              </div>
            );
          }

          return (
            <Link 
              key={item.to}
              to={item.to.startsWith('/') ? item.to : `/${item.to}`}
              className="menu-item" 
              onClick={() => setIsOpen(false)} 
              style={styles.item}
            >
              <span style={styles.number}>{index + 1}</span>
              <span style={{...styles.iconWrapper, color: item.color}}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <button className="floating-menu-btn" onClick={() => setIsOpen(!isOpen)} style={styles.button}>
        {isOpen ? (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
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
    fontFamily: '"Bebas Neue", cursive',
    letterSpacing: '0.8px'
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
    justifyContent: 'center'
  },
  options: { 
    position: 'absolute', 
    bottom: '60px', 
    left: 0, 
    width: '240px', 
    maxHeight: '500px', 
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
    fontSize: '18px', 
    borderBottom: '1px solid #f5f5f5'
  },
  subItem: {
    display: 'flex', 
    alignItems: 'center', 
    padding: '8px 14px 8px 28px', 
    color: '#555', 
    textDecoration: 'none', 
    fontSize: '16px', 
    backgroundColor: '#fafafa',
    borderBottom: '1px solid #f5f5f5'
  },
  number: { 
    marginRight: '8px', 
    color: '#95a5a6', 
    fontSize: '11px', 
    width: '18px', 
    display: 'inline-block',
    textAlign: 'center',
    fontFamily: 'sans-serif'
  },
  subNumber: {
    marginRight: '12px', 
    color: '#bdc3c7', 
    fontSize: '10px', 
    width: '22px', 
    display: 'inline-block',
    textAlign: 'left',
    fontFamily: 'sans-serif'
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '10px'
  }
};
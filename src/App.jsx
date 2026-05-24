// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Artists from './pages/artists';
import Albums from './pages/albums';
import Countries from './pages/countries';
import Recent from './pages/recent';
import Charts from './pages/charts';
import FloatingMenu from './components/FloatingMenu';

export default function App() {
  return (
    <div className="app-container">
      {/* O menu flutuante fica ativo globalmente em todas as páginas */}
      <FloatingMenu />
      
      <Routes>
        <Route path="/" element={<Artists />} />
        <Route path="/albums" element={<Albums />} />
        <Route path="/countries" element={<Countries />} />
        <Route path="/recent" element={<Recent />} />
        <Route path="/charts" element={<Charts />} />
        {/* Caso tenha /albums ou outras rotas no menu, elas apontarão para cá */}
      </Routes>
    </div>
  );
}
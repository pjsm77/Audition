// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Artists from './pages/artists';
import Albums from './pages/albums';
import Countries from './pages/countries';
import Languages from './pages/languages';
import Stats from './pages/stats';
import Recent from './pages/recent';
import Charts from './pages/charts';
import Links from './pages/links';
import NewEntries from './pages/new_entries'; // Importação da nova página
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
        <Route path="/languages" element={<Languages />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/recent" element={<Recent />} />
        <Route path="/charts" element={<Charts />} />
        <Route path="/links" element={<Links />} />
        <Route path="/new-entries" element={<NewEntries />} /> {/* Nova rota incluída */}
        {/* Caso tenha /albums ou outras rotas no menu, elas apontarão para cá */}
      </Routes>
    </div>
  );
}
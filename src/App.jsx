// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Artists from './pages/artists';
import Albums from './pages/albums';
import Tracks from './pages/tracks';
import Countries from './pages/countries';
import Languages from './pages/languages';
import Trending from './pages/trending';
import Charts from './pages/charts';       // Sua página original que agora serve como "Scrobbles"
import Top10Charts from './pages/top10';   // Sua página específica que consome a view do Top 10
import Discover from './pages/discover';
import Stats from './pages/stats';
import Recent from './pages/recent';
import Links from './pages/links';
import NewEntries from './pages/new_entries'; 
import FloatingMenu from './components/FloatingMenu';

export default function App() {
  return (
    <div className="app-container">
      {/* O menu flutuante fica ativo globalmente em todas as páginas */}
      <FloatingMenu />
      
      <Routes>
        <Route path="/" element={<Artists />} />
        <Route path="/albums" element={<Albums />} />
        <Route path='/tracks' element={<Tracks />} />
        <Route path="/countries" element={<Countries />} />
        <Route path="/languages" element={<Languages />} />
        <Route path="/trending" element={<Trending />} />
        
        {/* Ajuste perfeito para os subitens de Charts se separarem sem conflito */}
        <Route path="/charts/scrobbles" element={<Charts />} />
        <Route path="/charts/top10" element={<Top10Charts />} />
        {/* Fallback caso você clique no título principal "/charts" ir direto para Scrobbles */}
        <Route path="/charts" element={<Charts />} />

        <Route path="/discover" element={<Discover />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/recent" element={<Recent />} />
        <Route path="/links" element={<Links />} />
        <Route path="/new-entries" element={<NewEntries />} />
      </Routes>
    </div>
  );
}
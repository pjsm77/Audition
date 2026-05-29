// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Artists from './pages/artists';
import Albums from './pages/albums';
import Tracks from './pages/tracks';
import Countries from './pages/countries';
import Languages from './pages/languages';
import Trending from './pages/trending';
import Charts from './pages/charts'; // Esta página original passa a ser o "Scrobbles"
import Top10Charts from './pages/top10'; // A sua nova página do Top 10 com desempate
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
        
        {/* Configuração de rotas aninhadas para os Charts */}
        <Route path="/charts">
          {/* Se o utilizador tentar aceder a /charts diretamente, ele é redirecionado para /charts/scrobbles */}
          <Route index element={<Navigate to="/charts/scrobbles" replace />} />
          <Route path="scrobbles" element={<Charts />} />
          <Route path="top10" element={<Top10Charts />} />
        </Route>

        <Route path="/discover" element={<Discover />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/recent" element={<Recent />} />
        <Route path="/links" element={<Links />} />
        <Route path="/new-entries" element={<NewEntries />} />
      </Routes>
    </div>
  );
}
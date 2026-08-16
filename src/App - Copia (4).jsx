// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Artists from './pages/artists';
import Albums from './pages/albums';
import Tracks from './pages/tracks';
import Countries from './pages/countries';
import Languages from './pages/languages';
import Trending from './pages/trending';
import Charts from './pages/charts';         
import Top10Charts from './pages/top10';     
import HallOfFame from './pages/hall_of_fame'; // IMPORTAÇÃO DA NOVA PÁGINA DO BANCO
import Profile from './pages/profile';       
import Discover from './pages/discover';
import Stats from './pages/stats';
import Recent from './pages/recent';
import Links from './pages/links';
import NewEntries from './pages/new_entries'; 
import FloatingMenu from './components/FloatingMenu';

export default function App() {
  return (
    <div className="app-container">
      <FloatingMenu />
      
      <Routes>
        <Route path="/" element={<Artists />} />
        <Route path="/albums" element={<Albums />} />
        <Route path='/tracks' element={<Tracks />} />
        <Route path="/countries" element={<Countries />} />
        <Route path="/languages" element={<Languages />} />
        <Route path="/trending" element={<Trending />} />
        
        <Route path="/profile" element={<Profile />} />

        {/* ROTAS DE GRÁFICOS / CHARTS */}
        <Route path="/charts/scrobbles" element={<Charts />} />
        <Route path="/charts/top10" element={<Top10Charts />} />
        <Route path="/charts/hall-of-fame" element={<HallOfFame />} /> {/* NOVA ROTA DO HALL OF FAME */}
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
// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Artists from './pages/artists'; 
import Recent from './pages/recent';
import FloatingMenu from './components/FloatingMenu';

export default function App() {
  return (
    <>
      <Routes>
        {/* Define a tela de Artistas como a página inicial do site */}
        <Route path="/" element={<Artists />} />
        <Route path="/artists" element={<Artists />} />
        <Route path="/recent" element={<Recent />} />
      </Routes>
      
      {/* O menu fixo com todas as opções */}
      <FloatingMenu />
    </>
  );
} 
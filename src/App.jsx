// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Artists from './pages/Artists'; 
import Recent from './pages/Recent';
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
      
      {/* O menu fixo que aparecerá em todas as telas */}
      <FloatingMenu />
    </>
  );
}
// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FloatingMenu from './components/FloatingMenu';

// Importando as páginas que você criou
import Artists from './pages/Artists';
import Recent from './pages/Recent';
import Charts from './pages/Charts';

// Componentes temporários para as rotas que ainda vamos fazer, assim o app não quebra
const Placeholder = ({ name }) => <div style={{ padding: '20px' }}><h2>{name} (Tela em desenvolvimento)</h2></div>;

export default function App() {
  return (
    <Router>
      {/* O menu flutuante fica aqui fora, aparecendo fixo em todas as páginas */}
      <FloatingMenu />

      {/* Aqui o React decide qual página renderizar com base na URL */}
      <Routes>
        <Route path="/" element={<Artists />} />
        <Route path="/recent" element={<Recent />} />
        <Route path="/charts" element={<Charts />} />
        
        {/* Rotas secundárias usando o placeholder por enquanto */}
        <Route path="/albums" element={<Placeholder name="2. Albums" />} />
        <Route path="/tracks" element={<Placeholder name="3. Tracks" />} />
        <Route path="/countries" element={<Placeholder name="4. Countries" />} />
        <Route path="/languages" element={<Placeholder name="5. Languages" />} />
        <Route path="/discover" element={<Placeholder name="7. Discover" />} />
        <Route path="/stats" element={<Placeholder name="8. Stats" />} />
        <Route path="/dashboard" element={<Placeholder name="9. Dashboard" />} />
        <Route path="/links" element={<Placeholder name="11. Links" />} />
        <Route path="/new-entries" element={<Placeholder name="12. New Entries" />} />
        <Route path="/debug" element={<Placeholder name="13. Debug" />} />
      </Routes>
    </Router>
  );
}
// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; // CORREÇÃO: Importando o Layout que faltava
import Artists from './pages/artists';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Artists />} />
          {/* Outras rotas internas caso existam ficam aqui */}
        </Route>
      </Routes>
    </Router>
  );
}
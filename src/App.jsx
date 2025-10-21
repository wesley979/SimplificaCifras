import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom';

// ===================
// Componentes
// ===================
import Header from './Header';
import SearchBar from './SearchBar';
import Login from './Login';
import Register from './Register';
import AddCifra from './AddCifra';
import Home from './Home';
import CifraDetalhe from './CifraDetalhe';
import Favoritos from './Favoritos';
import Home2 from './Home2';
import CifraGenero from './CifraGenero';

// Novas páginas institucionais
import Privacidade from './Privacidade.jsx';
import Termos from './Termos.jsx';
import Contato from './Contato.jsx';

// ===================
// Contexto de autenticação
// ===================
import { AuthProvider } from './contexts/AuthContext';

// ===================
// Firebase
// ===================
import { db, doc, deleteDoc, collection, getDocs } from './firebase';

import './App.css';

// Util de slug (mantemos aqui para evitar import circular; depois podemos movê-lo para src/utils/slugify)
function slugify(input = '') {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Componente que recebe um ID antigo e redireciona para a URL bonita /cifras/:artistSlug/:musicSlug
function LegacyByIdRedirect({ cifras }) {
  const { slugOrId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Se já veio no formato slug/slug, evita loop e manda para a rota correta
    if (slugOrId && slugOrId.includes('-')) {
      const parts = slugOrId.split('-');
      if (parts.length > 1) {
        navigate('/', { replace: true });
        return;
      }
    }

    // Tenta localizar a cifra por ID na lista carregada
    const found = cifras.find(c => c.id === slugOrId);
    if (found) {
      const artistSlug = slugify(found.artista || found.artistName);
      const musicSlug = slugify(found.musica || found.titulo || found.title);
      navigate(`/cifras/${artistSlug}/${musicSlug}`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [slugOrId, cifras, navigate]);

  return null;
}

function AppContent() {
  const location = useLocation();
  
  // -----------------------
  // Estados principais
  // -----------------------
  const [cifras, setCifras] = useState([]); // Lista de cifras
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // -----------------------
  // Debounce da busca
  // -----------------------
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // -----------------------
  // Carregar cifras do Firestore
  // -----------------------
  useEffect(() => {
    async function fetchCifras() {
      const querySnapshot = await getDocs(collection(db, 'cifras'));
      const lista = [];
      querySnapshot.forEach(docSnap => lista.push({ id: docSnap.id, ...docSnap.data() }));
      setCifras(lista);
    }
    fetchCifras();
  }, []);

  // -----------------------
  // Função para deletar cifra
  // -----------------------
  async function handleDelete(id) {
    try {
      await deleteDoc(doc(db, 'cifras', id));
      setCifras(prev => prev.filter(cifra => cifra.id !== id));
    } catch (error) {
      console.error('Erro ao deletar cifra:', error);
      alert('Erro ao deletar cifra. Veja o console.');
    }
  }

  // -----------------------
  // Filtrar cifras com base na busca
  // -----------------------
  const filteredCifras = cifras.filter(cifra =>
    cifra.musica?.toLowerCase().includes(debouncedTerm.toLowerCase()) ||
    cifra.artista?.toLowerCase().includes(debouncedTerm.toLowerCase())
  );

  // -----------------------
  // Controle de exibição do Header
  // -----------------------
  // Cobrir tanto rota antiga quanto nova
  const showHeader = location.pathname.startsWith('/cifras/');

  return (
    <>
      {showHeader && <Header />}
      
      <Routes>
        {/* Página principal */}
        <Route path="/" element={<Home2 />} />
        <Route path="/home2" element={<Home2 />} />

        {/* Rota NOVA "bonita": /cifras/:artistSlug/:musicSlug */}
        <Route
          path="/cifras/:artistSlug/:musicSlug"
          element={<CifraDetalhe cifras={cifras} onDelete={handleDelete} />}
        />

        {/* Rota ANTIGA por ID → redireciona para a rota bonita */}
        <Route
          path="/cifras/detalhe/:slugOrId"
          element={<LegacyByIdRedirect cifras={cifras} />}
        />

        {/* Adicionar nova cifra */}
        <Route
          path="/add-cifra"
          element={<AddCifra setCifras={setCifras} cifras={cifras} />}
        />

        {/* Editar cifra existente */}
        <Route
          path="/edit-cifra/:id"
          element={<AddCifra setCifras={setCifras} cifras={cifras} />}
        />

        {/* Favoritos */}
        <Route path="/favoritos" element={<Favoritos />} />

        {/* Login e Registro */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Página de gênero */}
        <Route path="/genero/:genero" element={<CifraGenero />} />

        {/* Páginas institucionais */}
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="/contato" element={<Contato />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
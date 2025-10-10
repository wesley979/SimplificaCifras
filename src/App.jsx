import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

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

// ===================
// Contexto de autenticação
// ===================
import { AuthProvider } from './contexts/AuthContext';

// ===================
// Firebase
// ===================
import { db, doc, deleteDoc, collection, getDocs } from './firebase';

import './App.css';

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
      setCifras(cifras.filter(cifra => cifra.id !== id));
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
  const showHeader = location.pathname.startsWith('/cifras/detalhe/');

  return (
    <>
      {showHeader && <Header />}
      
      <Routes>
        {/* Página principal */}
        <Route path="/" element={<Home2 />} />
        <Route path="/home2" element={<Home2 />} />

        {/* Detalhe de cifra com /detalhe/:id */}
        <Route
          path="/cifras/detalhe/:slugOrId"
          element={<CifraDetalhe cifras={cifras} onDelete={handleDelete} />}
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
        <Route
          path="/favoritos"
          element={<Favoritos />}
        />

        {/* Login e Registro */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Página de gênero */}
        <Route path="/genero/:genero" element={<CifraGenero />} />
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
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './Header';
import SearchBar from './SearchBar';
import Login from './Login';
import Register from './Register';
import AddCifra from './AddCifra';
import Home from './Home';
import CifraDetalhe from './CifraDetalhe';

import { AuthProvider } from './contexts/AuthContext';

import { db, doc, deleteDoc, collection, getDocs, query, where } from './firebase';

import './App.css';

function App() {
  const [cifras, setCifras] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // Debounce para a busca
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Carregar cifras do Firestore
  useEffect(() => {
    async function fetchCifras() {
      const querySnapshot = await getDocs(collection(db, 'cifras'));
      const lista = [];
      querySnapshot.forEach(docSnap => lista.push({ id: docSnap.id, ...docSnap.data() }));
      setCifras(lista);
    }
    fetchCifras();
  }, []);

  // Deletar cifra
  async function handleDelete(id) {
    try {
      await deleteDoc(doc(db, 'cifras', id));
      setCifras(cifras.filter(cifra => cifra.id !== id));
    } catch (error) {
      console.error('Erro ao deletar cifra:', error);
      alert('Erro ao deletar cifra. Veja o console.');
    }
  }

  // Filtrar cifras
  const filteredCifras = cifras.filter(cifra =>
    cifra.musica?.toLowerCase().includes(debouncedTerm.toLowerCase()) ||
    cifra.artista?.toLowerCase().includes(debouncedTerm.toLowerCase())
  );

  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
                <Home cifras={filteredCifras} />
              </>
            }
          />

          {/* Página de detalhe da cifra por ID ou slug */}
          <Route
            path="/cifras/:slugOrId"
            element={<CifraDetalhe cifras={cifras} onDelete={handleDelete} />}
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Adicionar nova cifra */}
          <Route path="/add-cifra" element={<AddCifra setCifras={setCifras} cifras={cifras} />} />

          {/* Editar cifra */}
          <Route path="/edit-cifra/:id" element={<AddCifra setCifras={setCifras} cifras={cifras} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

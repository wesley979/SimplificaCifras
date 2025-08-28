import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { db, getFavorites, doc, getDoc, removeFavorite } from './firebase';

export default function Favoritos() {
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Pega os favoritos do usuário
        const favDocs = await getFavorites(user.uid);

        // Busca os detalhes de cada cifra
        const cifrasPromises = favDocs.map(async (fav) => {
          const cifraDoc = await getDoc(doc(db, 'cifras', fav.cifraId));
          if (cifraDoc.exists()) {
            return { id: cifraDoc.id, ...cifraDoc.data() };
          }
          return null;
        });

        const cifras = await Promise.all(cifrasPromises);
        setFavorites(cifras.filter(c => c !== null));
      } catch (err) {
        console.error('Erro ao buscar favoritos:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  // Função para remover favorito direto da lista
  const handleRemoveFavorite = async (cifraId) => {
    if (!user) return;
    try {
      // Alterado para usar 'usuarios' internamente via firebase.js
      await removeFavorite(user.uid, cifraId);
      setFavorites(prev => prev.filter(c => c.id !== cifraId));
    } catch (err) {
      console.error('Erro ao remover favorito:', err.message);
    }
  };

  if (authLoading || loading) return <p>Carregando favoritos...</p>;

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Você precisa estar logado para ver seus favoritos.</p>
        <Link to="/">← Voltar para Home</Link>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Você ainda não favoritou nenhuma cifra.</p>
        <Link to="/">← Voltar para Home</Link>
      </div>
    );
  }

  return (
    <section style={{ padding: '1rem', maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Meus Favoritos</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {favorites.map((cifra) => (
          <li
            key={cifra.id}
            style={{
              marginBottom: '1rem',
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: '#f0f0f0',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Link
              to={`/cifras/${cifra.id}`}
              style={{ textDecoration: 'none', color: '#007acc', fontWeight: 'bold' }}
            >
              {cifra.musica ?? 'Música sem nome'} - {cifra.artista ?? 'Artista desconhecido'}
            </Link>
            <button
              onClick={() => handleRemoveFavorite(cifra.id)}
              style={{
                marginLeft: '1rem',
                backgroundColor: '#ff4d4d',
                color: '#fff',
                border: 'none',
                padding: '0.3rem 0.6rem',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to="/">← Voltar para Home</Link>
      </div>
    </section>
  );
}

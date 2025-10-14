import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { db, getFavorites, doc, getDoc, removeFavorite } from './firebase';

export default function Favoritos() {
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMsg('');

      try {
        // Pega os favoritos do usuário (cada item deve ter fav.cifraId)
        const favDocs = await getFavorites(user.uid);

        // Busca os detalhes de cada cifra favorita
        const cifrasPromises = favDocs.map(async (fav) => {
          if (!fav?.cifraId) return null;
          try {
            const cifraRef = doc(db, 'cifras', fav.cifraId);
            const cifraDoc = await getDoc(cifraRef);
            if (cifraDoc.exists()) {
              return { id: cifraDoc.id, ...cifraDoc.data() };
            }
            return null;
          } catch (e) {
            console.error('Erro ao buscar cifra favorita:', e);
            return null;
          }
        });

        const cifras = await Promise.all(cifrasPromises);
        setFavorites(cifras.filter((c) => c !== null));
      } catch (err) {
        console.error('Erro ao buscar favoritos:', err);
        setErrorMsg('Não foi possível carregar seus favoritos agora. Tente novamente em instantes.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  // Remover favorito direto da lista
  const handleRemoveFavorite = async (cifraId) => {
    if (!user || !cifraId) return;
    try {
      await removeFavorite(user.uid, cifraId);
      setFavorites((prev) => prev.filter((c) => c.id !== cifraId));
    } catch (err) {
      console.error('Erro ao remover favorito:', err);
      alert('Não foi possível remover. Tente novamente.');
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

  if (errorMsg) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>{errorMsg}</p>
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
              gap: '.75rem',
            }}
          >
            <Link
              // CORREÇÃO: usar a rota do detalhe (/cifras/detalhe/:id)
              to={`/cifras/detalhe/${cifra.id}`}
              style={{ textDecoration: 'none', color: '#007acc', fontWeight: 'bold', flex: 1 }}
            >
              {(cifra.musica ?? 'Música sem nome') + ' - ' + (cifra.artista ?? 'Artista desconhecido')}
            </Link>

            <button
              onClick={() => handleRemoveFavorite(cifra.id)}
              style={{
                backgroundColor: '#ff4d4d',
                color: '#fff',
                border: 'none',
                padding: '0.4rem 0.7rem',
                borderRadius: '6px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
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
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  db,
  doc,
  getDoc,
  updateDoc,
  increment,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  deleteDoc,
} from './firebase';
import { useAuth } from './hooks/useAuth';

export default function CifraDetalhe({ onDelete }) {
  const { slugOrId } = useParams();
  const navigate = useNavigate();
  const { user, isMaster, loading: authLoading } = useAuth();

  const [cifra, setCifra] = useState(null);
  const [views, setViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 600);
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Busca a cifra
  useEffect(() => {
    const fetchCifra = async () => {
      setLoading(true);
      setError('');

      try {
        let docSnap;
        const docRef = doc(db, 'cifras', slugOrId);
        docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          const q = query(collection(db, 'cifras'), where('slug', '==', slugOrId));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            docSnap = querySnapshot.docs[0];
          }
        }

        if (docSnap.exists()) {
          const data = docSnap.data();
          setCifra({ id: docSnap.id, ...data });
          setViews(data.views || 0);

          try {
            await updateDoc(doc(db, 'cifras', docSnap.id), { views: increment(1) });
            setViews((prev) => prev + 1);
          } catch (err) {
            console.error('Erro ao atualizar views:', err.message);
          }

          if (user) {
            const favDocRef = doc(db, 'usuarios', user.uid, 'favorites', docSnap.id);
            const favSnap = await getDoc(favDocRef);
            setIsFavorite(favSnap.exists());
          }
        } else {
          setError('Cifra não encontrada.');
        }
      } catch (err) {
        setError('Erro ao buscar cifra: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCifra();
  }, [slugOrId, user]);

  const toggleFavorite = async () => {
    if (!user) {
      alert('Você precisa estar logado para favoritar.');
      return;
    }
    try {
      const favDocRef = doc(db, 'usuarios', user.uid, 'favorites', cifra.id);
      if (isFavorite) {
        await deleteDoc(favDocRef);
        setIsFavorite(false);
      } else {
        await setDoc(favDocRef, {
          cifraId: cifra.id,
          favoritedAt: new Date().toISOString(),
        });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Erro ao atualizar favoritos:', err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir esta cifra?')) return;
    setDeleting(true);
    try {
      await onDelete(cifra.id);
      navigate('/');
    } catch (err) {
      alert('Erro ao deletar cifra: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleEditar = () => {
    navigate('/edit-cifra/' + cifra.id);
  };

  if (loading || authLoading) return <p>Carregando...</p>;

  if (error)
    return (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <Link to="/" style={{ color: '#007acc' }}>
          Voltar para Home
        </Link>
      </div>
    );

  return (
    <section
      style={{
        padding: '1rem',
        paddingBottom: isMobileView ? '6rem' : '5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        minHeight: '100vh',
      }}
    >
      {/* Contador de visualizações */}
      <div
        style={{
          position: isMobileView ? 'fixed' : 'absolute',
          top: isMobileView ? 'auto' : 10,
          bottom: isMobileView ? 70 : 'auto',
          right: 10,
          fontWeight: 'bold',
          fontSize: isMobileView ? '12px' : '16px',
          color: '#000',
          zIndex: 10,
        }}
      >
        Visualizações: {views}
      </div>

      {/* Botão de Favorito (aparece junto do contador no mobile) */}
      {user && (
        <button
          onClick={toggleFavorite}
          style={{
            position: isMobileView ? 'fixed' : 'absolute',
            top: isMobileView ? 'auto' : 40,
            bottom: isMobileView ? 10 : 'auto',
            right: 10,
            backgroundColor: isFavorite ? '#4caf50' : '#4169e1', 
            color: '#fff',
            border: 'none',
            padding: '0.6rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            zIndex: 10,
          }}
        >
          {isFavorite ? '★ Favorito' : '☆ Favoritar'}
        </button>
      )}

      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        {cifra?.musica ?? 'Música não informada'} - {cifra?.artista ?? 'Artista não informado'}
      </h2>

      <pre
        style={{
          overflowX: 'auto',
          whiteSpace: 'pre',
          fontFamily: 'monospace',
          fontSize: 'clamp(1rem, 1.1vw, 1.2rem)',
          maxWidth: '700px',
          width: '100%',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'left',
          backgroundColor: '#e8e8e8',
          color: '#222',
        }}
      >
        {cifra?.cifra ?? 'Cifra não disponível.'}
      </pre>

      {/* Botões de edição e exclusão */}
      {isMaster && (
        <div style={{ marginTop: '1.5rem' }}>
          <button onClick={handleEditar} style={{ marginRight: '1rem' }}>
            Editar
          </button>
          <button onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      )}

      <Link
        to="/"
        style={{
          display: 'inline-block',
          marginTop: '2rem',
          color: '#007acc',
          zIndex: 1,
        }}
      >
        ← Voltar para Home
      </Link>
    </section>
  );
}

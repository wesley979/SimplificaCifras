// src/CifraDetalhe.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db, doc, getDoc, updateDoc, increment } from './firebase';
import { useAuth } from './hooks/useAuth';

export default function CifraDetalhe({ onDelete }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isMaster, loading: authLoading } = useAuth();

  const [cifra, setCifra] = useState(null);
  const [views, setViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // State para controlar posição do contador conforme tamanho da tela
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 600);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 600);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchCifra = async () => {
      setLoading(true);
      setError('');
      try {
        const docRef = doc(db, 'cifras', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setCifra({ id: docSnap.id, ...data });
          setViews(data.views || 0);

          try {
            await updateDoc(docRef, { views: increment(1) });
            setViews((prev) => prev + 1);
          } catch (err) {
            console.error('Erro ao atualizar views:', err.message);
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
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir esta cifra?')) return;
    setDeleting(true);
    try {
      await onDelete(id);
      navigate('/');
    } catch (err) {
      alert('Erro ao deletar cifra: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleEditar = () => {
    navigate('/edit-cifra/' + id);
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
        paddingBottom: '5rem',
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
          position: 'absolute',
          top: isMobileView ? 'auto' : 10,
          bottom: isMobileView ? 10 : 'auto',
          right: 10,
          fontWeight: 'bold',
          fontSize: isMobileView ? '12px' : '16px',
          color: '#000',
        }}
      >
        Visualizações: {views}
      </div>

      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        {cifra?.musica ?? 'Música não informada'} -{' '}
        {cifra?.artista ?? 'Artista não informado'}
      </h2>

      {/* Cifra com scroll horizontal para mobile */}
      <pre
        style={{
          overflowX: 'auto',        // permite scroll horizontal no mobile
          whiteSpace: 'pre',        // mantém todos os espaços e alinhamento
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

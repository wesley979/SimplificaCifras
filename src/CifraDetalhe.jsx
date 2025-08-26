import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db, doc, getDoc, updateDoc, increment, collection, query, where, getDocs } from './firebase';
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

  // Controla visualizações no mobile
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 600);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchCifra = async () => {
      setLoading(true);
      setError('');

      try {
        let docSnap;
        // Primeiro tenta buscar por ID
        const docRef = doc(db, 'cifras', slugOrId);
        docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          // Se não achar, tenta buscar por slug
          const q = query(collection(db, 'cifras'), where('slug', '==', slugOrId));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0];
            docSnap = docData;
          }
        }

        if (docSnap.exists()) {
          const data = docSnap.data();
          setCifra({ id: docSnap.id, ...data });
          setViews(data.views || 0);

          try {
            await updateDoc(doc(db, 'cifras', docSnap.id), { views: increment(1) });
            setViews(prev => prev + 1);
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
  }, [slugOrId]);

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

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db, doc, getDoc } from './firebase';
import { useAuth } from './hooks/useAuth';

export default function CifraDetalhe({ onDelete }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isMaster, loading: authLoading } = useAuth();

  const [cifra, setCifra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCifra = async () => {
      setLoading(true);
      setError('');
      try {
        const docRef = doc(db, 'cifras', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCifra({ id: docSnap.id, ...docSnap.data() });
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
    <section style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        {cifra?.musica ?? 'Música não informada'} - {cifra?.artista ?? 'Artista não informado'}
      </h2>

      <pre
        style={{
          backgroundColor: '#e8e8e8', // cinza leve
          color: '#222',
          padding: '1.5rem',
          borderRadius: '8px',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: 'clamp(1rem, 1.1vw, 1.2rem)', // responsiva
          maxWidth: '700px',
          width: '100%',
          textAlign: 'left',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        {cifra?.cifra ?? 'Cifra não disponível.'}
      </pre>

      {/* Somente master vê os botões */}
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
        style={{ display: 'inline-block', marginTop: '2rem', color: '#007acc' }}
      >
        ← Voltar para Home
      </Link>
    </section>
  );
}

// src/AddCifra.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { 
  db, 
  addDoc, 
  collection, 
  serverTimestamp, 
  doc, 
  getDoc, 
  updateDoc 
} from './firebase';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

export default function AddCifra({ setCifras, cifras }) {
  const { user, isMaster } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [musica, setMusica] = useState('');
  const [artista, setArtista] = useState('');
  const [cifra, setCifra] = useState('');
  const [genero, setGenero] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Redireciona se não estiver logado ou não for master
  useEffect(() => {
    if (!user || !isMaster) {
      navigate('/');
    }
  }, [user, isMaster, navigate]);

  // Preenche campos caso seja edição
  useEffect(() => {
    if (location.state?.cifra) {
      const c = location.state.cifra;
      setMusica(c.musica || '');
      setArtista(c.artista || '');
      setCifra(c.cifra || '');
      setGenero(c.genero || '');
      setIsEditMode(true);
    }
  }, [location.state]);

  useEffect(() => {
    async function fetchCifra() {
      if (id) {
        setLoading(true);
        const docRef = doc(db, 'cifras', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setMusica(data.musica || '');
          setArtista(data.artista || '');
          setCifra(data.cifra || '');
          setGenero(data.genero || '');
          setIsEditMode(true);
        } else {
          setMessage('Cifra não encontrada');
        }
        setLoading(false);
      }
    }
    fetchCifra();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!musica || !artista || !cifra) {
      setMessage('Por favor, preencha os campos obrigatórios.');
      return;
    }

    setLoading(true);

    if (isEditMode) {
      try {
        const docRef = id ? doc(db, 'cifras', id) : doc(db, 'cifras', location.state.cifra.id);
        await updateDoc(docRef, {
          musica,
          artista,
          cifra,
          genero,
          updatedAt: serverTimestamp(),
        });

        const cifrasAtualizadas = cifras.map(c =>
          c.id === (id || location.state.cifra.id) ? { ...c, musica, artista, cifra, genero } : c
        );
        setCifras(cifrasAtualizadas);
        setMessage('Cifra atualizada com sucesso!');
        navigate('/');
      } catch (error) {
        setMessage('Erro ao atualizar cifra: ' + error.message);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const novaCifra = {
          musica,
          artista,
          cifra,
          genero,
          userId: user.uid,
          views: 0, // inicializa contador de visualizações
          createdAt: serverTimestamp(),
        };
        const docRef = await addDoc(collection(db, 'cifras'), novaCifra);

        setCifras([...cifras, { id: docRef.id, ...novaCifra }]);
        setMessage('Cifra cadastrada com sucesso!');

        setMusica('');
        setArtista('');
        setCifra('');
        setGenero('');
      } catch (error) {
        setMessage('Erro ao cadastrar cifra: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <section style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '2rem' }}>
        {isEditMode ? 'Editar Cifra' : 'Adicionar Nova Cifra'}
      </h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ fontWeight: 'bold' }}>Nome da Música*:</label>
          <input
            type="text"
            value={musica}
            onChange={(e) => setMusica(e.target.value)}
            disabled={loading}
            style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', borderRadius: '6px', border: '1px solid #ccc', marginTop: '0.3rem' }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 'bold' }}>Artista*:</label>
          <input
            type="text"
            value={artista}
            onChange={(e) => setArtista(e.target.value)}
            disabled={loading}
            style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', borderRadius: '6px', border: '1px solid #ccc', marginTop: '0.3rem' }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 'bold' }}>Cifra*:</label>
          <textarea
            value={cifra}
            onChange={(e) => setCifra(e.target.value)}
            rows={15}
            disabled={loading}
            style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', fontFamily: 'Courier New, monospace', borderRadius: '6px', border: '1px solid #ccc', marginTop: '0.3rem', resize: 'vertical' }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 'bold' }}>Gênero:</label>
          <input
            type="text"
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            disabled={loading}
            style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', borderRadius: '6px', border: '1px solid #ccc', marginTop: '0.3rem' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: '1rem', fontSize: '1.1rem', borderRadius: '6px', border: 'none', backgroundColor: '#007acc', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? (isEditMode ? 'Salvando...' : 'Cadastrando...') : (isEditMode ? 'Salvar' : 'Cadastrar')}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: '1rem', fontSize: '1rem', color: message.includes('Erro') ? 'red' : 'green' }}>
          {message}
        </p>
      )}
    </section>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db, doc, getDoc, updateDoc, increment, setDoc, deleteDoc } from './firebase';
import { useAuth } from './hooks/useAuth';
import Header from './Header';
import './CifraDetalhe.css';

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const ENHARMONIC_MAP = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" };

function extractRoot(chord) {
  const match = chord.match(/^[A-G][#b]?/);
  return match ? match[0] : chord;
}

function transposeChord(chord, steps) {
  if (!chord) return chord;
  const root = extractRoot(chord);
  const suffix = chord.slice(root.length);
  const normalized = ENHARMONIC_MAP[root] || root;
  const index = NOTES.indexOf(normalized);
  if (index === -1) return chord;
  const newIndex = (index + steps + 12) % 12;
  const newRoot = NOTES[newIndex];
  return newRoot + suffix;
}

const highlightChords = (line, transposeSteps) => {
  const chordRegex = /\b([A-G][#b]?(?:m|maj|min|sus|dim|aug)?\d?(?:\/[A-G][#b]?)?)\b/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = chordRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: line.slice(lastIndex, match.index), isChord: false });
    }
    const originalChord = match[0];
    const transposed = transposeChord(originalChord, transposeSteps);
    parts.push({ text: transposed, isChord: true });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < line.length) {
    parts.push({ text: line.slice(lastIndex), isChord: false });
  }

  return parts;
};

const CifraDetalhe = ({ onDelete }) => {
  const { slugOrId } = useParams();
  const navigate = useNavigate();
  const { user, isMaster, loading: authLoading } = useAuth();

  const [cifra, setCifra] = useState(null);
  const [views, setViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [transposeSteps, setTransposeSteps] = useState(0);

  useEffect(() => {
    const fetchCifra = async () => {
      setLoading(true);
      setError('');
      try {
        const docRef = doc(db, 'cifras', slugOrId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError('Cifra não encontrada.');
          setLoading(false);
          return;
        }

        const data = docSnap.data();
        setCifra({ id: docSnap.id, ...data });
        setViews(data.views || 0);

        await updateDoc(docRef, { views: increment(1) });
        setViews(prev => prev + 1);

        if (user) {
          const favDocRef = doc(db, 'usuarios', user.uid, 'favorites', docSnap.id);
          const favSnap = await getDoc(favDocRef);
          setIsFavorite(favSnap.exists());
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
        await setDoc(favDocRef, { cifraId: cifra.id, favoritedAt: new Date().toISOString() });
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
      navigate('/home2');
    } catch (err) {
      alert('Erro ao deletar cifra: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleEditar = () => navigate('/edit-cifra/' + cifra.id);

  if (loading || authLoading) return (
    <>
      <Header />
      <main className="app-with-fixed-navbar">
        <p className="loading-message">Carregando...</p>
      </main>
    </>
  );

  if (error) return (
    <>
      <Header />
      <main className="app-with-fixed-navbar">
        <div className="cifra-container">
          <p>{error}</p>
          <Link to="/home2" className="back-link">← Voltar para Home</Link>
        </div>
      </main>
    </>
  );

  const cifraLines = (cifra?.cifra || '').split('\n');

  return (
    <>
      <Header />
      <main className="app-with-fixed-navbar">
        <div className="cifra-container">
          {/* Título */}
          <header className="cifra-header">
            <h2 className="cifra-title">{cifra.musica} <span className="cifra-artist">- {cifra.artista}</span></h2>
          </header>

          {/* Transposição */}
          <div className="transpose-row">
            <button onClick={() => setTransposeSteps(s => (s - 1 + NOTES.length) % NOTES.length)} className="transpose-btn">-</button>
            <span className="transpose-label">Tom</span>
            <button onClick={() => setTransposeSteps(s => (s + 1) % NOTES.length)} className="transpose-btn">+</button>
          </div>

          {/* Cifra */}
          <div className="cifra-text" role="article" aria-label={`Cifra de ${cifra.musica}`}>
            {cifraLines.map((line, idx) => (
              <div key={idx} className="cifra-line">
                {highlightChords(line, transposeSteps).map((part, i) => (
                  <span key={i} className={part.isChord ? 'part chord' : 'part lyric'}>
                    {part.text}
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* Footer dentro do container */}
          <div className="cifra-footer">
            <span className="views-label">👁 {views}</span>
            <Link to="/home2" className="back-link">← Voltar para Home</Link>
          </div>

          {/* Botões master centralizados */}
          {isMaster && (
            <div className="admin-buttons-bottom">
              <button onClick={handleEditar} className="edit-btn">Editar</button>
              <button onClick={handleDelete} disabled={deleting} className="delete-btn">
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default CifraDetalhe;
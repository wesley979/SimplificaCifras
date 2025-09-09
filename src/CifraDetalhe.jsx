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
import './CifraDetalhe.css'; // Importando o CSS separado

// -----------------------------
// Função utilitária para transpor acordes
// -----------------------------
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

// Função para envolver acordes em spans (letra não vira acorde)
const highlightChords = (line, transposeSteps) => {
  const chordRegex = /\b([A-G][#b]?m?(maj|min|sus|dim|aug)?\d?)\b/g;
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

  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 600);
  const [transposeSteps, setTransposeSteps] = useState(0);

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
      <div className="error-container">
        <p className="error-text">{error}</p>
        <Link to="/" className="back-link">
          Voltar para Home
        </Link>
      </div>
    );

  const cifraLines = (cifra?.cifra || '').split('\n');

  return (
    <section className="cifra-container">
      <h2 className="cifra-title">
        {cifra?.musica ?? 'Música não informada'} - {cifra?.artista ?? 'Artista não informado'}
      </h2>

      <div className="transpose-buttons">
        <button onClick={() => setTransposeSteps((s) => (s - 1 + NOTES.length) % NOTES.length)}>-</button>
        <span className="transpose-label">Tom</span>
        <button onClick={() => setTransposeSteps((s) => (s + 1) % NOTES.length)}>+</button>
      </div>

      <div className="cifra-content">
        {cifraLines.map((line, idx) => (
          <div key={idx} className="cifra-line">
            {highlightChords(line, transposeSteps).map((part, i) =>
              part.isChord ? (
                <span key={i} className="cifra-chord">{part.text}</span>
              ) : (
                <span key={i}>{part.text}</span>
              )
            )}
          </div>
        ))}
      </div>

      <div className="cifra-footer">
        {user && (
          <button
            onClick={toggleFavorite}
            className="favorite-button"
            style={{ backgroundColor: isFavorite ? '#4caf50' : '#4169e1' }}
          >
            {isFavorite ? '★ Favorito' : '☆ Favoritar'}
          </button>
        )}
        <div className="views-count">👁️ {views}</div>
      </div>

      {isMaster && (
        <div className="master-buttons">
          <button onClick={handleEditar}>Editar</button>
          <button onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      )}

      <Link to="/" className="back-link">← Voltar para Home</Link>
    </section>
  );
};

export default CifraDetalhe;

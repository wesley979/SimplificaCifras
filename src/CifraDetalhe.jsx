import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db, doc, getDoc, updateDoc, increment, setDoc, deleteDoc } from './firebase';
import { useAuth } from './hooks/useAuth';
import './CifraDetalhe.css';

// -----------------------------
// Função para transpor acordes
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
  const { slugOrId } = useParams(); // vamos usar ID
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

        // Atualiza visualizações
        await updateDoc(docRef, { views: increment(1) });
        setViews(prev => prev + 1);

        // Checa se é favorito
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
      navigate('/');
    } catch (err) {
      alert('Erro ao deletar cifra: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleEditar = () => navigate('/edit-cifra/' + cifra.id);

  if (loading || authLoading) return <p>Carregando...</p>;
  if (error) return <div><p>{error}</p><Link to="/">← Voltar para Home</Link></div>;

  const cifraLines = (cifra?.cifra || '').split('\n');

  return (
    <div className="cifra-container">
      <h2>{cifra.musica} - {cifra.artista}</h2>

      <div className="transpose-buttons">
        <button onClick={() => setTransposeSteps(s => (s - 1 + NOTES.length) % NOTES.length)}>-</button>
        <span>Tom</span>
        <button onClick={() => setTransposeSteps(s => (s + 1) % NOTES.length)}>+</button>
      </div>

      <div>
        {cifraLines.map((line, idx) => (
          <div key={idx}>
            {highlightChords(line, transposeSteps).map((part, i) =>
              <span key={i} style={{ fontWeight: part.isChord ? 'bold' : 'normal' }}>
                {part.text}
              </span>
            )}
          </div>
        ))}
      </div>

      {user && <button onClick={toggleFavorite}>{isFavorite ? '★ Favorito' : '☆ Favoritar'}</button>}

      {isMaster && (
        <div>
          <button onClick={handleEditar}>Editar</button>
          <button onClick={handleDelete} disabled={deleting}>{deleting ? 'Excluindo...' : 'Excluir'}</button>
        </div>
      )}

      <Link to="/">← Voltar para Home</Link>
    </div>
  );
};

export default CifraDetalhe;

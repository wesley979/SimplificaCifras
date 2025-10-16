import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  db, doc, getDoc, updateDoc, increment, setDoc, deleteDoc,
  collection, getDocs
} from './firebase';
import { useAuth } from './hooks/useAuth';
import Header from './Header';
import './CifraDetalhe.css';

// ================= Utils =================
const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const ENHARMONIC_MAP = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" };

function slugify(input = '') {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

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

// Regex para destacar acordes
const highlightChords = (line, transposeSteps) => {
  const chordRegex = /\b([A-G][#b]?(?:maj|min|m|dim|aug|sus|add)?\d*(?:\([^\)]*\))?(?:\/[A-G][#b]?)?)\b/g;
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

// ================= Component =================
const CifraDetalhe = ({ onDelete }) => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isMaster, loading: authLoading } = useAuth();

  const [cifra, setCifra] = useState(null);
  const [views, setViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [transposeSteps, setTransposeSteps] = useState(0);

  // Busca por slug (novo) ou por ID (antigo) com redirect para URL bonita
  useEffect(() => {
    const fetchCifra = async () => {
      setLoading(true);
      setError('');
      
      try {
        let loaded = null; // { id, ...data }

        const isOldRoute = location.pathname.startsWith('/cifras/detalhe/');
        const isNewRoute = params.artistSlug && params.musicSlug;

        if (isNewRoute) {
          // NOVO: /cifras/:artistSlug/:musicSlug
          const { artistSlug, musicSlug } = params;

          // 1) Ler todos os docs (poderíamos otimizar mantendo slug no banco)
          const snap = await getDocs(collection(db, 'cifras'));

          // 2) Filtrar localmente por slug de artista e música
          const matches = [];
          snap.forEach(docSnap => {
            const d = docSnap.data();
            const a = slugify(d.artista || d.artistName || '');
            const m = slugify(d.musica  || d.titulo     || d.title || '');
            if (a === artistSlug && m === musicSlug) {
              matches.push({ id: docSnap.id, ...d });
            }
          });

          if (matches.length === 0) {
            setError('Cifra não encontrada.');
            setLoading(false);
            return;
          }

          loaded = matches[0];

        } else if (isOldRoute && params.slugOrId) {
          // ANTIGO: /cifras/detalhe/:id
          const docRef = doc(db, 'cifras', params.slugOrId);
          const snap = await getDoc(docRef);

          if (!snap.exists()) {
            setError('Cifra não encontrada.');
            setLoading(false);
            return;
          }

          const data = snap.data();
          loaded = { id: snap.id, ...data };

          // Redirecionar para a URL bonita se houver dados suficientes
          const artistSlug = slugify(data.artista || data.artistName || '');
          const musicSlug  = slugify(data.musica  || data.titulo     || data.title || '');
          if (artistSlug && musicSlug) {
            navigate(`/cifras/${artistSlug}/${musicSlug}`, { replace: true });
            return; // interrompe: o redirect carregará de novo
          }
        } else {
          setError('Rota inválida.');
          setLoading(false);
          return;
        }

        // Carregar dados da cifra
        setCifra(loaded);
        setViews(loaded.views || 0);

        // Incrementa views de forma assíncrona
        try {
          await updateDoc(doc(db, 'cifras', loaded.id), { views: increment(1) });
          setViews(prev => prev + 1);
        } catch (_) {
          // ignora erro de update
        }

        // Favoritos
        if (user) {
          const favDocRef = doc(db, 'usuarios', user.uid, 'favorites', loaded.id);
          const favSnap = await getDoc(favDocRef);
          setIsFavorite(favSnap.exists());
        }

      } catch (err) {
        console.error('Erro ao buscar cifra:', err);
        setError('Erro ao buscar cifra: ' + (err?.message || ''));
      } finally {
        setLoading(false);
      }
    };

    fetchCifra();
  }, [params.slugOrId, params.artistSlug, params.musicSlug, location.pathname, user, navigate]);

  // SEO: document.title e canonical
  useEffect(() => {
    if (cifra?.musica && cifra?.artista) {
      document.title = `${cifra.musica} - ${cifra.artista} | Simplifica Cifras`;

      // Atualiza/insere link rel="canonical"
      const artistSlug = slugify(cifra.artista);
      const musicSlug = slugify(cifra.musica);
      const canonicalHref = `${window.location.origin}/cifras/${artistSlug}/${musicSlug}`;

      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonicalHref);
    }
  }, [cifra?.musica, cifra?.artista]);

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
      console.error('Erro ao atualizar favoritos:', err?.message || err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir esta cifra?')) return;
    setDeleting(true);
    try {
      await onDelete(cifra.id);
      navigate('/home2');
    } catch (err) {
      alert('Erro ao deletar cifra: ' + (err?.message || ''));
    } finally {
      setDeleting(false);
    }
  };

  const handleEditar = () => navigate('/edit-cifra/' + cifra.id);

  if (loading || authLoading) {
    return (
      <>
        <Header />
        <main className="app-with-fixed-navbar">
          <p className="loading-message" aria-live="polite">Carregando...</p>
        </main>
      </>
    );
  }

  if (error) {
    return (
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
  }

  if (!cifra) {
    return (
      <>
        <Header />
        <main className="app-with-fixed-navbar">
          <div className="cifra-container">
            <p>Cifra não encontrada.</p>
            <Link to="/home2" className="back-link">← Voltar para Home</Link>
          </div>
        </main>
      </>
    );
  }

  const cifraLines = (cifra.cifra || '').split('\n');

  return (
    <>
      <Header />
      <main className="app-with-fixed-navbar">
        <div className="cifra-container">
          {/* Título */}
          <header className="cifra-header">
            <h2 className="cifra-title">
              {cifra.musica} <span className="cifra-artist">- {cifra.artista}</span>
            </h2>
          </header>

          {/* Transposição */}
          <div className="transpose-row" role="group" aria-label="Transposição de tom">
            <button
              onClick={() => setTransposeSteps(s => (s - 1 + NOTES.length) % NOTES.length)}
              className="transpose-btn"
              aria-label="Diminuir tom"
            >
              -
            </button>
            <span className="transpose-label" aria-live="polite">Tom</span>
            <button
              onClick={() => setTransposeSteps(s => (s + 1) % NOTES.length)}
              className="transpose-btn"
              aria-label="Aumentar tom"
            >
              +
            </button>
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

          {/* Footer */}
          <div className="cifra-footer">
            <button
              type="button"
              onClick={toggleFavorite}
              className="back-link"
              aria-pressed={isFavorite}
              aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              {isFavorite ? '★ Favorita' : '☆ Favoritar'}
            </button>
            <span className="views-label" aria-label={`Visualizações: ${views}`}>👁 {views}</span>
            <Link to="/home2" className="back-link">← Voltar para Home</Link>
          </div>

          {/* Botões master */}
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
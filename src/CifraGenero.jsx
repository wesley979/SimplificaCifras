import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import './CifraGenero.css';

// ---------- Util: slugify ----------
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

// ---------- Monta URL bonita com fallback ----------
function buildPrettyPath(cifra) {
  const artist = cifra.artista || cifra.artistName || '';
  const title = cifra.musica || cifra.titulo || cifra.title || '';

  const artistSlug = slugify(artist);
  const musicSlug = slugify(title);

  if (artistSlug && musicSlug) {
    return `/cifras/${artistSlug}/${musicSlug}`;
  }
  // Fallback para legado por ID se faltar algum campo
  return `/cifras/detalhe/${cifra.id}`;
}

export default function CifraGenero() {
  const { genero } = useParams();
  const navigate = useNavigate();

  const [cifras, setCifras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCifras() {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'cifras'));
      const list = [];
      querySnapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));

      // filtra apenas o gênero da URL
      const filtered = list.filter(
        (song) => (song.genero || '').toLowerCase() === (genero || '').toLowerCase()
      );
      setCifras(filtered);
      setLoading(false);
    }

    fetchCifras();
  }, [genero]);

  const handleClickCifra = (cifra) => {
    navigate(buildPrettyPath(cifra));
  };

  if (loading)
    return <p className="loading-text">Carregando músicas do gênero "{genero}"...</p>;

  return (
    <div className="cifras-genero">
      {/* Botão de voltar */}
      <button className="back-btn" onClick={() => navigate('/home2')}>
        ← Voltar para Home
      </button>

      <h2>{genero}</h2>
      {cifras.length === 0 ? (
        <p className="no-cifras">Nenhuma música encontrada neste gênero.</p>
      ) : (
        <div className="cifras-list">
          {cifras.map((cifra) => {
            const to = buildPrettyPath(cifra);
            return (
              <div
                key={cifra.id}
                className="cifra-card"
                onClick={() => handleClickCifra(cifra)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' ? handleClickCifra(cifra) : null)}
              >
                <h4>{cifra.musica}</h4>
                <p>{cifra.artista}</p>
                {/* Se preferir Link ao invés de onClick no card:
                <Link to={to} className="cifra-link" onClick={(e) => e.stopPropagation()}>
                  Abrir
                </Link>
                */}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
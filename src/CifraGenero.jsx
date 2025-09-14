import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import './CifraGenero.css';

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
        (song) => (song.genero || '').toLowerCase() === genero.toLowerCase()
      );
      setCifras(filtered);
      setLoading(false);
    }

    fetchCifras();
  }, [genero]);

  const handleClickCifra = (id) => {
    navigate(`/cifras/detalhe/${id}`);
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
          {cifras.map((cifra) => (
            <div
              key={cifra.id}
              className="cifra-card"
              onClick={() => handleClickCifra(cifra.id)}
            >
              <h4>{cifra.musica}</h4>
              <p>{cifra.artista}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

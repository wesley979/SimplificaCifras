import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

export default function Home({ cifras }) {
  const { user } = useAuth();

  if (!cifras) return <p>Carregando cifras...</p>;
  if (cifras.length === 0) return <p>Nenhuma cifra encontrada.</p>;

  return (
    <section className="latest-chords" style={{ padding: '1rem' }}>
      <h2>Últimas Cifras</h2>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {cifras.map((cifra) => (
          <li key={cifra.id} style={{ marginBottom: '0.7rem' }}>
            <Link
              to={`/cifras/${cifra.id}`}
              style={{
                textDecoration: 'none',
                color: '#007acc',
                fontWeight: 'bold',
                fontSize: '1.1rem',
              }}
            >
              {cifra.musica || cifra.nome} - {cifra.artista || 'Artista desconhecido'}
            </Link>
          </li>
        ))}
      </ul>
      {!user && (
        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#555' }}>
          Faça login para mais funcionalidades, em breve.
        </p>
      )}
    </section>
  );
}

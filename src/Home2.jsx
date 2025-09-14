import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import './Home2.css';

export default function Home2() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [queryText, setQueryText] = useState('');
  const [results, setResults] = useState([]);
  const [genres, setGenres] = useState([]);

  const [stats, setStats] = useState([
    { title: 'Cifras Disponíveis', value: '12.847', desc: 'E crescendo todos os dias' },
    { title: 'Usuários Ativos', value: '89.234', desc: 'Músicos de todo o Brasil' },
    { title: 'Cifras Tocadas', value: '2.1M', desc: 'No último mês' },
    { title: 'Avaliação', value: '4.8★', desc: 'Nas lojas de aplicativos' },
  ]);

  const masterEmails = ['lais@gmail.com'];
  const isMaster = user && masterEmails.includes(user.email);

  useEffect(() => {
    async function fetchSongs() {
      const querySnapshot = await getDocs(collection(db, 'cifras'));
      const list = [];
      querySnapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));

      if (queryText) {
        const filtered = list.filter((song) =>
          song.musica.toLowerCase().includes(queryText.toLowerCase())
        );
        setResults(filtered);
      } else {
        setResults([]);
      }

      const genreMap = {};
      list.forEach((song) => {
        const genre = song.genero || 'Outro';
        genreMap[genre] = (genreMap[genre] || 0) + 1;
      });

      const genresArray = Object.keys(genreMap).map((name) => ({
        name,
        count: genreMap[name],
      }));

      setGenres(genresArray);
    }

    fetchSongs();
  }, [queryText]);

  // ✅ Logout com delay de 300ms
const handleLogout = async () => {
  await logout();
  window.location.href = '/home2'; // força refresh da página inteira
};


  const handleClickSong = (id) => {
    navigate(`/cifras/detalhe/${id}`);
  };

  const handleClickGenre = (genre) => {
    navigate(`/genero/${encodeURIComponent(genre)}`);
  };

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="home2">
      {/* Header */}
      <header className="home2-header">
        <div className="header-left">
          <div className="logo">🎵</div>
          <div className="title">SimplificaCifras</div>
        </div>

        {/* Desktop menu */}
        <div className="header-right">
          {user ? (
            <div className="user-info">
              <span>Olá, {user.displayName || user.email}{isMaster ? ' (Master)' : ''}</span>
              <Link to="/favoritos" className="favorites-btn">Favoritos</Link>
              {isMaster && <Link to="/add-cifra" className="add-cifra-btn">Add Cifra</Link>}
              <button onClick={handleLogout} className="logout-btn">Sair</button>
            </div>
          ) : (
            <Link to="/login" className="login-btn">Login</Link>
          )}
        </div>

        {/* Mobile menu */}
        <div className="mobile-menu">
          <button onClick={() => setMenuOpen(!menuOpen)} className="hamburger-btn">
            ☰
          </button>
          {menuOpen && (
            <div className="mobile-menu-items">
              {user ? (
                <>
                  <span>Olá, {user.displayName || user.email}{isMaster ? ' (Master)' : ''}</span>
                  <Link to="/favoritos" className="favorites-btn">Favoritos</Link>
                  {isMaster && <Link to="/add-cifra" className="add-cifra-btn">Add Cifra</Link>}
                  <button onClick={handleLogout} className="logout-btn">Sair</button>
                </>
              ) : (
                <Link to="/login" className="login-btn">Login</Link>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <h2>
          Sua música, <span>nossa paixão</span>
        </h2>
        <p>Descubra, aprenda e toque suas músicas favoritas</p>

        <div className="search-box">
          <input
            type="text"
            placeholder="Busque por música, artista ou banda..."
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
          />
        </div>
      </section>

      {/* Resultado da busca ou gêneros */}
      {queryText && results.length > 0 ? (
        <section className="results">
          <h3>Resultados da busca</h3>
          <div className="results-grid">
            {results.map((song) => (
              <div
                key={song.id}
                className="song-card"
                onClick={() => handleClickSong(song.id)}
              >
                <h4>{song.musica}</h4>
                <p>{song.artista}</p>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="genres">
          <h3>Explore por Categoria</h3>
          <div className="genres-grid">
            {genres.map((genre) => (
              <div
                key={genre.name}
                className="genre-card"
                onClick={() => handleClickGenre(genre.name)}
              >
                <h4>{genre.name}</h4>
                <p>{genre.count} músicas</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Estatísticas */}
      <section className="stats">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="value">{stat.value}</div>
            <h4>{stat.title}</h4>
            <p>{stat.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

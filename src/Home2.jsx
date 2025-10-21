import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import './Home2.css';

// ✅ Helper centralizado para gerar o path da cifra
function getCifraPath(cifra) {
  // Se houver slug no formato "musica/artista", inverte para "/cifras/artista/musica"
  if (cifra.slug && cifra.slug.includes('/')) {
    const [musicSlug, artistSlug] = cifra.slug.split('/');
    if (musicSlug && artistSlug) {
      return `/cifras/${artistSlug}/${musicSlug}`;
    }
  }
  // Fallback: se não houver slug válido, usa a rota antiga por ID
  return `/cifras/detalhe/${cifra.id}`;
}

// ✅ Rodapé com paleta preto/roxo e CSS inline
function Footer() {
  const linkStyle = {
    color: '#C6B6FF',           // roxo claro para boa leitura no fundo escuro
    textDecoration: 'none',
    padding: '6px 10px',
    borderRadius: 6,
    transition: 'all .2s ease',
  };
  const linkHover = { background: '#2b2447' }; // roxo bem escuro no hover

  return (
    <footer
      style={{
        marginTop: 48,
        padding: '24px 16px',
        background: 'linear-gradient(180deg, #0f0d17 0%, #141024 100%)', // preto/roxo escuro
        borderTop: '1px solid #221b3a',
        color: '#e8e6ff',
      }}
    >
      <nav
        aria-label="Links institucionais"
        style={{
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          fontSize: 14,
        }}
      >
        <Link
          to="/privacidade"
          style={linkStyle}
          onMouseEnter={e => Object.assign(e.currentTarget.style, linkHover)}
          onMouseLeave={e => Object.assign(e.currentTarget.style, linkStyle)}
        >
          Política de Privacidade
        </Link>
        <span aria-hidden="true" style={{ color: '#6d5fb6' }}>|</span>
        <Link
          to="/termos"
          style={linkStyle}
          onMouseEnter={e => Object.assign(e.currentTarget.style, linkHover)}
          onMouseLeave={e => Object.assign(e.currentTarget.style, linkStyle)}
        >
          Termos de Uso
        </Link>
        <span aria-hidden="true" style={{ color: '#6d5fb6' }}>|</span>
        <Link
          to="/contato"
          style={linkStyle}
          onMouseEnter={e => Object.assign(e.currentTarget.style, linkHover)}
          onMouseLeave={e => Object.assign(e.currentTarget.style, linkStyle)}
        >
          Contato
        </Link>
      </nav>

      <div
        style={{
          marginTop: 10,
          textAlign: 'center',
          color: '#a89de0',
          fontSize: 12,
        }}
      >
        © {new Date().getFullYear()} Simplifica Cifras · Todos os direitos reservados
      </div>
    </footer>
  );
}

export default function Home2() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [queryText, setQueryText] = useState('');
  const [results, setResults] = useState([]);
  const [genres, setGenres] = useState([]);
  const [latestSongs, setLatestSongs] = useState([]);

  const [stats, setStats] = useState([
    { title: 'Cifras Disponíveis', value: '58', desc: 'E crescendo todos os dias' },
    { title: 'Usuários Ativos', value: '1600', desc: 'Músicos de todo o Brasil' },
    { title: 'Cifras Tocadas', value: '1000', desc: 'No último mês' },
  ]);

  const masterEmails = ['lais@gmail.com'];
  const isMaster = user && masterEmails.includes(user.email);

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchSongs() {
      const querySnapshot = await getDocs(collection(db, 'cifras'));
      const list = [];
      querySnapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));

      // 🔹 Últimas 10 cifras
      const sortedByDate = [...list]
        .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))
        .slice(0, 10);
      setLatestSongs(sortedByDate);

      // 🔹 Busca
      if (queryText) {
        const filtered = list.filter((song) =>
          song.musica.toLowerCase().includes(queryText.toLowerCase())
        );
        setResults(filtered);
      } else {
        setResults([]);
      }

      // 🔹 Gêneros
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

  // ✅ Atualizado para usar o helper getCifraPath
  const handleClickSong = (cifra) => {
    navigate(getCifraPath(cifra));
  };

  const handleClickGenre = (genre) => {
    navigate(`/genero/${encodeURIComponent(genre)}`);
  };

  return (
    <div className="home2">
      {/* Header */}
      <header className="home2-header">
        <div className="header-left">
          <div className="logo"></div>
          <div className="title">Simplifica Cifras</div>
        </div>

        {/* Desktop menu */}
        <div className="header-right">
          {user ? (
            <div className="user-info">
              <span>
                Olá, {user.displayName || user.email}
                {isMaster ? ' (Master)' : ''}
              </span>
              <Link to="/favoritos" className="favorites-btn">
                Favoritos
              </Link>
              {isMaster && (
                <Link to="/add-cifra" className="add-cifra-btn">
                  Add Cifra
                </Link>
              )}
              <button onClick={handleLogout} className="logout-btn">
                Sair
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              Login
            </Link>
          )}
        </div>

        {/* Mobile menu */}
        <div className="mobile-menu">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="hamburger-btn"
          >
            ☰
          </button>
          {menuOpen && (
            <div className="mobile-menu-items">
              {user ? (
                <>
                  <span>
                    Olá, {user.displayName || user.email}
                    {isMaster ? ' (Master)' : ''}
                  </span>
                  <Link to="/favoritos" className="favorites-btn">
                    Favoritos
                  </Link>
                  {isMaster && (
                    <Link to="/add-cifra" className="add-cifra-btn">
                      Add Cifra
                    </Link>
                  )}
                  <button onClick={handleLogout} className="logout-btn">
                    Sair
                  </button>
                </>
              ) : (
                <Link to="/login" className="login-btn">
                  Login
                </Link>
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
        <p>Descubra e toque suas músicas favoritas</p>

        <div className="search-box">
          <input
            type="text"
            placeholder="Busque por música, artista ou banda..."
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
          />
        </div>
      </section>

      {/* Últimas cifras */}
      {!queryText && latestSongs.length > 0 && (
        <section className="results">
          <h3>Últimas cifras</h3>
          <div className="results-grid">
            {latestSongs.map((song) => (
              <div
                key={song.id}
                className="song-card"
                onClick={() => handleClickSong(song)}
              >
                <h4>{song.musica}</h4>
                <p>{song.artista}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Resultados da busca */}
      {queryText && results.length > 0 && (
        <section className="results">
          <h3>Resultados da busca</h3>
          <div className="results-grid">
            {results.map((song) => (
              <div
                key={song.id}
                className="song-card"
                onClick={() => handleClickSong(song)}
              >
                <h4>{song.musica}</h4>
                <p>{song.artista}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gêneros */}
      {!queryText && genres.length > 0 && (
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

      {/* ✅ Rodapé novo, sem mexer no restante da página */}
      <Footer />
    </div>
  );
}
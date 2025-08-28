import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import './Header.css';

const Header = () => {
  const { user, isMaster, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [animateKey, setAnimateKey] = useState(0);

  useEffect(() => {
    // reinicia a animação sempre que a rota mudar
    setAnimateKey(prev => prev + 1);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao deslogar:', error);
    }
  };

  return (
    <header
      style={{
        backgroundColor: '#444',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      }}
    >
      {/* Título e links do lado esquerdo */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" className="site-title" key={animateKey}>
          Simplifica Cifras
        </Link>

        {user && (
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginLeft: '1.5rem',
            }}
          >
            <span style={{ marginRight: '1.5rem' }}>
              Olá, {user.displayName || user.email}
            </span>

            <Link
              to="/favoritos"
              style={{
                color: 'white',
                marginRight: '1.5rem',
                textDecoration: 'none',
                border: '1px solid white',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Favoritos
            </Link>

            {isMaster && (
              <>
                <span
                  style={{
                    marginRight: '1.5rem',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#4caf50',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                  }}
                >
                  MASTER
                </span>
                <Link
                  to="/add-cifra"
                  style={{
                    color: 'white',
                    marginRight: '1.5rem',
                    textDecoration: 'none',
                    border: '1px solid white',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Adicionar Cifra
                </Link>
              </>
            )}
          </nav>
        )}
      </div>

      {/* Botão Login/Sair no lado direito */}
      <div>
        {user ? (
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Sair
          </button>
        ) : (
          <Link
            to="/login"
            style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '1rem',
              border: '1px solid white',
              padding: '0.4rem 0.8rem',
              borderRadius: '4px',
              transition: '0.3s',
            }}
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;

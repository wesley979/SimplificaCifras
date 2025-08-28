import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import './Header.css';

const Header = () => {
  const { user, isMaster, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [animateKey, setAnimateKey] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  useEffect(() => {
    setAnimateKey(prev => prev + 1);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao deslogar:', error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);

    // Fecha automaticamente após 5 segundos
    if (!mobileMenuOpen) {
      setTimeout(() => setMobileMenuOpen(false), 5000);
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
        position: 'relative',
      }}
    >
      {/* Container do título e botão hambúrguer */}
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
        {/* Título */}
        <Link
          to="/"
          className="site-title"
          key={animateKey}
          style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
        >
          Simplifica Cifras
        </Link>

        {/* Botão Hambúrguer (aparece apenas no mobile) */}
        {isMobile && (
          <button
            onClick={toggleMobileMenu}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '1.8rem',
              cursor: 'pointer',
            }}
          >
            ☰
          </button>
        )}
      </div>

      {/* Links e botões */}
      {(!isMobile || mobileMenuOpen) && (
        <nav
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            marginTop: isMobile ? '1rem' : 0,
            width: isMobile ? '100%' : 'auto',
          }}
        >
          {user && (
            <>
              <span
                style={{
                  marginRight: isMobile ? 0 : '1.5rem',
                  marginBottom: isMobile ? '0.5rem' : 0,
                }}
              >
                Olá, {user.displayName || user.email}
              </span>

              <Link
                to="/favoritos"
                style={{
                  color: 'white',
                  marginRight: isMobile ? 0 : '1.5rem',
                  marginBottom: isMobile ? '0.5rem' : 0,
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
                      marginRight: isMobile ? 0 : '1.5rem',
                      marginBottom: isMobile ? '0.5rem' : 0,
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
                      marginRight: isMobile ? 0 : '1.5rem',
                      marginBottom: isMobile ? '0.5rem' : 0,
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
            </>
          )}

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
                marginTop: isMobile ? '0.5rem' : 0,
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
                marginTop: isMobile ? '0.5rem' : 0,
              }}
            >
              Login
            </Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;

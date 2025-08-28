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
      {/* Título */}
      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <Link
          to="/"
          className="site-title"
          key={animateKey}
          style={{ fontSize: '1.5rem', fontWeight: 'bold', flexShrink: 0 }}
        >
          Simplifica Cifras
        </Link>
      </div>

      {/* Desktop navigation */}
      {!isMobile && (
        <nav style={{ display: 'flex', alignItems: 'center' }}>
          {user ? (
            <>
              <span style={{ marginRight: '1.5rem' }}>Olá, {user.displayName || user.email}</span>
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
            </>
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
        </nav>
      )}

      {/* Mobile hamburger */}
      {isMobile && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={toggleMobileMenu}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '1.8rem',
              cursor: 'pointer',
              marginLeft: '1rem',
            }}
          >
            ☰
          </button>

          <nav
            style={{
              position: 'absolute',
              top: mobileMenuOpen ? '100%' : '-500px',
              right: 0,
              width: '100%',
              backgroundColor: '#444',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '1rem',
              zIndex: 1000,
              transition: 'top 0.3s ease-in-out',
            }}
          >
            {mobileMenuOpen && (
              <>
                {user && (
                  <>
                    <span style={{ marginBottom: '0.5rem' }}>Olá, {user.displayName || user.email}</span>
                    <Link
                      to="/favoritos"
                      style={{
                        color: 'white',
                        marginBottom: '0.5rem',
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
                            marginBottom: '0.5rem',
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
                            marginBottom: '0.5rem',
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
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

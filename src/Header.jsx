import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import './Header.css';

const Header = () => {
  const { user, isMaster, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [animateKey, setAnimateKey] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Usa matchMedia para determinar mobile de forma robusta
  const mq = typeof window !== 'undefined'
    ? window.matchMedia('(max-width: 820px)')
    : { matches: false, addEventListener: () => {}, removeEventListener: () => {} };

  const [isMobile, setIsMobile] = useState(mq.matches);

  const menuRef = useRef(null);

  useEffect(() => {
    setAnimateKey(prev => prev + 1);
    // fecha menu ao navegar
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => setIsMobile(e.matches);
    // Compatibilidade com navegadores antigos
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
    } else if (mq.addListener) {
      mq.addListener(handler);
    }
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', handler);
      } else if (mq.removeListener) {
        mq.removeListener(handler);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fecha dropdown ao clicar fora
  useEffect(() => {
    const onClickOutside = (e) => {
      if (mobileMenuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao deslogar:', error);
    }
  };

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

  const renderUserGreeting = () => {
    if (loading || !user) return null;
    const name = user.displayName || user.email || 'Usuário';
    return <span className="user-name">Olá, {name}</span>;
  };

  return (
    <header className="navbar">
      <div className="nav-inner">
        {/* Marca - esquerda (sem ícone musical) */}
        <Link to="/home2" className="brand" key={animateKey} aria-label="Ir para home">
          <span className="brand-name">Simplifica Cifras</span>
        </Link>

        {/* Ações desktop - direita */}
        {!isMobile && (
          <nav className="nav-actions right-actions" aria-label="Navegação principal">
            {user ? (
              <>
                <div className="user-area">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Avatar"
                      className="user-avatar"
                      width={24}
                      height={24}
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                  {renderUserGreeting()}
                </div>
                <Link to="/favoritos" className="nav-link">Favoritos</Link>
                {isMaster && <Link to="/add-cifra" className="nav-button primary">Adicionar Cifra</Link>}
                <button className="nav-button" onClick={handleLogout}>Sair</button>
              </>
            ) : (
              <Link to="/login" className="nav-button primary">Login</Link>
            )}
          </nav>
        )}

        {/* Mobile: hambúrguer */}
        {isMobile && (
          <div className="mobile-area" ref={menuRef}>
            <button
              className="menu-toggle"
              aria-label="Abrir menu"
              aria-expanded={mobileMenuOpen}
              onClick={toggleMobileMenu}
            >
              ☰
            </button>
            <div className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`} role="menu">
              {user ? (
                <>
                  <div className="user-area" style={{ padding: '6px 10px' }}>
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Avatar"
                        className="user-avatar"
                        width={24}
                        height={24}
                        referrerPolicy="no-referrer"
                      />
                    ) : null}
                    {renderUserGreeting()}
                  </div>
                  <Link to="/favoritos" className="nav-menu-item" onClick={() => setMobileMenuOpen(false)}>
                    Favoritos
                  </Link>
                  {isMaster && (
                    <Link to="/add-cifra" className="nav-menu-item" onClick={() => setMobileMenuOpen(false)}>
                      Adicionar Cifra
                    </Link>
                  )}
                  <button
                    className="nav-menu-item"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sair
                  </button>
                </>
              ) : (
                <Link to="/login" className="nav-menu-item" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
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
    <header className="header">
      {/* Título */}
      <Link to="/" className="site-title" key={animateKey}>
        Simplifica Cifras
      </Link>

      {/* Desktop navigation */}
      {!isMobile && (
        <nav className="desktop-nav">
          {user ? (
            <>
              <span className="user-greeting">Olá, {user.displayName || user.email}</span>
              <Link to="/favoritos" className="nav-button">Favoritos</Link>
              {isMaster && <Link to="/add-cifra" className="nav-button">Adicionar Cifra</Link>}
              <button className="logout-button" onClick={handleLogout}>Sair</button>
            </>
          ) : (
            <Link to="/login" className="nav-button">Login</Link>
          )}
        </nav>
      )}

      {/* Mobile hamburger */}
      {isMobile && (
        <div className="mobile-menu-container">
          <button className="hamburger" onClick={toggleMobileMenu}>☰</button>
          <nav className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
            {user ? (
              <>
                <span className="user-greeting">Olá, {user.displayName || user.email}</span>
                <Link to="/favoritos" className="nav-button">Favoritos</Link>
                {isMaster && <Link to="/add-cifra" className="nav-button">Adicionar Cifra</Link>}
                <button className="logout-button" onClick={handleLogout}>Sair</button>
              </>
            ) : (
              <Link to="/login" className="nav-button">Login</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

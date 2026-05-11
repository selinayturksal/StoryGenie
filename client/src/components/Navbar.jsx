import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, lang, switchLang } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="url(#lg)"/>
              <text x="14" y="20" textAnchor="middle" fontSize="16">📖</text>
              <defs>
                <linearGradient id="lg" x1="0" y1="0" x2="28" y2="28">
                  <stop offset="0%" stopColor="#9b59b6"/>
                  <stop offset="100%" stopColor="#00c9a7"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="logo-text">StoryNest</span>
        </Link>

        {/* Desktop nav links */}
        {user && (
          <div className="navbar-links">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              {t.nav.today}
            </Link>
            <Link to="/explore" className={`nav-link ${isActive('/explore') ? 'active' : ''}`}>
              {t.nav.explore}
            </Link>
            <Link to="/my-stories" className={`nav-link ${isActive('/my-stories') ? 'active' : ''}`}>
              {t.nav.myStories}
            </Link>
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
              {t.nav.dashboard}
            </Link>
          </div>
        )}

        {/* Right side */}
        <div className="navbar-right">

          {/* Dil seçici — bayrak yok, sadece metin */}
          <div className="lang-switcher">
            <button
              className={`lang-btn ${lang === 'tr' ? 'active' : ''}`}
              onClick={() => switchLang('tr')}
            >TR</button>
            <button
              className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => switchLang('en')}
            >EN</button>
          </div>

          {user ? (
            <div className="user-menu">
              <button className="user-avatar-btn" onClick={() => setMenuOpen(!menuOpen)}>
                <span className="user-avatar">
                  {user.username?.[0]?.toUpperCase() || '?'}
                </span>
                <span className="user-name hide-mobile">{user.username}</span>
                <svg className="chevron-icon" width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path d={menuOpen ? 'M9 5L5 1L1 5' : 'M1 1L5 5L9 1'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
              {menuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <strong>{user.username}</strong>
                    <small>{user.email}</small>
                  </div>
                  <hr />
                  <button onClick={handleLogout} className="dropdown-item logout">
                    {t.nav.logout}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-outline btn-sm">{t.nav.login}</Link>
              <Link to="/register" className="btn btn-primary btn-sm">{t.nav.register}</Link>
            </div>
          )}

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      {menuOpen && user && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>{t.nav.today}</Link>
          <Link to="/explore" onClick={() => setMenuOpen(false)}>{t.nav.explore}</Link>
          <Link to="/my-stories" onClick={() => setMenuOpen(false)}>{t.nav.myStories}</Link>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)}>{t.nav.dashboard}</Link>
          <hr className="mobile-divider" />
          <button onClick={handleLogout} className="mobile-logout">{t.nav.logout}</button>
        </div>
      )}
    </nav>
  );
}

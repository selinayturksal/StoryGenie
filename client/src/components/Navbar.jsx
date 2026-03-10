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
          <span className="logo-icon">📚</span>
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
          {/* Language switcher */}
          <div className="lang-switcher">
            <button
              className={`lang-btn ${lang === 'tr' ? 'active' : ''}`}
              onClick={() => switchLang('tr')}
            >🇹🇷 TR</button>
            <button
              className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => switchLang('en')}
            >🇬🇧 EN</button>
          </div>

          {/* Auth buttons */}
          {user ? (
            <div className="user-menu">
              <button className="user-avatar-btn" onClick={() => setMenuOpen(!menuOpen)}>
                <span className="user-avatar">
                  {user.username?.[0]?.toUpperCase() || '?'}
                </span>
                <span className="user-name hide-mobile">{user.username}</span>
                <span className="chevron">{menuOpen ? '▲' : '▼'}</span>
              </button>
              {menuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <strong>{user.username}</strong>
                    <small>{user.email}</small>
                  </div>
                  <hr />
                  <button onClick={handleLogout} className="dropdown-item logout">
                    🚪 {t.nav.logout}
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

          {/* Mobile hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && user && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>{t.nav.today}</Link>
          <Link to="/explore" onClick={() => setMenuOpen(false)}>{t.nav.explore}</Link>
          <Link to="/my-stories" onClick={() => setMenuOpen(false)}>{t.nav.myStories}</Link>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)}>{t.nav.dashboard}</Link>
          <button onClick={handleLogout} className="mobile-logout">🚪 {t.nav.logout}</button>
        </div>
      )}
    </nav>
  );
}

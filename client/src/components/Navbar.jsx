import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, lang, switchLang } = useLang();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const isActive = (path) => location.pathname === path;

  const scrollToSection = (id) => {
    setMenuOpen(false);
    setDropdownOpen(false);
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">

        {/* Marka logosu */}
        <Link to="/" className="navbar-logo">
          <img src="/assets/landing/logo.png" alt="Masalmatik" className="logo-img" />
        </Link>

        {/* Orta linkler */}
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/"            className={`nav-link ${isActive('/') ? 'active' : ''}`}>{lang === 'tr' ? 'Hikaye Oluştur' : 'Create Story'}</Link>
              <Link to="/explore"     className={`nav-link ${isActive('/explore') ? 'active' : ''}`}>{lang === 'tr' ? 'Paylaşılan Hikayeler' : 'Shared Stories'}</Link>
              <Link to="/my-stories"  className={`nav-link ${isActive('/my-stories') ? 'active' : ''}`}>{t.nav.myStories}</Link>

            </>
          ) : (
            <>
              <button onClick={() => scrollToSection('anasayfa')}    className="nav-link">{lang === 'tr' ? 'Anasayfa' : 'Home'}</button>
              <button onClick={() => scrollToSection('ozellikler')}  className="nav-link">{lang === 'tr' ? 'Özellikler' : 'Features'}</button>
              <button onClick={() => scrollToSection('nasil-calisir')} className="nav-link">{lang === 'tr' ? 'Nasıl Çalışır?' : 'How It Works'}</button>
              <button onClick={() => scrollToSection('ornek')}       className="nav-link">{lang === 'tr' ? 'Örnek Hikaye' : 'Example'}</button>
              <button onClick={() => scrollToSection('iletisim')} className="nav-link">{lang === 'tr' ? 'İletişim' : 'Contact'}</button>
            </>
          )}
        </div>

        {/* Sağ */}
        <div className="navbar-right">

          {/* Karanlık/aydınlık tema geçişi */}
          <div className="theme-switcher">
            <button className={`theme-btn ${dark ? 'active' : ''}`} onClick={() => setDark(true)}>🌙</button>
            <button className={`theme-btn ${!dark ? 'active' : ''}`} onClick={() => setDark(false)}>☀️</button>
          </div>

          {/* Dil */}
          <div className="lang-switcher">
            <button className={`lang-btn ${lang === 'tr' ? 'active' : ''}`} onClick={() => switchLang('tr')}>TR</button>
            <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => switchLang('en')}>EN</button>
          </div>

          {user ? (
            <div className="user-menu">
              <button className="user-avatar-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <span className="user-avatar" style={{ background: user.avatarBg || localStorage.getItem('avatarBg') || 'rgb(10,15,60)' }}>
                  {user.avatar?.startsWith('/')
                    ? <img src={user.avatar} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} />
                    : (user.avatar || user.username?.[0]?.toUpperCase() || '?')}
                </span>
                <span className="user-name hide-mobile">{user.username}</span>
                <svg className="chevron-icon" width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path d={dropdownOpen ? 'M9 5L5 1L1 5' : 'M1 1L5 5L9 1'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
              {dropdownOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <strong>{user.username}</strong>
                    <small>{user.email}</small>
                  </div>
                  <hr />
                  <button onClick={() => { navigate('/profile'); setDropdownOpen(false); }} className="dropdown-item">
                    👤 {lang === 'tr' ? 'Profilim' : 'My Profile'}
                  </button>
                  <button onClick={() => { navigate('/dashboard'); setDropdownOpen(false); }} className="dropdown-item">
                    📊 {lang === 'tr' ? 'İstatistikler' : 'Statistics'}
                  </button>
                  <hr />
                  <button onClick={() => { setDropdownOpen(false); handleLogout(); }} className="dropdown-item logout">{t.nav.logout}</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login"    className={`nav-auth-btn${isActive('/login')    ? ' nav-auth-btn--active' : ''}`}>{t.nav.login}</Link>
              <Link to="/register" className={`nav-auth-btn${isActive('/register') ? ' nav-auth-btn--active' : ''}`}>{t.nav.register}</Link>
            </div>
          )}

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          {user ? (
            <>
              <Link to="/"           onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}>{lang === 'tr' ? 'Hikaye Oluştur' : 'Create Story'}</Link>
              <Link to="/explore"    onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}>{lang === 'tr' ? 'Paylaşılan Hikayeler' : 'Shared Stories'}</Link>
              <Link to="/my-stories" onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}>{t.nav.myStories}</Link>

              <Link to="/profile"    onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}>👤 {lang === 'tr' ? 'Profilim' : 'My Profile'}</Link>
              <Link to="/dashboard"  onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}>📊 {lang === 'tr' ? 'İstatistikler' : 'Statistics'}</Link>
              <hr className="mobile-divider" />
              <button onClick={handleLogout} className="mobile-logout">{t.nav.logout}</button>
            </>
          ) : (
            <>
              <button onClick={() => scrollToSection('anasayfa')}      className="nav-link">{lang === 'tr' ? 'Anasayfa' : 'Home'}</button>
              <button onClick={() => scrollToSection('ozellikler')}    className="nav-link">{lang === 'tr' ? 'Özellikler' : 'Features'}</button>
              <button onClick={() => scrollToSection('nasil-calisir')} className="nav-link">{lang === 'tr' ? 'Nasıl Çalışır?' : 'How It Works'}</button>
              <button onClick={() => scrollToSection('ornek')}         className="nav-link">{lang === 'tr' ? 'Örnek Hikaye' : 'Example'}</button>
              <button onClick={() => scrollToSection('iletisim')} className="nav-link">{lang === 'tr' ? 'İletişim' : 'Contact'}</button>
              <hr className="mobile-divider" />
              <Link to="/login"    onClick={() => setMenuOpen(false)}>{t.nav.login}</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>{t.nav.register}</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useTheme } from '../context/ThemeContext';
import MasalMatikLogo from './MasalMatikLogo';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, lang, switchLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Separate states: dropdown = user avatar menu, mobileOpen = hamburger nav
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);

  const isActive = (path) => location.pathname === path;

  const closeAll = () => { setDropdownOpen(false); setMobileOpen(false); };

  const handleLogout = async () => {
    await logout();
    closeAll();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">

        {/* ── Logo ── */}
        <Link to="/" className="navbar-logo" onClick={closeAll}>
          <MasalMatikLogo size={34} />
          <span className="logo-text">MasalMatik</span>
        </Link>

        {/* ── Desktop nav links (auth only) ── */}
        {user && (
          <div className="navbar-links">
            <Link to="/"           className={`nav-link ${isActive('/')           ? 'active' : ''}`} onClick={closeAll}>{t.nav.today}</Link>
            <Link to="/explore"    className={`nav-link ${isActive('/explore')    ? 'active' : ''}`} onClick={closeAll}>{t.nav.explore}</Link>
            <Link to="/my-stories" className={`nav-link ${isActive('/my-stories') ? 'active' : ''}`} onClick={closeAll}>{t.nav.myStories}</Link>
            <Link to="/dashboard"  className={`nav-link ${isActive('/dashboard')  ? 'active' : ''}`} onClick={closeAll}>{t.nav.dashboard}</Link>
          </div>
        )}

        {/* ── Right control group ── */}
        <div className="navbar-right">

          {/* Lang + Theme group */}
          <div className="nav-controls">
            {/* TR / EN inline pill */}
            <div className="nav-lang-pill">
              <button
                className={`nlp-btn ${lang === 'tr' ? 'active' : ''}`}
                onClick={() => switchLang('tr')}
              >TR</button>
              <button
                className={`nlp-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => switchLang('en')}
              >EN</button>
            </div>

            {/* Dark / Light toggle */}
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? (
                /* Sun — switch to light */
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="5" fill="currentColor"/>
                  <line x1="12" y1="1"  x2="12" y2="3"  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="1"  y1="12" x2="3"  y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                /* Moon — switch to dark */
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/>
                </svg>
              )}
            </button>
          </div>

          {/* ── Authenticated: user menu ── */}
          {user ? (
            <div className="user-menu">
              <button
                className="user-avatar-btn"
                onClick={() => setDropdownOpen(o => !o)}
                aria-expanded={dropdownOpen}
              >
                <span className="user-avatar">
                  {user.username?.[0]?.toUpperCase() || '?'}
                </span>
                <span className="user-name hide-mobile">{user.username}</span>
                <svg className="chevron-icon" width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path
                    d={dropdownOpen ? 'M9 5L5 1L1 5' : 'M1 1L5 5L9 1'}
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                  />
                </svg>
              </button>

              {dropdownOpen && (
                <>
                  <div className="dropdown-backdrop" onClick={() => setDropdownOpen(false)} />
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <strong>{user.username}</strong>
                      <small>{user.email}</small>
                    </div>
                    <hr />

                    <Link to="/settings" className="dropdown-item" onClick={closeAll}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      {t.nav.settings}
                    </Link>

                    {/* Language inside dropdown */}
                    <div className="dropdown-item dropdown-lang-row">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
                          stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <span>{t.nav.changeLanguage}</span>
                      <div className="dropdown-lang-btns">
                        <button className={`dlang-btn ${lang==='tr'?'active':''}`} onClick={(e)=>{e.stopPropagation();switchLang('tr');}}>TR</button>
                        <button className={`dlang-btn ${lang==='en'?'active':''}`} onClick={(e)=>{e.stopPropagation();switchLang('en');}}>EN</button>
                      </div>
                    </div>

                    <hr />

                    <button onClick={handleLogout} className="dropdown-item logout">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {t.nav.logout}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login"    className="btn btn-outline btn-sm"  onClick={closeAll}>{t.nav.login}</Link>
              <Link to="/register" className="btn btn-primary btn-sm"  onClick={closeAll}>{t.nav.register}</Link>
            </div>
          )}

          {/* ── Hamburger (mobile only) — independent state ── */}
          <button
            className={`hamburger ${mobileOpen ? 'open' : ''}`}
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Open menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* ── Mobile menu — triggered only by hamburger ── */}
      {mobileOpen && (
        <div className="mobile-menu">
          {user ? (
            <>
              <Link to="/"           onClick={closeAll}>{t.nav.today}</Link>
              <Link to="/explore"    onClick={closeAll}>{t.nav.explore}</Link>
              <Link to="/my-stories" onClick={closeAll}>{t.nav.myStories}</Link>
              <Link to="/dashboard"  onClick={closeAll}>{t.nav.dashboard}</Link>
              <Link to="/settings"   onClick={closeAll}>{t.nav.settings}</Link>
              <hr className="mobile-divider" />
              <div className="mobile-lang-row">
                <button className={`mobile-lang-btn ${lang==='tr'?'active':''}`} onClick={()=>switchLang('tr')}>TR</button>
                <button className={`mobile-lang-btn ${lang==='en'?'active':''}`} onClick={()=>switchLang('en')}>EN</button>
              </div>
              <hr className="mobile-divider" />
              <button onClick={handleLogout} className="mobile-logout">{t.nav.logout}</button>
            </>
          ) : (
            <>
              <Link to="/login"    onClick={closeAll}>{t.nav.login}</Link>
              <Link to="/register" onClick={closeAll}>{t.nav.register}</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import api from '../services/api';
import './Auth.css';

export default function ForgotPassword() {
  const { t } = useLang();
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError(t.auth.errors.emailRequired); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError(t.auth.errors.emailInvalid); return; }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
    } catch {
      // Intentionally swallow — always show success to prevent enumeration
    } finally {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-night-bg" />

      <div className="auth-card animate-fadeIn">
        <div className="auth-header">
          <div className="auth-moon-icon">
            <svg viewBox="0 0 48 48" width="52" height="52" fill="none">
              <circle cx="24" cy="24" r="23" fill="rgba(117,70,104,0.3)" stroke="rgba(210,195,255,0.25)" strokeWidth="1"/>
              <text x="24" y="31" textAnchor="middle" fontSize="22">🔑</text>
            </svg>
          </div>
          <h1 className="auth-title">{t.forgotPassword.title}</h1>
          <p className="auth-subtitle">{t.forgotPassword.subtitle}</p>
        </div>

        {sent ? (
          <div className="forgot-success">
            <div className="forgot-success-icon">✉️</div>
            <p>{t.forgotPassword.success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label">{t.forgotPassword.emailLabel}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder={t.auth.emailPlaceholder}
                className={`input-field ${error ? 'error' : ''}`}
                autoComplete="email"
              />
              {error && <span className="error-text">{error}</span>}
            </div>

            <button type="submit" className="btn auth-btn-primary auth-submit" disabled={loading}>
              {loading ? <><span className="btn-spinner" /> {t.loading}</> : t.forgotPassword.submit}
            </button>
          </form>
        )}

        <p className="auth-switch">
          <Link to="/login" className="auth-link">← {t.auth.login}</Link>
        </p>
      </div>
    </div>
  );
}

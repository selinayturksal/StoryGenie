import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import './Auth.css';

function validate(identifier, password, t) {
  const errors = {};
  if (!identifier) errors.identifier = t.auth.errors.identifierRequired;
  if (!password)   errors.password   = t.auth.errors.passwordRequired;
  // Never enforce strength rules on login — user may have an older password
  return errors;
}

export default function Login() {
  const { login } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(errs => ({ ...errs, [e.target.name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form.identifier, form.password, t);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await login(form.identifier, form.password);
      navigate('/');
    } catch (err) {
      setServerError(err.message);
    } finally {
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
              <path d="M28 12 A13 13 0 1 0 28 36 A10 10 0 1 1 28 12 Z" fill="rgba(210,195,255,0.85)"/>
              <circle cx="34" cy="11" r="2.5" fill="rgba(255,230,120,0.9)"/>
              <circle cx="38" cy="18" r="1.5" fill="rgba(255,230,120,0.65)"/>
            </svg>
          </div>
          <h1 className="auth-title">{t.auth.loginTitle}</h1>
          <p className="auth-subtitle">{t.auth.loginSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {serverError && (
            <div className="server-error">{serverError}</div>
          )}

          <div className="form-group">
            <label className="form-label">{t.auth.identifier}</label>
            <input
              type="text"
              name="identifier"
              value={form.identifier}
              onChange={handleChange}
              placeholder={t.auth.identifierPlaceholder}
              className={`input-field ${errors.identifier ? 'error' : ''}`}
              autoComplete="username"
            />
            {errors.identifier && <span className="error-text">{errors.identifier}</span>}
          </div>

          <div className="form-group">
            <div className="auth-label-row">
              <label className="form-label">{t.auth.password}</label>
              <Link to="/forgot-password" className="auth-forgot">{t.auth.forgotPassword}</Link>
            </div>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`input-field ${errors.password ? 'error' : ''}`}
              autoComplete="current-password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button type="submit" className="btn auth-btn-primary auth-submit" disabled={loading}>
            {loading ? <><span className="btn-spinner" /> {t.loading}</> : t.auth.login}
          </button>
        </form>

        <p className="auth-switch">
          {t.auth.noAccount}{' '}
          <Link to="/register" className="auth-link">{t.auth.register}</Link>
        </p>
      </div>
    </div>
  );
}

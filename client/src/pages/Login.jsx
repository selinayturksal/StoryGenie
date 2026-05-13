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
          <div className="auth-logo-icon">
            <img src="/assets/landing/logo.png" alt="Masalmatik" />
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

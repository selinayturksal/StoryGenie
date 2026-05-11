import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import './Auth.css';

function validate(form, t) {
  const errors = {};
  if (!form.username) errors.username = t.auth.errors.usernameRequired;
  else if (form.username.length < 3) errors.username = t.auth.errors.usernameShort;
  else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) errors.username = t.auth.errors.usernameInvalid;

  if (!form.email) errors.email = t.auth.errors.emailRequired;
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = t.auth.errors.emailInvalid;

  if (!form.password) errors.password = t.auth.errors.passwordRequired;
  else if (form.password.length < 8)   errors.password = t.auth.errors.passwordShort;
  else if (!/[A-Z]/.test(form.password)) errors.password = t.auth.errors.passwordWeak;
  else if (!/[a-z]/.test(form.password)) errors.password = t.auth.errors.passwordWeak;
  else if (!/\d/.test(form.password))    errors.password = t.auth.errors.passwordWeak;

  return errors;
}

export default function Register() {
  const { register } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', email: '', password: '' });
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
    const errs = validate(form, t);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register(form.username, form.email, form.password, lang);
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
              <circle cx="24" cy="24" r="23" fill="rgba(84,151,167,0.25)" stroke="rgba(180,220,230,0.25)" strokeWidth="1"/>
              <path d="M28 12 A13 13 0 1 0 28 36 A10 10 0 1 1 28 12 Z" fill="rgba(185,230,240,0.8)"/>
              <path d="M34 10 L35 13 L38 13 L35.5 14.8 L36.5 18 L34 16.2 L31.5 18 L32.5 14.8 L30 13 L33 13 Z" fill="rgba(255,230,100,0.9)"/>
            </svg>
          </div>
          <h1 className="auth-title">{t.auth.registerTitle}</h1>
          <p className="auth-subtitle">{t.auth.registerSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {serverError && (
            <div className="server-error">{serverError}</div>
          )}

          <div className="form-group">
            <label className="form-label">{t.auth.username}</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder={t.auth.usernamePlaceholder}
              className={`input-field ${errors.username ? 'error' : ''}`}
              autoComplete="username"
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">{t.auth.email}</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder={t.auth.emailPlaceholder}
              className={`input-field ${errors.email ? 'error' : ''}`}
              autoComplete="email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">{t.auth.password}</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={t.auth.passwordPlaceholder}
              className={`input-field ${errors.password ? 'error' : ''}`}
              autoComplete="new-password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button type="submit" className="btn auth-btn-primary auth-submit" disabled={loading}>
            {loading ? <><span className="btn-spinner" /> {t.loading}</> : t.auth.register}
          </button>
        </form>

        <p className="auth-switch">
          {t.auth.hasAccount}{' '}
          <Link to="/login" className="auth-link">{t.auth.login}</Link>
        </p>
      </div>
    </div>
  );
}

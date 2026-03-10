import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import './Auth.css';

function validate(email, password, t) {
  const errors = {};
  if (!email) errors.email = t.auth.errors.emailRequired;
  else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = t.auth.errors.emailInvalid;
  if (!password) errors.password = t.auth.errors.passwordRequired;
  else if (password.length < 6) errors.password = t.auth.errors.passwordShort;
  return errors;
}

export default function Login() {
  const { login } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
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
    const errs = validate(form.email, form.password, t);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Decorative background */}
      <div className="auth-bg">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
      </div>

      <div className="auth-card animate-fadeIn">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon">📖</div>
          <h1 className="auth-title">{t.auth.loginTitle}</h1>
          <p className="auth-subtitle">{t.auth.loginSubtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {serverError && (
            <div className="server-error">{serverError}</div>
          )}

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
              placeholder="••••••••"
              className={`input-field ${errors.password ? 'error' : ''}`}
              autoComplete="current-password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? (
              <><span className="btn-spinner" /> {t.loading}</>
            ) : (
              <>✨ {t.auth.login}</>
            )}
          </button>
        </form>

        {/* Switch to register */}
        <p className="auth-switch">
          {t.auth.noAccount}{' '}
          <Link to="/register" className="auth-link">{t.auth.register}</Link>
        </p>
      </div>
    </div>
  );
}

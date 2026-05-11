import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import api from '../services/api';
import './Settings.css';

function validatePassword(current, next, confirm, t) {
  const errs = {};
  if (!current) errs.current = t.auth.errors.passwordRequired;
  if (!next)    errs.next    = t.auth.errors.passwordRequired;
  else if (next.length < 8) errs.next = t.auth.errors.passwordShort;
  else if (!/[A-Z]/.test(next)) errs.next = t.auth.errors.passwordWeak;
  else if (!/[a-z]/.test(next)) errs.next = t.auth.errors.passwordWeak;
  else if (!/\d/.test(next))    errs.next = t.auth.errors.passwordWeak;
  if (next && confirm !== next) errs.confirm = t.settings.errors.passwordMismatch;
  return errs;
}

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { t, lang, switchLang } = useLang();
  const [tab, setTab] = useState('profile');

  // Profile tab state
  const [username, setUsername] = useState(user?.username || '');
  const [profileError, setProfileError]   = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password tab state
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwErrors, setPwErrors]   = useState({});
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!username || username.length < 3) {
      setProfileError(t.auth.errors.usernameShort);
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setProfileError(t.auth.errors.usernameInvalid);
      return;
    }
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const res = await api.put('/auth/profile', { username });
      updateUser(res.data.user);
      setProfileSuccess(t.settings.success.profile);
    } catch (err) {
      setProfileError(err.message || t.error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errs = validatePassword(pwForm.current, pwForm.next, pwForm.confirm, t);
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setPwLoading(true);
    setPwErrors({});
    setPwSuccess('');
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
      });
      setPwSuccess(t.settings.success.password);
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwErrors({ current: err.message || t.error });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container container">
        <h1 className="settings-title">{t.settings.title}</h1>

        {/* Tabs */}
        <div className="settings-tabs">
          <button
            className={`settings-tab ${tab === 'profile' ? 'active' : ''}`}
            onClick={() => setTab('profile')}
          >
            {t.settings.profileTab}
          </button>
          <button
            className={`settings-tab ${tab === 'security' ? 'active' : ''}`}
            onClick={() => setTab('security')}
          >
            {t.settings.securityTab}
          </button>
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="settings-card">
            <form onSubmit={handleSaveProfile} noValidate>
              <div className="form-group">
                <label className="form-label">{t.settings.username}</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setProfileError(''); setProfileSuccess(''); }}
                  className={`input-field ${profileError ? 'error' : ''}`}
                  autoComplete="username"
                />
                {profileError   && <span className="error-text">{profileError}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">{t.settings.email}</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-field settings-disabled"
                />
                <span className="settings-hint">{t.settings.emailHint}</span>
              </div>

              {/* Language preference */}
              <div className="form-group">
                <label className="form-label">{t.settings.language}</label>
                <div className="settings-lang-btns">
                  <button
                    type="button"
                    className={`settings-lang-btn ${lang === 'tr' ? 'active' : ''}`}
                    onClick={() => switchLang('tr')}
                  >Türkçe</button>
                  <button
                    type="button"
                    className={`settings-lang-btn ${lang === 'en' ? 'active' : ''}`}
                    onClick={() => switchLang('en')}
                  >English</button>
                </div>
              </div>

              {profileSuccess && <div className="settings-success">{profileSuccess}</div>}

              <button type="submit" className="btn btn-primary settings-submit" disabled={profileLoading}>
                {profileLoading ? <><span className="btn-spinner" /> {t.loading}</> : t.settings.saveProfile}
              </button>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {tab === 'security' && (
          <div className="settings-card">
            <form onSubmit={handleChangePassword} noValidate>
              <div className="form-group">
                <label className="form-label">{t.settings.currentPassword}</label>
                <input
                  type="password"
                  value={pwForm.current}
                  onChange={(e) => { setPwForm(f => ({ ...f, current: e.target.value })); setPwErrors({}); setPwSuccess(''); }}
                  className={`input-field ${pwErrors.current ? 'error' : ''}`}
                  autoComplete="current-password"
                />
                {pwErrors.current && <span className="error-text">{pwErrors.current}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">{t.settings.newPassword}</label>
                <input
                  type="password"
                  value={pwForm.next}
                  onChange={(e) => { setPwForm(f => ({ ...f, next: e.target.value })); setPwErrors({}); setPwSuccess(''); }}
                  className={`input-field ${pwErrors.next ? 'error' : ''}`}
                  autoComplete="new-password"
                  placeholder={t.auth.passwordPlaceholder}
                />
                {pwErrors.next && <span className="error-text">{pwErrors.next}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">{t.settings.confirmPassword}</label>
                <input
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) => { setPwForm(f => ({ ...f, confirm: e.target.value })); setPwErrors({}); setPwSuccess(''); }}
                  className={`input-field ${pwErrors.confirm ? 'error' : ''}`}
                  autoComplete="new-password"
                />
                {pwErrors.confirm && <span className="error-text">{pwErrors.confirm}</span>}
              </div>

              {pwSuccess && <div className="settings-success">{pwSuccess}</div>}

              <button type="submit" className="btn btn-primary settings-submit" disabled={pwLoading}>
                {pwLoading ? <><span className="btn-spinner" /> {t.loading}</> : t.settings.changePassword}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

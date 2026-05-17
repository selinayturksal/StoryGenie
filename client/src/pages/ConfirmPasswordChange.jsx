import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import api from '../services/api';
import './Auth.css';

export default function ConfirmPasswordChange() {
  const { token }  = useParams();
  const { lang }   = useLang();
  const navigate   = useNavigate();

  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get(`/auth/confirm-password-change/${token}`)
      .then(() => setStatus('success'))
      .catch(err => {
        setMessage(err.response?.data?.error || (lang === 'tr' ? 'Onay başarısız.' : 'Confirmation failed.'));
        setStatus('error');
      });
  }, [token, lang]);

  if (status === 'loading') {
    return (
      <div className="auth-page">
        <div className="auth-night-bg" />
        <div className="auth-card animate-fadeIn" style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '40px auto' }} />
          <p style={{ color: 'var(--ink-soft)' }}>
            {lang === 'tr' ? 'Onaylanıyor…' : 'Confirming…'}
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="auth-page">
        <div className="auth-night-bg" />
        <div className="auth-card animate-fadeIn">
          <div className="auth-header">
            <div className="auth-moon-icon">✅</div>
            <h1 className="auth-title">
              {lang === 'tr' ? 'Şifren değiştirildi!' : 'Password changed!'}
            </h1>
            <p className="auth-subtitle">
              {lang === 'tr'
                ? 'Yeni şifrenle giriş yapabilirsin.'
                : 'You can now log in with your new password.'}
            </p>
          </div>
          <button className="btn auth-btn-primary auth-submit" onClick={() => navigate('/login')}>
            {lang === 'tr' ? 'Giriş Yap →' : 'Log In →'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-night-bg" />
      <div className="auth-card animate-fadeIn">
        <div className="auth-header">
          <div className="auth-moon-icon">❌</div>
          <h1 className="auth-title">
            {lang === 'tr' ? 'Onay başarısız' : 'Confirmation failed'}
          </h1>
          <p className="auth-subtitle">{message}</p>
        </div>
        <button className="btn auth-btn-primary auth-submit" onClick={() => navigate('/settings')}>
          {lang === 'tr' ? 'Ayarlara Dön' : 'Back to Settings'}
        </button>
      </div>
    </div>
  );
}

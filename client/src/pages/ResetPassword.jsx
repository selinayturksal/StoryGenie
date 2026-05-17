import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

function validate(password, confirm) {
  if (!password) return 'Yeni şifre zorunludur.';
  if (password.length < 8) return 'Şifre en az 8 karakter olmalıdır.';
  if (!/[A-Z]/.test(password)) return 'En az bir büyük harf gereklidir.';
  if (!/[a-z]/.test(password)) return 'En az bir küçük harf gereklidir.';
  if (!/\d/.test(password)) return 'En az bir rakam gereklidir.';
  if (password !== confirm) return 'Şifreler eşleşmiyor.';
  return null;
}

export default function ResetPassword() {
  const { token } = useParams();
  const navigate  = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate(password, confirm);
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      // Kullanıcı yeni şifresiyle kendisi giriş yapsın — otomatik login yok
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Geçersiz veya süresi dolmuş sıfırlama linki.');
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
              <text x="24" y="31" textAnchor="middle" fontSize="22">🔐</text>
            </svg>
          </div>
          <h1 className="auth-title">Yeni Şifre Belirle</h1>
          <p className="auth-subtitle">Hesabın için güçlü bir şifre seç.</p>
        </div>

        {success ? (
          <div className="forgot-success">
            <div className="forgot-success-icon">✅</div>
            <p>Şifren başarıyla değiştirildi. Yeni şifrenle giriş yapabilirsin.</p>
            <Link to="/login" className="btn auth-btn-primary auth-submit" style={{ marginTop: '16px', justifyContent: 'center' }}>
              Giriş Yap →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label">Yeni Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="En az 8 karakter, büyük harf ve rakam içermeli"
                className={`input-field ${error ? 'error' : ''}`}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Şifre Tekrar</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                placeholder="Şifreni tekrar gir"
                className={`input-field ${error ? 'error' : ''}`}
                autoComplete="new-password"
              />
              {error && <span className="error-text">{error}</span>}
            </div>

            <button type="submit" className="btn auth-btn-primary auth-submit" disabled={loading}>
              {loading ? <><span className="btn-spinner" /> Kaydediliyor...</> : '🔑 Şifreyi Güncelle'}
            </button>
          </form>
        )}

        <p className="auth-switch">
          <Link to="/login" className="auth-link">← Giriş yap</Link>
        </p>
      </div>
    </div>
  );
}

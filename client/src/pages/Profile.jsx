import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import api from '../services/api';
import './Profile.css';

const AVATARS = ['🧒','👧','👦','🧑','👩','👨','🧙','🧚','🦸','🧜','🐱','🦊','🐼','🦁','🐸','🦋','⭐','🌟','🎨','📚'];

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const tr = lang === 'tr';

  const [avatar, setAvatar] = useState(
    user?.avatar?.startsWith('/') ? '🧒' : (user?.avatar || '🧒')
  );
  const [avatarMsg, setAvatarMsg] = useState('');
  const [bgColor, setBgColor] = useState(user?.avatarBg || localStorage.getItem('avatarBg') || '#0a0f3c');

  // user değişince (sayfa yenilenince) bgColor güncelle
  React.useEffect(() => {
    if (user?.avatarBg) setBgColor(user.avatarBg);
  }, [user?.avatarBg]);

  const [username, setUsername]   = useState(user?.username || '');
  const [profileMsg, setProfileMsg] = useState({ text: '', ok: true });
  const [profileLoading, setProfileLoading] = useState(false);

  const [pw, setPw]             = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg]       = useState({ text: '', ok: true });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw]     = useState({ current: false, next: false, confirm: false });
  const [showPwForm, setShowPwForm] = useState(false);

  const [deletePass, setDeletePass]       = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteMsg, setDeleteMsg]         = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSaveAvatar = async (emoji) => {
    setAvatar(emoji);
    try {
      const res = await api.put('/auth/profile', { avatar: emoji });
      updateUser(res.data.user);
      setAvatarMsg(tr ? 'Avatar guncellendi!' : 'Avatar updated!');
      setTimeout(() => setAvatarMsg(''), 2000);
    } catch (_) {}
  };


  const handleSaveBg = async (color) => {
    setBgColor(color);
    try {
      const res = await api.put('/auth/profile', { avatarBg: color });
      updateUser(res.data.user);
      // localStorage'a da kaydet — sayfa yenilenince kaybolmasın
      localStorage.setItem('avatarBg', color);
    } catch (_) {}
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (username.length < 3) { setProfileMsg({ text: 'En az 3 karakter.', ok: false }); return; }
    setProfileLoading(true); setProfileMsg({ text: '', ok: true });
    try {
      const res = await api.put('/auth/profile', { username });
      updateUser(res.data.user);
      setProfileMsg({ text: tr ? 'Kaydedildi!' : 'Saved!', ok: true });
    } catch (err) {
      setProfileMsg({ text: err.message, ok: false });
    } finally { setProfileLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pw.current || !pw.next) { setPwMsg({ text: 'Tum alanlari doldurun.', ok: false }); return; }
    if (pw.next.length < 6)      { setPwMsg({ text: 'En az 6 karakter.', ok: false }); return; }
    if (pw.next !== pw.confirm)  { setPwMsg({ text: 'Sifreler eslesmedi.', ok: false }); return; }
    setPwLoading(true); setPwMsg({ text: '', ok: true });
    try {
      await api.put('/auth/change-password', { currentPassword: pw.current, newPassword: pw.next });
      setPwMsg({ text: tr ? 'Sifre guncellendi!' : 'Password updated!', ok: true });
      setPw({ current: '', next: '', confirm: '' });
      setTimeout(() => setShowPwForm(false), 1500);
    } catch (err) {
      setPwMsg({ text: err.message, ok: false });
    } finally { setPwLoading(false); }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'SIL' && deleteConfirm !== 'DELETE') {
      setDeleteMsg(tr ? '"SIL" yazin.' : 'Type "DELETE".'); return;
    }
    setDeleteLoading(true);
    try {
      await api.delete('/auth/account', { data: { password: deletePass } });
      logout(); navigate('/');
    } catch (err) {
      setDeleteMsg(err.message); setDeleteLoading(false);
    }
  };

  const currentAvatar = avatar || '🧒';

  return (
    <div className="prof-page">
      <div className="container prof-container">

        {/* ── HERO ── */}
        <div className="prof-hero animate-fadeIn">
          <div className="prof-avatar-wrap">
            <div className="prof-avatar-big" style={{ background: bgColor }}>{currentAvatar}</div>
          </div>
          <div className="prof-hero-info">
            <h2 className="prof-hero-name">{user?.username}</h2>
            <span className="prof-hero-email">{user?.email}</span>
            <div className="prof-hero-stats">
              <div className="prof-stat">
                <span className="prof-stat-icon">📖</span>
                <div className="prof-stat-info">
                  <span className="prof-stat-val">{user?.stats?.totalStories || 0}</span>
                  <span className="prof-stat-lbl">{tr ? 'Hikaye' : 'Stories'}</span>
                </div>
              </div>
              <div className="prof-stat">
                <span className="prof-stat-icon">🌍</span>
                <div className="prof-stat-info">
                  <span className="prof-stat-val">{user?.stats?.publicStories || 0}</span>
                  <span className="prof-stat-lbl">{tr ? 'Paylaşılan' : 'Shared'}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── ANA İÇERİK: sol + sağ ── */}
        <div className="prof-body">

          {/* SOL — avatar seç */}
          <div className="prof-col prof-col--left">
            <div className="prof-card">
              <div className="prof-card-header">
                <h3>{tr ? 'Profilini Seç' : 'Choose Your Profile'}</h3>
                <p>{tr ? 'Avatar ya da emojini seç.' : 'Choose your avatar or emoji.'}</p>
              </div>

              {/* Emoji seç */}
              <div className="prof-emoji-section">
                
                <div className="prof-avatar-grid">
                  {AVATARS.map(em => (
                    <button key={em}
                      className={`prof-avatar-option ${avatar === em ? 'selected' : ''}`}
                      onClick={() => handleSaveAvatar(em)}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {avatarMsg && <p className="prof-msg ok">{avatarMsg}</p>}

              {/* Arka plan rengi */}
              <div className="prof-bg-section">
                <span className="prof-emoji-label" style={{display:'block',marginBottom:'8px'}}>{tr ? 'ARKA PLAN RENGİ' : 'BACKGROUND COLOR'}</span>
                <div className="prof-bg-grid">
                  {['#0a0f3c','#6366f1','#7c3aed','#0d9488','#dc2626','#ea580c','#ca8a04','#16a34a','#db2777','#0284c7'].map(color => (
                    <button key={color} className={`prof-bg-option ${bgColor === color ? 'selected' : ''}`}
                      style={{ background: color }}
                      onClick={() => handleSaveBg(color)} />
                  ))}
                </div>
              </div>

              {/* Kendini ifade et */}
              <div className="prof-tip-box">
                <span>🛡</span>
                <div>
                  <strong>{tr ? 'Sana en çok benzeyen hangisi? 🤔' : 'Which one looks like you? 🤔'}</strong>
                  <small>{tr ? 'Seçtiğin avatar hikaye kartlarında görünecek.' : 'Your avatar will appear on story cards.'}</small>
                </div>
              </div>
            </div>
          </div>

          {/* SAĞ — hesap bilgileri */}
          <div className="prof-col prof-col--right">
            <div className="prof-card">
              <div className="prof-card-header">
                <h3>{tr ? 'Hesap Bilgileri' : 'Account Info'}</h3>
                <p>{tr ? 'Hesap bilgilerini guncelle.' : 'Update your account info.'}</p>
              </div>

              <form onSubmit={handleSaveProfile} className="prof-form">
                <div className="prof-field">
                  <label>{tr ? 'Kullanıcı Adı' : 'Username'}</label>
                  <input type="text" value={username}
                    onChange={e => { setUsername(e.target.value); setProfileMsg({ text: '', ok: true }); }}
                    className="prof-input" />
                </div>
                <div className="prof-field">
                  <label>{tr ? 'E-posta' : 'Email'}</label>
                  <input type="email" value={user?.email || ''} disabled className="prof-input prof-input--disabled" />
                </div>
                {profileMsg.text && <p className={`prof-msg ${profileMsg.ok ? 'ok' : 'err'}`}>{profileMsg.text}</p>}
                <button type="submit" className="prof-btn prof-btn--primary" disabled={profileLoading}>
                  {profileLoading ? '⏳' : (tr ? 'Degisiklikleri Kaydet' : 'Save Changes')}
                </button>
              </form>

              {/* Şifre değiştir */}
              <div className="prof-pw-section">
                <button className="prof-pw-toggle" onClick={() => setShowPwForm(s => !s)}>
                  🔒 {tr ? 'Sifre Degistir' : 'Change Password'}
                  <span>{showPwForm ? '▲' : '▼'}</span>
                </button>
                {showPwForm && (
                  <form onSubmit={handleChangePassword} className="prof-form prof-pw-form">
                    {['current', 'next', 'confirm'].map(field => (
                      <div className="prof-field" key={field}>
                        <label>
                          {field === 'current' ? (tr ? 'Mevcut Sifre' : 'Current Password')
                           : field === 'next'  ? (tr ? 'Yeni Sifre'   : 'New Password')
                                               : (tr ? 'Sifre Tekrar'  : 'Confirm')}
                        </label>
                        <div className="prof-input-wrap">
                          <input
                            type={showPw[field] ? 'text' : 'password'}
                            value={pw[field]}
                            onChange={e => setPw(p => ({ ...p, [field]: e.target.value }))}
                            className="prof-input"
                          />
                          <button type="button" className="prof-eye"
                            onClick={() => setShowPw(s => ({ ...s, [field]: !s[field] }))}>
                            {showPw[field] ? '🙈' : '👁'}
                          </button>
                        </div>
                      </div>
                    ))}
                    {pwMsg.text && <p className={`prof-msg ${pwMsg.ok ? 'ok' : 'err'}`}>{pwMsg.text}</p>}
                    <button type="submit" className="prof-btn prof-btn--primary" disabled={pwLoading}>
                      {pwLoading ? '⏳' : (tr ? 'Guncelle' : 'Update')}
                    </button>
                    <button type="button" className="prof-forgot-btn"
                      onClick={() => navigate('/forgot-password')}>
                      {tr ? 'Şifremi unuttum' : 'Forgot password?'}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* HESABI YÖNET — tam genişlik altta */}
        <div className="prof-card prof-manage-card" style={{ marginTop: '16px' }}>
          <div className="prof-manage-row">
            <div>
              <h3>{tr ? 'Hesabı Yonet' : 'Manage Account'}</h3>
              <p>{tr ? 'Hesabınla ilgili diger islemleri yonet.' : 'Manage other account actions.'}</p>
            </div>
            <button className="prof-btn prof-btn--danger-outline" onClick={() => setShowDeleteModal(true)}>
              🗑 {tr ? 'Hesabımı Sil' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showDeleteModal && (
        <div className="prof-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="prof-modal" onClick={e => e.stopPropagation()}>
            <h3 className="prof-modal-title">⚠️ {tr ? 'Hesabı Sil' : 'Delete Account'}</h3>
            <p className="prof-modal-desc">
              {tr ? 'Bu islem geri alinamaz. Tum hikayeleriniz silinecek.' : 'This is irreversible. All your stories will be deleted.'}
            </p>
            <div className="prof-field">
              <label>{tr ? 'Sifreniz' : 'Your Password'}</label>
              <input type="password" value={deletePass}
                onChange={e => setDeletePass(e.target.value)}
                className="prof-input" placeholder="••••••" />
            </div>
            <div className="prof-field">
              <label>{tr ? '"SIL" yazin onaylamak icin' : 'Type "DELETE" to confirm'}</label>
              <input type="text" value={deleteConfirm}
                onChange={e => { setDeleteConfirm(e.target.value); setDeleteMsg(''); }}
                className="prof-input" placeholder={tr ? 'SIL' : 'DELETE'} />
            </div>
            {deleteMsg && <p className="prof-msg err">{deleteMsg}</p>}
            <div className="prof-modal-actions">
              <button className="prof-btn prof-btn--ghost"
                onClick={() => { setShowDeleteModal(false); setDeletePass(''); setDeleteConfirm(''); setDeleteMsg(''); }}>
                {tr ? 'Vazgec' : 'Cancel'}
              </button>
              <button className="prof-btn prof-btn--danger" onClick={handleDeleteAccount} disabled={deleteLoading}>
                {deleteLoading ? '⏳' : (tr ? 'Evet, Sil' : 'Yes, Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
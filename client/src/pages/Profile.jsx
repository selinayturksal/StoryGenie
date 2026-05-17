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
  const [showPwModal, setShowPwModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep]           = useState(1);   // 1: hikaye tercihi, 2: final onay
  const [storyAction, setStoryAction]         = useState('delete');
  const [publicStoryCount, setPublicStoryCount] = useState(0);
  const [deletePass, setDeletePass]           = useState('');
  const [deleteConfirm, setDeleteConfirm]     = useState('');
  const [deleteMsg, setDeleteMsg]             = useState('');
  const [deleteLoading, setDeleteLoading]     = useState(false);

  // Bildirim tercihleri state
  const [notif, setNotif] = useState({
    notifyOnLike:    user?.notifications?.notifyOnLike    ?? true,
    notifyOnComment: user?.notifications?.notifyOnComment ?? true,
    notifyOnFollow:  user?.notifications?.notifyOnFollow  ?? true,
    notifyMarketing: user?.notifications?.notifyMarketing ?? false,
  });
  const [notifToast, setNotifToast] = useState(false);

  const handleNotifToggle = async (key) => {
    const prev    = notif;
    const newVal  = !notif[key];
    const updated = { ...notif, [key]: newVal };
    setNotif(updated);
    try {
      await api.put('/users/preferences', { [key]: newVal });
      setNotifToast(true);
      setTimeout(() => setNotifToast(false), 2000);
    } catch {
      // Hata durumunda önceki değere geri dön
      setNotif(prev);
    }
  };

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
      setTimeout(() => { setShowPwModal(false); setPwMsg({ text: '', ok: true }); }, 1500);
    } catch (err) {
      setPwMsg({ text: err.message, ok: false });
    } finally { setPwLoading(false); }
  };

  const openDeleteModal = async () => {
    try {
      const res = await api.get('/users/me/public-story-count');
      const count = res.data.count || 0;
      setPublicStoryCount(count);
      // Herkese açık hikaye yoksa hikaye tercihi adımını atla
      setDeleteStep(count > 0 ? 1 : 2);
      setStoryAction('delete');
    } catch {
      setDeleteStep(2);
    }
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteStep(1);
    setStoryAction('delete');
    setDeletePass('');
    setDeleteConfirm('');
    setDeleteMsg('');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'HESABIMI SİL' && deleteConfirm !== 'DELETE ACCOUNT') {
      setDeleteMsg(tr ? '"HESABIMI SİL" yazın.' : 'Type "DELETE ACCOUNT".'); return;
    }
    setDeleteLoading(true);
    try {
      await api.delete('/users/me', { data: { password: deletePass, storyAction } });
      logout(); navigate('/');
    } catch (err) {
      setDeleteMsg(err.response?.data?.error || err.message);
      setDeleteLoading(false);
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
                  {['#a7a3a3ff','#6366f1','#7c3aed','#0d9488','#dc2626','#ea580c','#ca8a04','#16a34a','#db2777','#0284c7'].map(color => (
                    <button key={color} className={`prof-bg-option ${bgColor === color ? 'selected' : ''}`}
                      style={{ background: color }}
                      onClick={() => handleSaveBg(color)} />
                  ))}
                </div>
              </div>

              {/* Kendini ifade et */}
              <div className="prof-tip-box">
                <div>
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

              {/* Şifre değiştir — modal açar */}
              <div className="prof-pw-section">
                <button className="prof-pw-toggle" onClick={() => setShowPwModal(true)}>
                  🔒 {tr ? 'Sifre Degistir' : 'Change Password'}
                </button>
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
            <button className="prof-btn prof-btn--danger-outline" onClick={openDeleteModal}>
              🗑 {tr ? 'Hesabımı Sil' : 'Delete Account'}
            </button>
          </div>
        </div>

        {/* BİLDİRİM TERCİHLERİ — tam genişlik altta */}
        <div className="prof-card prof-notif-card" style={{ marginTop: '16px' }}>
          <div className="prof-card-header">
            <h3>🔔 {tr ? 'Bildirim Tercihleri' : 'Notification Preferences'}</h3>
            <p>{tr ? 'Mail ile hangi bildirimleri alacağını buradan yönet.' : 'Manage which email notifications you receive.'}</p>
          </div>

          <div className="prof-notif-list">
            {[
              { key: 'notifyOnLike',    label: tr ? 'Hikayelerime beğeni geldiğinde mail al'   : 'Email when my stories get liked',    desc: tr ? 'Biri masalını beğendiğinde haberdar ol.' : 'Get notified when someone likes your story.' },
              { key: 'notifyOnComment', label: tr ? 'Hikayelerime yorum geldiğinde mail al'    : 'Email when my stories get comments',  desc: tr ? 'Yorum özelliği yakında eklenecek.'      : 'Comment feature coming soon.' },
              { key: 'notifyOnFollow',  label: tr ? 'Beni takip eden olduğunda mail al'        : 'Email when someone follows me',       desc: tr ? 'Takip özelliği yakında eklenecek.'      : 'Follow feature coming soon.' },
              { key: 'notifyMarketing', label: tr ? 'MasalMatik haberleri ve duyuruları'       : 'MasalMatik news and announcements',   desc: tr ? 'Yeni özellikler ve özel içerikler.'     : 'New features and special content.' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="prof-notif-row">
                <div className="prof-notif-text">
                  <span className="prof-notif-label">{label}</span>
                  <span className="prof-notif-desc">{desc}</span>
                </div>
                <label className="prof-notif-toggle">
                  <input
                    type="checkbox"
                    checked={notif[key]}
                    onChange={() => handleNotifToggle(key)}
                  />
                  <span className="prof-notif-slider" />
                </label>
              </div>
            ))}
          </div>

          <p className="prof-notif-security-note">
            🔒 {tr ? 'Güvenlik mailleri (şifre değişikliği vb.) bildirim tercihlerinden bağımsız olarak her zaman gönderilir.' : 'Security emails are always sent regardless of preferences.'}
          </p>

          {notifToast && (
            <div className="prof-notif-toast">
              ✓ {tr ? 'Tercihler güncellendi' : 'Preferences updated'}
            </div>
          )}
        </div>

      </div>

      {/* ŞİFRE DEĞİŞTİR MODALI */}
      {showPwModal && (
        <div className="prof-modal-overlay" onClick={() => { setShowPwModal(false); setPwMsg({ text: '', ok: true }); setPw({ current: '', next: '', confirm: '' }); }}>
          <div className="prof-modal" onClick={e => e.stopPropagation()}>
            <h3 className="prof-modal-title">🔒 {tr ? 'Şifre Değiştir' : 'Change Password'}</h3>
            <form onSubmit={handleChangePassword} className="prof-form">
              {['current', 'next', 'confirm'].map(field => (
                <div className="prof-field" key={field}>
                  <label>
                    {field === 'current' ? (tr ? 'Mevcut Şifre'  : 'Current Password')
                     : field === 'next'  ? (tr ? 'Yeni Şifre'    : 'New Password')
                                         : (tr ? 'Şifre Tekrar'  : 'Confirm Password')}
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
              <div className="prof-modal-actions">
                <button type="button" className="prof-btn prof-btn--ghost"
                  onClick={() => navigate('/forgot-password')}>
                  {tr ? 'Şifremi unuttum' : 'Forgot password?'}
                </button>
                <button type="submit" className="prof-btn prof-btn--primary" disabled={pwLoading}>
                  {pwLoading ? '⏳' : (tr ? 'Güncelle' : 'Update')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HESAP SİLME MODALI — iki aşamalı */}
      {showDeleteModal && (
        <div className="prof-modal-overlay" onClick={closeDeleteModal}>
          <div className="prof-modal" onClick={e => e.stopPropagation()}>

            {/* AŞAMA 1 — Hikaye tercihi (sadece public hikaye varsa gösterilir) */}
            {deleteStep === 1 && (
              <>
                <h3 className="prof-modal-title">🗂 {tr ? 'Hikayelerine Ne Olsun?' : 'What About Your Stories?'}</h3>
                <p className="prof-modal-desc">
                  {tr
                    ? `Hesabını silmek üzeresin. ${publicStoryCount} herkese açık hikayeniz için ne yapmak istersin?`
                    : `You're about to delete your account. What should happen to your ${publicStoryCount} public stories?`}
                </p>

                <div className="prof-delete-choices">
                  <label className={`prof-delete-choice ${storyAction === 'delete' ? 'selected' : ''}`}>
                    <input type="radio" name="storyAction" value="delete"
                      checked={storyAction === 'delete'}
                      onChange={() => setStoryAction('delete')} />
                    <div>
                      <strong>🗑 {tr ? 'Tüm hikayelerimi sil' : 'Delete all my stories'}</strong>
                      <span>{tr ? 'Paylaştığım hikayeler kalıcı olarak kaldırılsın.' : 'My published stories will be permanently removed.'}</span>
                    </div>
                  </label>
                  <label className={`prof-delete-choice ${storyAction === 'anonymize' ? 'selected' : ''}`}>
                    <input type="radio" name="storyAction" value="anonymize"
                      checked={storyAction === 'anonymize'}
                      onChange={() => setStoryAction('anonymize')} />
                    <div>
                      <strong>👤 {tr ? 'Hikayelerim kalsın (anonim)' : 'Keep stories (anonymous)'}</strong>
                      <span>{tr ? 'Hikayelerim platformda kalsın ama adımla bağlantısı kesilsin.' : 'Stories remain but disconnected from my name.'}</span>
                    </div>
                  </label>
                </div>

                <div className="prof-modal-actions">
                  <button className="prof-btn prof-btn--ghost" onClick={closeDeleteModal}>
                    {tr ? 'Vazgeç' : 'Cancel'}
                  </button>
                  <button className="prof-btn prof-btn--danger-outline" onClick={() => setDeleteStep(2)}>
                    {tr ? 'Devam Et →' : 'Continue →'}
                  </button>
                </div>
              </>
            )}

            {/* AŞAMA 2 — Final onay */}
            {deleteStep === 2 && (
              <>
                <h3 className="prof-modal-title">⚠️ {tr ? 'Son Onay' : 'Final Confirmation'}</h3>
                <p className="prof-modal-desc" style={{ color: '#e05070' }}>
                  {tr ? 'Bu işlem geri alınamaz. Hesabın ve tüm verilerin kalıcı olarak silinecek.' : 'This action is irreversible. Your account and all data will be permanently deleted.'}
                </p>

                <div className="prof-field">
                  <label>{tr ? 'Şifreniz' : 'Your Password'}</label>
                  <input type="password" value={deletePass}
                    onChange={e => { setDeletePass(e.target.value); setDeleteMsg(''); }}
                    className="prof-input" placeholder="••••••" autoComplete="current-password" />
                </div>
                <div className="prof-field">
                  <label>{tr ? '"HESABIMI SİL" yazın onaylamak için' : 'Type "DELETE ACCOUNT" to confirm'}</label>
                  <input type="text" value={deleteConfirm}
                    onChange={e => { setDeleteConfirm(e.target.value); setDeleteMsg(''); }}
                    className="prof-input"
                    placeholder={tr ? 'HESABIMI SİL' : 'DELETE ACCOUNT'} />
                </div>

                {deleteMsg && <p className="prof-msg err">{deleteMsg}</p>}

                <div className="prof-modal-actions">
                  <button className="prof-btn prof-btn--ghost" onClick={closeDeleteModal}>
                    {tr ? 'Vazgeç' : 'Cancel'}
                  </button>
                  <button className="prof-btn prof-btn--danger" onClick={handleDeleteAccount} disabled={deleteLoading}>
                    {deleteLoading ? '⏳' : (tr ? '🗑 Hesabımı Sil' : '🗑 Delete Account')}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
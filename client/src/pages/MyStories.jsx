import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import api from '../services/api';
import './MyStories.css';

// Favorileri localStorage'dan al/kaydet
const getFavorites = () => {
  try { return JSON.parse(localStorage.getItem('ms_favorites') || '[]'); } catch { return []; }
};
const saveFavorites = (favs) => {
  localStorage.setItem('ms_favorites', JSON.stringify(favs));
};

function StoryCard({ story, onTogglePublish, onRead, onToggleFavorite, isFavorite, lang }) {
  const [isPublic, setIsPublic]     = useState(story.isPublic);
  const [publishing, setPublishing] = useState(false);
  const [fav, setFav]               = useState(isFavorite);

  const handlePublish = async () => {
    setPublishing(true);
    const newVal = await onTogglePublish(story._id, !isPublic);
    setIsPublic(newVal); setPublishing(false);
  };

  const handleFav = () => {
    const newFav = !fav;
    setFav(newFav);
    onToggleFavorite(story._id, newFav);
  };

  const cleanMd = (text = '') =>
    text.replace(/^#{1,6}\s*/gm, '').replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1').replace(/_{1,2}(.*?)_{1,2}/g, '$1').trim();

  const chars        = story.options?.characters || [];
  const location     = story.options?.location;
  const locationFile = location?.imagePath?.split('/').pop() || '';
  const date         = new Date(story.createdAt).toLocaleDateString(
    lang === 'tr' ? 'tr-TR' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' }
  );

  return (
    <div className="sc-card animate-fadeIn">

      {/* ── GÖRSEL ── */}
      <div className="sc-visual">
        {locationFile && (
          <div className="sc-visual-bg"
            style={{ backgroundImage: `url('/assets/locations/${locationFile}')` }} />
        )}

        {/* Sol üst — durum rozeti */}
        <span className={`sc-badge sc-badge--tl ${isPublic ? 'public' : 'private'}`}>
          {isPublic ? (lang === 'tr' ? '🌍 Herkese Açık' : '🌍 Public') : (lang === 'tr' ? '🔒 Gizli' : '🔒 Private')}
        </span>

        {/* Sağ üst — dil rozeti */}
        {story.options?.storyLanguage && (
          <span className="sc-badge sc-badge--tr lang">
            {story.options.storyLanguage === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}
          </span>
        )}

        {/* Favori yıldızı — sol alt */}
        <button className={`sc-fav-btn ${fav ? 'sc-fav-btn--active' : ''}`} onClick={handleFav}
          title={fav ? (lang === 'tr' ? 'Favorilerden çıkar' : 'Remove from favorites') : (lang === 'tr' ? 'Favorilere ekle' : 'Add to favorites')}>
          {fav ? '⭐' : '☆'}
        </button>

        {/* Karakterler */}
        <div className="sc-chars-row" style={{ '--char-count': chars.length || 1 }}>
          {chars.map((c, i) => {
            const file = c.imagePath?.split('/').pop() || '';
            return (
              <div key={i} className="sc-char-col">
                <img src={`/assets/characters/${file}`} alt={c.name || ''}
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                <span className="sc-char-emoji" style={{ display: 'none' }}>{c.emoji || '👤'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BİLGİ ── */}
      <div className="sc-info">

        <div className="sc-date">📅 {date}</div>
        <h3 className="sc-title">{cleanMd(story.title)}</h3>

        {/* Karakter chipleri */}
        {chars.length > 0 && (
          <div className="sc-chip-row">
            {chars.map((c, i) => {
              const file = c.imagePath?.split('/').pop() || '';
              return (
                <div key={i} className="sc-chip">
                  <img src={`/assets/characters/${file}`} alt={c.name || ''}
                    onError={e => { e.target.style.display = 'none'; }} />
                  <span>{c.name}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Mekan chip */}
        {location && (
          <div className="sc-chip-row">
            <div className="sc-chip sc-chip--loc">
              <span>📍</span>
              <span>{location.name}</span>
            </div>
          </div>
        )}

        <div className="sc-spacer" />

        {/* Meta */}
        <div className="sc-meta-row">
          {story.options?.childAge && (
            <span className="sc-meta">
              {story.options.childAge <= 4 ? '🍼' : story.options.childAge <= 7 ? '🧒' : '👦'}{' '}
              {lang === 'tr' ? story.options.childAge + ' yaş' : 'Age ' + story.options.childAge}
            </span>
          )}
          {story.options?.duration && (
            <span className="sc-meta">
              {story.options.duration === 'short' ? (lang === 'tr' ? '⏳ Kısa' : '⏳ Short')
                : story.options.duration === 'medium' ? (lang === 'tr' ? '⏳ Orta' : '⏳ Medium')
                : (lang === 'tr' ? '⏳ Uzun' : '⏳ Long')}
            </span>
          )}
          {story.viewCount > 0 && <span className="sc-meta">👁 {story.viewCount}</span>}
        </div>

        {/* Aksiyonlar */}
        <div className="sc-actions">
          <button className="sc-btn sc-btn--primary" onClick={() => onRead(story._id)}>
            📖 {lang === 'tr' ? 'Oku' : 'Read'}
          </button>
          <button
            className={`sc-btn ${isPublic ? 'sc-btn--outline' : 'sc-btn--ghost'}`}
            onClick={handlePublish} disabled={publishing}>
            {publishing ? '⏳' : isPublic
              ? (lang === 'tr' ? '🔒 Gizle' : '🔒 Hide')
              : (lang === 'tr' ? '🌍 Paylaş' : '🌍 Share')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyStories() {
  const { t, lang } = useLang();
  const navigate    = useNavigate();

  const [stories, setStories]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab]   = useState('all'); // 'all' | 'favorites'
  const [favorites, setFavorites]   = useState(getFavorites);

  const fetchStories = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/stories/my?page=${p}&limit=9`);
      setStories(res.data.stories);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStories(page); }, [page, fetchStories]);

  const handleTogglePublish = async (id, isPublic) => {
    try {
      const res = await api.patch(`/stories/${id}/publish`, { isPublic });
      return res.data.story.isPublic;
    } catch { return !isPublic; }
  };

  const handleToggleFavorite = (id, isFav) => {
    setFavorites(prev => {
      const next = isFav ? [...prev, id] : prev.filter(f => f !== id);
      saveFavorites(next);
      return next;
    });
  };

  const displayedStories = activeTab === 'favorites'
    ? stories.filter(s => favorites.includes(s._id))
    : stories;

  return (
    <div className="my-stories-page">
      <div className="container">

        <div className="ms-header animate-fadeIn">
          <h1 className="ms-title">{t.myStories.title}</h1>
          <p className="ms-subtitle">{t.myStories.subtitle}</p>
        </div>

        {/* Tab bar */}
        <div className="ms-tabs animate-fadeIn">
          <button
            className={`ms-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}>
            ⊞ {lang === 'tr' ? 'Tümü' : 'All'}
            <span className="ms-tab-count">{stories.length}</span>
          </button>
          <button
            className={`ms-tab ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}>
            ⭐ {lang === 'tr' ? 'Favoriler' : 'Favorites'}
            <span className="ms-tab-count">{favorites.filter(f => stories.some(s => s._id === f)).length}</span>
          </button>
        </div>

        {loading && <div className="ms-loading"><div className="spinner" /></div>}
        {error && !loading && <div className="ms-error">{error}</div>}

        {!loading && !error && displayedStories.length === 0 && (
          <div className="ms-empty animate-fadeIn">
            <div className="ms-empty-icon">{activeTab === 'favorites' ? '⭐' : '📭'}</div>
            <h3>
              {activeTab === 'favorites'
                ? (lang === 'tr' ? 'Henüz favori yok' : 'No favorites yet')
                : t.myStories.empty}
            </h3>
            {activeTab === 'all' && (
              <button className="btn btn-primary" onClick={() => navigate('/')}>
                ✨ {t.myStories.emptyBtn}
              </button>
            )}
            {activeTab === 'favorites' && (
              <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}>
                {lang === 'tr' ? 'Hikaye kartlarındaki ☆ yıldıza basarak favorine ekle!' : 'Tap the ☆ star on any story card to add it here!'}
              </p>
            )}
          </div>
        )}

        {!loading && displayedStories.length > 0 && (
          <div className="ms-grid">
            {displayedStories.map(story => (
              <StoryCard key={story._id} story={story} lang={lang}
                onTogglePublish={handleTogglePublish}
                onRead={(id) => navigate(`/story/${id}`)}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites.includes(story._id)}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && activeTab === 'all' && (
          <div className="ms-pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p}
                className={`page-btn ${p === page ? 'active' : ''}`}
                onClick={() => setPage(p)}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
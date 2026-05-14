import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import api from '../services/api';
import './MyStories.css';

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button"
          className={`star ${star <= (hover || value) ? 'filled' : ''}`}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}>★</button>
      ))}
    </div>
  );
}

function StoryCard({ story, onRate, onTogglePublish, onRead, lang }) {
  const [rating, setRating]       = useState(story.rating || 0);
  const [isPublic, setIsPublic]   = useState(story.isPublic);
  const [publishing, setPublishing] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);

  const handleRate = async (val) => {
    setRating(val); setRatingLoading(true);
    await onRate(story._id, val);
    setRatingLoading(false);
  };

  const handlePublish = async () => {
    setPublishing(true);
    const newVal = await onTogglePublish(story._id, !isPublic);
    setIsPublic(newVal); setPublishing(false);
  };

  const chars    = story.options?.characters || [];
  const location = story.options?.location;
  const date     = new Date(story.createdAt).toLocaleDateString(
    lang === 'tr' ? 'tr-TR' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' }
  );

  const locationFile = location?.imagePath?.split('/').pop() || '';

  return (
    <div className="sc-card animate-fadeIn">

      {/* ── SOL — mekan arka plan + karakterler boydan ── */}
      <div className="sc-visual">
        {/* Mekan arka planı */}
        {locationFile && (
          <div className="sc-visual-bg"
            style={{ backgroundImage: `url('/assets/locations/${locationFile}')` }} />
        )}

        {/* Durum ve dil rozetleri */}
        <div className="sc-visual-badges">
          <span className={`sc-badge ${isPublic ? 'public' : 'private'}`}>
            {isPublic ? '🌍 Herkese Açık' : '🔒 Gizli'}
          </span>
          {story.options?.storyLanguage && (
            <span className="sc-badge lang">
              {story.options.storyLanguage === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}
            </span>
          )}
        </div>

        {/* Karakterler boydan */}
        <div className="sc-chars-row" style={{ '--char-count': chars.length || 1 }}>
          {chars.map((c, i) => {
            const file = c.imagePath?.split('/').pop() || '';
            return (
              <div key={i} className="sc-char-col">
                <img
                  src={`/assets/characters/${file}`}
                  alt={c.name || ''}
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <span className="sc-char-emoji" style={{ display: 'none' }}>
                  {c.emoji || '👤'}
                </span>
                <span className="sc-char-name">{c.name || ''}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SAĞ — hikaye detayları ── */}
      <div className="sc-info">

        {/* Tarih */}
        <div className="sc-date">📅 {date}</div>

        {/* Başlık */}
        <h3 className="sc-title">{story.title}</h3>

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

        {/* Meta bilgiler */}
        <div className="sc-meta-row">
          {story.options?.childAge && (
            <span className="sc-meta">🍼 {story.options.childAge} yaş</span>
          )}
          {story.options?.duration && (
            <span className="sc-meta">
              {story.options.duration === 'short' ? '📖 Kısa'
                : story.options.duration === 'medium' ? '📖 Orta' : '📚 Uzun'}
            </span>
          )}
          {story.viewCount > 0 && (
            <span className="sc-meta">👁 {story.viewCount}</span>
          )}
        </div>

        {/* Puanlama */}
        <div className="sc-rating-block">
          <div className="sc-rating-label">
            {rating
              ? <><span className="sc-rating-score">{rating}/5</span></>
              : <span className="sc-rating-hint">{lang === 'tr' ? 'Puanla' : 'Rate'}</span>}
          </div>
          <StarRating value={rating} onChange={handleRate} />
        </div>

        {/* Aksiyonlar */}
        <div className="sc-actions">
          <button className="sc-btn sc-btn--primary" onClick={() => onRead(story._id)}>
            📖 {lang === 'tr' ? 'Oku' : 'Read'}
          </button>
          <button
            className={`sc-btn ${isPublic ? 'sc-btn--outline' : 'sc-btn--ghost'}`}
            onClick={handlePublish} disabled={publishing}>
            {publishing ? '⏳' : isPublic ? '🔒 Gizle' : '🌍 Paylaş'}
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

  const handleRate = async (id, rating) => {
    try { await api.patch(`/stories/${id}/rating`, { rating }); } catch (e) {}
  };

  const handleTogglePublish = async (id, isPublic) => {
    try {
      const res = await api.patch(`/stories/${id}/publish`, { isPublic });
      return res.data.story.isPublic;
    } catch { return !isPublic; }
  };

  return (
    <div className="my-stories-page">
      <div className="container">
        <div className="ms-header animate-fadeIn">
          <h1 className="ms-title">{t.myStories.title}</h1>
          <p className="ms-subtitle">{t.myStories.subtitle}</p>
        </div>

        {loading && <div className="ms-loading"><div className="spinner" /></div>}
        {error && !loading && <div className="ms-error">{error}</div>}

        {!loading && !error && stories.length === 0 && (
          <div className="ms-empty animate-fadeIn">
            <div className="ms-empty-icon">📭</div>
            <h3>{t.myStories.empty}</h3>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              ✨ {t.myStories.emptyBtn}
            </button>
          </div>
        )}

        {!loading && stories.length > 0 && (
          <div className="ms-grid">
            {stories.map(story => (
              <StoryCard key={story._id} story={story} lang={lang}
                onRate={handleRate}
                onTogglePublish={handleTogglePublish}
                onRead={(id) => navigate(`/story/${id}`)}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
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
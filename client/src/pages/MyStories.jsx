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
  const [rating, setRating] = useState(story.rating || 0);
  const [isPublic, setIsPublic] = useState(story.isPublic);
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

  const chars = story.options?.characters || [];
  const location = story.options?.location;
  const date = new Date(story.createdAt).toLocaleDateString(
    lang === 'tr' ? 'tr-TR' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' }
  );

  return (
    <div className="story-card animate-fadeIn">
      <div className="sc-header">
        <div className="sc-badges">
          <span className={`sc-badge ${isPublic ? 'public' : 'private'}`}>
            {isPublic ? '🌍 Herkese Açık' : '🔒 Gizli'}
          </span>
          {story.options?.storyLanguage && (
            <span className="sc-badge lang">
              {story.options.storyLanguage === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}
            </span>
          )}
        </div>
        <span className="sc-date">{date}</span>
      </div>

      <h3 className="sc-title">{story.title}</h3>

      {chars.length > 0 && (
        <div className="sc-chars">
          {chars.map((c, i) => (
            <div key={i} className="sc-char-chip">
              <img src={`/assets/characters/${c.imagePath?.split('/').pop() || ''}`}
                alt={c.name} onError={e => { e.target.style.display='none'; }} />
              <span>{c.name}</span>
            </div>
          ))}
          {location && (
            <div className="sc-char-chip location">
              <span>{location.emoji || '📍'}</span>
              <span>{location.name}</span>
            </div>
          )}
        </div>
      )}

      <div className="sc-meta">
        {story.options?.childAge && <span className="sc-meta-item">👶 {story.options.childAge} yaş</span>}
        {story.options?.duration && (
          <span className="sc-meta-item">
            {story.options.duration === 'short' ? '⚡ Kısa' : story.options.duration === 'medium' ? '📖 Orta' : '📚 Uzun'}
          </span>
        )}
        {story.viewCount > 0 && <span className="sc-meta-item">👁 {story.viewCount}</span>}
      </div>

      <div className="sc-rating">
        <span className="sc-rating-label">
          {ratingLoading ? 'Kaydediliyor...' : rating ? `Puanın: ${rating}/5 ` : 'Hikayeyi puanla: '}
        </span>
        <StarRating value={rating} onChange={handleRate} />
      </div>

      <div className="sc-actions">
        <button className="btn btn-primary sc-btn" onClick={() => onRead(story._id)}>📖 Oku</button>
        <button className={`btn sc-btn ${isPublic ? 'btn-outline' : 'btn-gold'}`}
          onClick={handlePublish} disabled={publishing}>
          {publishing ? '⏳' : isPublic ? '🔒 Gizle' : '🌍 Paylaş'}
        </button>
      </div>
    </div>
  );
}

export default function MyStories() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
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
              <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

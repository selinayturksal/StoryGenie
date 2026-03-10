import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Explore.css';

function CommunityStoryCard({ story, onRate, lang }) {
  const [userRating, setUserRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [rated, setRated] = useState(false);

  const chars = story.options?.characters || [];
  const date = new Date(story.createdAt).toLocaleDateString(
    lang === 'tr' ? 'tr-TR' : 'en-US',
    { month: 'short', year: 'numeric' }
  );

  const handleRate = async (val) => {
    setUserRating(val);
    setRated(true);
    await onRate(story._id, val);
  };

  return (
    <div className="explore-card animate-fadeIn">
      {/* Top */}
      <div className="ec-top">
        <div className="ec-author">
          <div className="ec-avatar">{story.author?.username?.[0]?.toUpperCase() || '?'}</div>
          <div>
            <span className="ec-username">{story.author?.username}</span>
            <span className="ec-date">{date}</span>
          </div>
        </div>
        <div className="ec-community-rating">
          <span className="ec-star">★</span>
          <span>{story.communityAverageRating > 0 ? story.communityAverageRating.toFixed(1) : '—'}</span>
          <span className="ec-rating-count">({story.communityRatings?.length || 0})</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="ec-title">{story.title}</h3>

      {/* Characters strip */}
      {chars.length > 0 && (
        <div className="ec-chars">
          {chars.slice(0, 4).map((c, i) => (
            <div key={i} className="ec-char" title={c.name}>
              <img src={`/assets/characters/${c.imagePath?.split('/').pop() || ''}`}
                alt={c.name} onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
              <span className="ec-char-emoji" style={{ display:'none' }}>👤</span>
            </div>
          ))}
          {chars.length > 4 && <span className="ec-more">+{chars.length - 4}</span>}
        </div>
      )}

      {/* Meta */}
      <div className="ec-meta">
        {story.options?.childAge && <span className="ec-tag">👶 {story.options.childAge} yaş</span>}
        {story.options?.storyLanguage && (
          <span className="ec-tag">{story.options.storyLanguage === 'tr' ? '🇹🇷' : '🇬🇧'}</span>
        )}
        {story.viewCount > 0 && <span className="ec-tag">👁 {story.viewCount}</span>}
      </div>

      {/* Rate it */}
      <div className="ec-rate">
        <span className="ec-rate-label">{rated ? '✓ Puanlandı!' : 'Puan ver:'}</span>
        <div className="star-rating">
          {[1,2,3,4,5].map(s => (
            <button key={s} type="button"
              className={`star ${s <= (hover || userRating) ? 'filled' : ''}`}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => handleRate(s)}
              disabled={rated}>★</button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Explore() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterAge, setFilterAge] = useState('');
  const [filterLang, setFilterLang] = useState('');

  const fetchStories = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      let url = `/stories/explore?page=${p}&limit=12`;
      if (filterAge) url += `&ageGroup=${filterAge}`;
      if (filterLang) url += `&language=${filterLang}`;
      const res = await api.get(url);
      setStories(res.data.stories);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [filterAge, filterLang]);

  useEffect(() => { fetchStories(page); }, [page, fetchStories]);

  const handleRate = async (id, rating) => {
    if (!user) { navigate('/login'); return; }
    try { await api.post(`/stories/${id}/community-rating`, { rating }); } catch (e) {}
  };

  return (
    <div className="explore-page">
      <div className="container">
        {/* Header */}
        <div className="exp-header animate-fadeIn">
          <h1 className="exp-title">{t.explore.title}</h1>
          <p className="exp-subtitle">{t.explore.subtitle}</p>
        </div>

        {/* Filters */}
        <div className="exp-filters animate-fadeIn">
          <select className="filter-select" value={filterAge} onChange={e => { setFilterAge(e.target.value); setPage(1); }}>
            <option value="">{t.explore.allAges}</option>
            {[2,3,4,5,6,7,8,9,10,11,12].map(a => (
              <option key={a} value={a}>{a} yaş</option>
            ))}
          </select>
          <select className="filter-select" value={filterLang} onChange={e => { setFilterLang(e.target.value); setPage(1); }}>
            <option value="">{t.explore.allLangs}</option>
            <option value="tr">🇹🇷 Türkçe</option>
            <option value="en">🇬🇧 English</option>
          </select>
        </div>

        {loading && <div className="exp-loading"><div className="spinner" /></div>}
        {error && !loading && <div className="exp-error">{error}</div>}

        {!loading && stories.length === 0 && (
          <div className="exp-empty animate-fadeIn">
            <div className="exp-empty-icon">🌟</div>
            <h3>{t.explore.empty}</h3>
            <p>Henüz paylaşılan hikaye yok. İlk paylaşan sen ol!</p>
            {user && (
              <button className="btn btn-primary" onClick={() => navigate('/')}>
                ✨ Hikaye Oluştur
              </button>
            )}
          </div>
        )}

        {!loading && stories.length > 0 && (
          <div className="exp-grid">
            {stories.map(story => (
              <CommunityStoryCard
                key={story._id} story={story}
                onRate={handleRate} lang={lang}
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

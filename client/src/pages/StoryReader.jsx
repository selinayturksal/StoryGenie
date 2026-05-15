import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Explore.css';

function CommunityStoryCard({ story, onRate, lang }) {
  const [liked, setLiked]       = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [rated, setRated]       = useState(false);

  const chars    = story.options?.characters || [];
  const location = story.options?.location;
  const locationFile = location?.imagePath?.split('/').pop() || '';

  // Görsel: önce ilk karakter, yoksa mekan
  const firstCharFile = chars[0]?.imagePath?.split('/').pop() || '';


  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return lang === 'tr' ? 'Bugün' : 'Today';
    if (days === 1) return lang === 'tr' ? '1 gün önce' : '1 day ago';
    if (days < 7)  return lang === 'tr' ? `${days} gün önce` : `${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks === 1) return lang === 'tr' ? '1 hafta önce' : '1 week ago';
    return lang === 'tr' ? `${weeks} hafta önce` : `${weeks} weeks ago`;
  };

  const getBadge = () => {
    const days = Math.floor((Date.now() - new Date(story.createdAt).getTime()) / 86400000);
    if (days <= 3) return { label: lang === 'tr' ? '⭐ Yeni' : '⭐ New', cls: 'badge--new' };
    if (story.viewCount > 200) return { label: lang === 'tr' ? '📖 Çok Okunan' : '📖 Popular', cls: 'badge--read' };
    if (story.communityAverageRating >= 4) return { label: lang === 'tr' ? '🏆 Editör Seçkisi' : '🏆 Editor Pick', cls: 'badge--editor' };
    if (likeCount > 30) return { label: lang === 'tr' ? '🔥 Popüler' : '🔥 Trending', cls: 'badge--popular' };
    return null;
  };

  const badge = getBadge();

  const handleRate = async (val) => {
    setUserRating(val); setRated(true);
    await onRate(story._id, val);
  };

  const durationLabel = (d) => {
    if (d === 'short') return lang === 'tr' ? 'Kısa' : 'Short';
    if (d === 'long')  return lang === 'tr' ? 'Uzun' : 'Long';
    return lang === 'tr' ? 'Orta' : 'Medium';
  };

  return (
    <div className="ec-card animate-fadeIn">

      {/* ── GÖRSEL ── */}
      <div className="ec-cover">
        {/* Mekan arka plan */}
        {locationFile && (
          <div className="ec-cover-bg"
            style={{ backgroundImage: `url('/assets/locations/${locationFile}')` }} />
        )}
        {/* Karakterler */}
        <div className="ec-cover-chars" style={{ '--char-count': chars.length || 1 }}>
          {chars.map((c, i) => {
            const file = c.imagePath?.split('/').pop() || '';
            return (
              <div key={i} className="ec-cover-char">
                <img src={`/assets/characters/${file}`} alt={c.name || ''}
                  onError={e => { e.target.style.display = 'none'; }} />
              </div>
            );
          })}
        </div>

        {/* Sol üst badge */}
        {badge && <span className={`ec-badge ${badge.cls}`}>{badge.label}</span>}

        {/* Sağ üst beğeni */}
        <button className="ec-like-btn" onClick={() => setLiked(l => !l)}>
          <span>{liked ? '❤️' : '🤍'}</span>
          <span>{likeCount + (liked ? 1 : 0)}</span>
        </button>
      </div>

      {/* ── BİLGİ ── */}
      <div className="ec-body">

        {/* Yazar + zaman */}
        <div className="ec-author-row">
          <div className="ec-avatar" style={{ background: story.author?.avatarBg || 'rgb(10,15,60)' }}>
            {story.author?.avatar && story.author.avatar.length > 0
              ? story.author.avatar.startsWith('/')
                ? <img src={story.author.avatar} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} />
                : <span style={{fontSize:'1rem',lineHeight:1}}>{story.author.avatar}</span>
              : <span>{story.author?.username?.[0]?.toUpperCase() || '?'}</span>}
          </div>
          <span className="ec-username">{story.author?.username}</span>
          <span className="ec-time">{timeAgo(story.createdAt)}</span>
        </div>

        {/* Başlık */}
        <h3 className="ec-title">{story.title}</h3>

        {/* Kısa açıklama — hikayenin ilk cümlesi */}
        {story.fullText && (
          <p className="ec-excerpt">
            {story.fullText.split('.')[0].slice(0, 80)}{story.fullText.length > 80 ? '...' : ''}
          </p>
        )}

        {/* Meta */}
        <div className="ec-meta-row">
          {story.options?.childAge && (
            <span className="ec-meta">😊 {story.options.childAge} {lang === 'tr' ? 'yaş' : 'yrs'}</span>
          )}
          {story.options?.duration && (
            <span className="ec-meta">⏳ {durationLabel(story.options.duration)}</span>
          )}
          {story.viewCount > 0 && (
            <span className="ec-meta">👁 {story.viewCount}</span>
          )}
        </div>

        {/* Alt aksiyon */}
        <div className="ec-footer">
          <button className="ec-heart-btn" onClick={async () => {
            if (liked) return;
            setLiked(true);
            setLikeCount(c => c + 1);
            await onRate(story._id, 5);
          }}>
            <span>{liked ? '❤️' : '🤍'}</span>
            <span>{likeCount}</span>
          </button>
          <button className="ec-read-btn" onClick={() => onRate(story._id, 0, true)}>
            {lang === 'tr' ? 'Oku' : 'Read'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Explore() {
  const { t, lang } = useLang();
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const [stories, setStories]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterTab, setFilterTab]   = useState('all'); // all | new | mostRead | topRated

  const fetchStories = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      let url = `/stories/explore?page=${p}&limit=12`;
      const res = await api.get(url);
      let data = res.data.stories;

      if (filterTab === 'new')      data = [...data].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (filterTab === 'mostRead') data = [...data].sort((a,b) => (b.viewCount||0) - (a.viewCount||0));
      if (filterTab === 'topRated') data = [...data].sort((a,b) => (b.communityAverageRating||0) - (a.communityAverageRating||0));

      setStories(data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [filterTab]);

  useEffect(() => { fetchStories(page); }, [page, fetchStories]);

  const handleRate = async (id, rating, read = false) => {
    if (read) { navigate(`/story/${id}`); return; }
    if (!user) { navigate('/login'); return; }
    try { await api.post(`/stories/${id}/community-rating`, { rating }); } catch (e) {}
  };

  const tabs = [
    { key: 'all',      icon: '⊞', label: lang === 'tr' ? 'Tümü'          : 'All'        },
    { key: 'new',      icon: '🕐', label: lang === 'tr' ? 'En Yeni'       : 'Newest'     },
    { key: 'mostRead', icon: '👁', label: lang === 'tr' ? 'En Çok Okunan' : 'Most Read'  },
    { key: 'topRated', icon: '❤️', label: lang === 'tr' ? 'En Çok Beğenilen' : 'Top Rated' },
  ];

  return (
    <div className="explore-page">
      <div className="container">

        {/* Header */}
        <div className="exp-header animate-fadeIn">
          <h1 className="exp-title">{t.explore?.title || 'Keşfet'}</h1>
          <p className="exp-subtitle">{t.explore?.subtitle || 'Topluluktan hikayeler'}</p>
        </div>

        {/* Tab filtreler + paylaş butonu */}
        <div className="exp-toolbar animate-fadeIn">
          <div className="exp-tabs">
            {tabs.map(tab => (
              <button key={tab.key}
                className={`exp-tab ${filterTab === tab.key ? 'active' : ''}`}
                onClick={() => { setFilterTab(tab.key); setPage(1); }}>
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
          {user && (
            <button className="exp-share-btn" onClick={() => navigate('/')}>
              + {lang === 'tr' ? 'Hikaye Paylaş' : 'Share Story'}
            </button>
          )}
        </div>

        {loading && <div className="exp-loading"><div className="spinner" /></div>}
        {error && !loading && <div className="exp-error">{error}</div>}

        {!loading && stories.length === 0 && (
          <div className="exp-empty animate-fadeIn">
            <div className="exp-empty-icon">🌟</div>
            <h3>{t.explore?.empty || 'Henüz hikaye yok'}</h3>
            <p>{lang === 'tr' ? 'Henüz paylaşılan hikaye yok. İlk paylaşan sen ol!' : 'No shared stories yet. Be the first!'}</p>
            {user && (
              <button className="btn btn-primary" onClick={() => navigate('/')}>
                ✨ {lang === 'tr' ? 'Hikaye Oluştur' : 'Create Story'}
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
          <div className="exp-pagination">
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
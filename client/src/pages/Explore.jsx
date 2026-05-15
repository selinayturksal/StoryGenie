import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Explore.css';

function CommunityStoryCard({ story, onRate, onLike, lang }) {
  const [liked, setLiked]         = useState(false);
  const [likeCount, setLikeCount] = useState(story.communityRatings?.length || 0);
  const [userRating, setUserRating] = useState(0);
  const [rated, setRated]         = useState(false);

  const chars       = story.options?.characters || [];
  const location    = story.options?.location;
  const locationFile = location?.imagePath?.split('/').pop() || '';

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
    if (days <= 3)                           return { label: lang === 'tr' ? '⭐ Yeni' : '⭐ New', cls: 'badge--new' };
    if (story.viewCount > 200)               return { label: lang === 'tr' ? '📖 Çok Okunan' : '📖 Popular', cls: 'badge--read' };
    if (story.communityAverageRating >= 4)   return { label: lang === 'tr' ? '🏆 Editör Seçkisi' : '🏆 Editor Pick', cls: 'badge--editor' };
    if (likeCount > 30)                      return { label: lang === 'tr' ? '🔥 Popüler' : '🔥 Trending', cls: 'badge--popular' };
    return null;
  };
  const badge = getBadge();

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikeCount(c => c + 1);
    await onLike(story._id);
  };

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
      <div className="ec-cover">
        {locationFile && (
          <div className="ec-cover-bg"
            style={{ backgroundImage: `url('/assets/locations/${locationFile}')` }} />
        )}
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
        {badge && <span className={`ec-badge ${badge.cls}`}>{badge.label}</span>}
        <button className="ec-like-btn" onClick={handleLike}>
          <span>{liked ? '❤️' : '🤍'}</span>
          <span>{likeCount}</span>
        </button>
      </div>

      <div className="ec-body">
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

        <h3 className="ec-title">{story.title}</h3>

        <div className="ec-meta-row">
          {story.options?.childAge && (
            <span className="ec-meta">{story.options.childAge <= 4 ? '🍼' : story.options.childAge <= 7 ? '🧒' : '👦'} {lang === 'tr' ? story.options.childAge + ' yaş' : 'Age ' + story.options.childAge}</span>
          )}
          {story.options?.duration && (
            <span className="ec-meta">⏳ {durationLabel(story.options.duration)}</span>
          )}
          {story.viewCount > 0 && (
            <span className="ec-meta">👁 {story.viewCount}</span>
          )}
        </div>

        <div className="ec-footer">
          <button className="ec-heart-btn" onClick={handleLike}>
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

  // Sıralama + Filtreler
  const [sortBy, setSortBy]         = useState('new');      // new | liked | mostRead
  const [filterAge, setFilterAge]   = useState('');
  const [filterLang, setFilterLang] = useState('');
  const [showFilters, setShowFilters]     = useState(false);
  const [showSort, setShowSort]           = useState(false);
  const [filterDuration, setFilterDuration] = useState('');

  const fetchStories = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      let url = `/stories/explore?page=${p}&limit=12`;
      if (filterAge)  url += `&ageGroup=${filterAge}`;
      if (filterLang) url += `&language=${filterLang}`;
      const res = await api.get(url);
      let data = res.data.stories;

      if (sortBy === 'new')      data = [...data].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (sortBy === 'liked')    data = [...data].sort((a,b) => (b.communityRatings?.length||0) - (a.communityRatings?.length||0));
      if (sortBy === 'mostRead') data = [...data].sort((a,b) => (b.viewCount||0) - (a.viewCount||0));
      if (filterDuration)        data = data.filter(s => s.options?.duration === filterDuration);

      setStories(data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [sortBy, filterAge, filterLang, filterDuration]);

  useEffect(() => { fetchStories(page); }, [page, fetchStories]);

  const handleRate = async (id, rating, read = false) => {
    if (read) { navigate(`/story/${id}`); return; }
    if (!user) { navigate('/login'); return; }
    try { await api.post(`/stories/${id}/community-rating`, { rating }); } catch (e) {}
  };

  const handleLike = async (id) => {
    if (!user) { navigate('/login'); return; }
    try { await api.post(`/stories/${id}/community-rating`, { rating: 5 }); } catch (e) {}
  };

  // sortBy 'all' iken sıralama yok
  const sortOptions = [
    { key: 'new',      label: lang === 'tr' ? 'En Yeni' : 'Newest' },
    { key: 'liked',    label: lang === 'tr' ? 'En Beğenilen' : 'Most Liked' },
    { key: 'mostRead', label: lang === 'tr' ? 'En Çok Okunan' : 'Most Read' },
  ];

  return (
    <div className="explore-page">
      <div className="container">

        <div className="exp-header animate-fadeIn">
          <h1 className="exp-title">{t.explore?.title || 'Paylaşılan Hikayeler'}</h1>
          <p className="exp-subtitle">{t.explore?.subtitle || 'Topluluktan hikayeler'}</p>
        </div>

        {/* Toolbar */}
        <div className="exp-toolbar animate-fadeIn">
          <div className="exp-toolbar-left">
            {/* Tümü */}
            <button className={`exp-tab ${sortBy === 'all' ? 'active' : ''}`}
              onClick={() => { setSortBy('all'); setPage(1); }}>
              ⊞ {lang === 'tr' ? 'Tümü' : 'All'}
            </button>

            {/* Sırala */}
            <div className="exp-dropdown-wrap">
              <button className={`exp-tab ${['new','liked','mostRead'].includes(sortBy) ? 'active' : ''}`}
                onClick={() => { setShowSort(s => !s); setShowFilters(false); }}>
                ↕ {lang === 'tr' ? 'Sırala' : 'Sort'}
                {['new','liked','mostRead'].includes(sortBy) && (
                  <span className="exp-active-label"> · {sortOptions.find(o => o.key === sortBy)?.label}</span>
                )}
              </button>
              {showSort && (
                <div className="exp-dropdown exp-dropdown--right">
                  {sortOptions.map(opt => (
                    <button key={opt.key}
                      className={`exp-dropdown-item ${sortBy === opt.key ? 'active' : ''}`}
                      onClick={() => { setSortBy(opt.key); setShowSort(false); setPage(1); }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filtrele */}
            <div className="exp-dropdown-wrap">
              <button className={`exp-tab ${showFilters ? 'active' : ''}`}
                onClick={() => { setShowFilters(s => !s); setShowSort(false); }}>
                🎛 {lang === 'tr' ? 'Filtrele' : 'Filter'}
                {(filterAge || filterLang || filterDuration) && <span className="exp-filter-dot" />}
              </button>
              {showFilters && (
                <div className="exp-dropdown exp-dropdown--filter exp-dropdown--right">
                  {/* Yaş */}
                  <div className="exp-dropdown-group">
                    <span className="exp-dropdown-label">{lang === 'tr' ? 'Yaş' : 'Age'}</span>
                    <div className="exp-dropdown-row">
                      {['2-3','4-5','6-7','8-9','10+'].map((l,i) => {
                        const vals = ['3','5','7','9','11'];
                        return (
                          <button key={l} className={`exp-filter-btn ${filterAge===vals[i]?'active':''}`}
                            onClick={()=>{setFilterAge(filterAge===vals[i]?'':vals[i]);setPage(1);}}>
                            {l}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {/* Süre */}
                  <div className="exp-dropdown-group">
                    <span className="exp-dropdown-label">{lang === 'tr' ? 'Süre' : 'Duration'}</span>
                    <div className="exp-dropdown-row">
                      {[
                        {v:'short', l:lang==='tr'?'Kısa':'Short'},
                        {v:'medium',l:lang==='tr'?'Orta':'Medium'},
                        {v:'long',  l:lang==='tr'?'Uzun':'Long'},
                      ].map(({v,l})=>(
                        <button key={v} className={`exp-filter-btn ${filterDuration===v?'active':''}`}
                          onClick={()=>{setFilterDuration(filterDuration===v?'':v);setPage(1);}}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Dil */}
                  <div className="exp-dropdown-group">
                    <span className="exp-dropdown-label">{lang === 'tr' ? 'Dil' : 'Language'}</span>
                    <div className="exp-dropdown-row">
                      <button className={`exp-filter-btn ${filterLang==='tr'?'active':''}`}
                        onClick={()=>{setFilterLang(filterLang==='tr'?'':'tr');setPage(1);}}>🇹🇷 TR</button>
                      <button className={`exp-filter-btn ${filterLang==='en'?'active':''}`}
                        onClick={()=>{setFilterLang(filterLang==='en'?'':'en');setPage(1);}}>🇬🇧 EN</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hikaye Paylaş — sağda */}
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
                onRate={handleRate}
                onLike={handleLike}
                lang={lang}
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
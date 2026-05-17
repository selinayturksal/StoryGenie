import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Favorites.css';

export default function Favorites() {
  const { lang }  = useLang();
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [stories, setStories]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFavorites = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/favorites?page=${p}&limit=12`);
      setStories(res.data.stories);
      setTotalPages(res.data.pagination.totalPages);
    } catch (e) {
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFavorites(page); }, [page, fetchFavorites]);

  const handleRemove = async (id) => {
    try {
      await api.delete(`/favorites/${id}`);
      setStories(prev => prev.filter(s => s._id !== id));
    } catch (e) {}
  };

  const cleanMd = (text = '') =>
    text.replace(/^#{1,6}\s*/gm, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').trim();

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return lang === 'tr' ? 'Bugün' : 'Today';
    if (days === 1) return lang === 'tr' ? '1 gün önce' : '1 day ago';
    if (days < 7)  return lang === 'tr' ? `${days} gün önce` : `${days} days ago`;
    const weeks = Math.floor(days / 7);
    return lang === 'tr' ? `${weeks} hafta önce` : `${weeks} weeks ago`;
  };

  return (
    <div className="fav-page">
      <div className="container">

        <div className="fav-header animate-fadeIn">
          <h1 className="fav-title">🔖 {lang === 'tr' ? 'Favorilerim' : 'My Favorites'}</h1>
          <p className="fav-subtitle">
            {lang === 'tr' ? 'Kaydettiğin hikayeler burada.' : 'Stories you saved appear here.'}
          </p>
        </div>

        {loading && <div className="fav-loading"><div className="spinner" /></div>}

        {!loading && stories.length === 0 && (
          <div className="fav-empty animate-fadeIn">
            <div className="fav-empty-icon">🔖</div>
            <h3>{lang === 'tr' ? 'Henüz favori yok' : 'No favorites yet'}</h3>
            <p>{lang === 'tr' ? 'Paylaşılan hikayelerden beğendiklerini kaydet!' : 'Save stories you like from Shared Stories!'}</p>
            <button className="btn btn-primary" onClick={() => navigate('/explore')}>
              {lang === 'tr' ? '✨ Hikayelere Gözat' : '✨ Browse Stories'}
            </button>
          </div>
        )}

        {!loading && stories.length > 0 && (
          <div className="exp-grid">
            {stories.map(story => {
              const chars       = story.options?.characters || [];
              const location    = story.options?.location;
              const locationFile = location?.imagePath?.split('/').pop() || '';

              return (
                <div key={story._id} className="ec-card animate-fadeIn">
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
                    <button className="ec-fav-btn ec-fav-btn--active"
                      onClick={() => handleRemove(story._id)}
                      title={lang === 'tr' ? 'Favorilerden çıkar' : 'Remove from favorites'}>
                      🔖
                    </button>
                  </div>

                  <div className="ec-body">
                    <div className="ec-author-row">
                      <div className="ec-avatar"
                        style={{ background: story.isAnonymized ? '#9b9b9b' : (story.author?.avatarBg || 'rgb(10,15,60)') }}>
                        {story.isAnonymized
                          ? <span style={{fontSize:'1.1rem',lineHeight:1}}>👤</span>
                          : story.author?.avatar?.startsWith('/')
                            ? <img src={story.author.avatar} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} />
                            : <span>{story.author?.username?.[0]?.toUpperCase() || '?'}</span>}
                      </div>
                      <span className="ec-username">
                        {story.isAnonymized ? 'Anonim' : story.author?.username}
                      </span>
                      <span className="ec-time">{timeAgo(story.createdAt)}</span>
                    </div>

                    <h3 className="ec-title">{cleanMd(story.title)}</h3>
                    <div className="ec-spacer" />

                    <div className="ec-footer">
                      <button className="ec-read-btn" onClick={() => navigate(`/story/${story._id}`)}>
                        {lang === 'tr' ? 'Oku' : 'Read'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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

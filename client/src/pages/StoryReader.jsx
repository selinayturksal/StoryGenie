import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import BookViewer from '../components/BookViewer';
import api from '../services/api';
import './StoryReader.css';

export default function StoryReader() {
  const { id } = useParams();
  const { t, lang } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [ratingDone, setRatingDone] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    api.get(`/stories/${id}`)
      .then(res => {
        setStory(res.data.story);
        setRating(res.data.story.rating || 0);
        setIsPublic(res.data.story.isPublic);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const isOwner = user && story && story.author?._id === user.id;

  const handleRate = async (val) => {
    if (!isOwner) return;
    setRating(val); setRatingDone(true);
    try { await api.patch(`/stories/${id}/rating`, { rating: val }); } catch (e) {}
  };

  const handleTogglePublish = async () => {
    setPublishing(true);
    try {
      const res = await api.patch(`/stories/${id}/publish`, { isPublic: !isPublic });
      setIsPublic(res.data.story.isPublic);
    } catch (e) {}
    finally { setPublishing(false); }
  };

  if (loading) return (
    <div className="reader-page">
      <div style={{ display:'flex', justifyContent:'center', padding:'80px' }}>
        <div className="spinner" />
      </div>
    </div>
  );

  if (error) return (
    <div className="reader-page">
      <div className="container" style={{ textAlign:'center', padding:'60px' }}>
        <p style={{ color:'var(--clr-rose)', fontWeight:600, marginBottom:16 }}>{error}</p>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>← Geri</button>
      </div>
    </div>
  );

  if (!story) return null;

  const chars = (story.options?.characters || []).map(c => ({
    ...c,
    name: { tr: c.name, en: c.name },
    file: c.imagePath?.split('/').pop() || '',
  }));

  const location = story.options?.location ? {
    ...story.options.location,
    name: { tr: story.options.location.name, en: story.options.location.name },
    file: story.options.location.imagePath?.split('/').pop() || '',
  } : null;

  return (
    <div className="reader-page">
      <div className="container">
        {/* Back button */}
        <button className="reader-back" onClick={() => navigate(-1)}>
          ← Geri
        </button>

        {/* Book viewer */}
        <BookViewer
          pages={story.pages?.length > 0 ? story.pages : [{ pageNumber:1, content: story.fullText }]}
          title={story.title}
          characters={chars}
          location={location}
          lang={story.options?.storyLanguage || lang}
          t={t}
          onSave={null}
          saving={false}
          saved={true}
        />

        {/* Owner actions */}
        {isOwner && (
          <div className="reader-actions animate-fadeIn">
            {/* Rating */}
            <div className="reader-rating">
              <span className="reader-rating-label">
                {ratingDone ? `✓ Puanın: ${rating}/5` : 'Bu hikayeyi puanla:'}
              </span>
              <div className="star-rating">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button"
                    className={`star ${s <= (hover || rating) ? 'filled' : ''}`}
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => handleRate(s)}>★</button>
                ))}
              </div>
            </div>

            {/* Publish toggle */}
            <button
              className={`btn ${isPublic ? 'btn-outline' : 'btn-gold'}`}
              onClick={handleTogglePublish}
              disabled={publishing}
            >
              {publishing ? '⏳' : isPublic ? '🔒 Gizli Yap' : '🌍 Herkesle Paylaş'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

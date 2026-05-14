import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './StoryReader.css';

export default function StoryReader() {
  const { id }      = useParams();
  const { t, lang } = useLang();
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const [story, setStory]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [rating, setRating]       = useState(0);
  const [hover, setHover]         = useState(0);
  const [ratingDone, setRatingDone] = useState(false);
  const [isPublic, setIsPublic]   = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Kitap state
  const [currentPage, setCurrentPage] = useState(0);
  const [flipping, setFlipping]       = useState(false);
  const [flipDir, setFlipDir]         = useState('next');
  const [speaking, setSpeaking]       = useState(false);
  const [paused, setPaused]           = useState(false);
  const [readAll, setReadAll]         = useState(false);
  const utteranceRef                  = useRef(null);

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

  const pages      = story?.pages?.length > 0
    ? story.pages
    : story ? [{ pageNumber: 1, content: story.fullText }] : [];

  const chars = (story?.options?.characters || []).map(c => ({
    ...c,
    name: { tr: c.name, en: c.name },
    file: c.imagePath?.split('/').pop() || '',
  }));

  const location = story?.options?.location ? {
    ...story.options.location,
    name: { tr: story.options.location.name, en: story.options.location.name },
    file: story.options.location.imagePath?.split('/').pop() || '',
  } : null;

  const storyLang  = story?.options?.storyLanguage || lang;
  const totalPages = pages.length;
  const isFirst    = currentPage === 0;
  const isLast     = currentPage === totalPages - 1;

  // ── TTS ──
  useEffect(() => { if (!readAll) stopSpeech(); }, [currentPage]);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const stopSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false); setPaused(false); setReadAll(false);
  }, []);

  const speakText = useCallback((text, onEnd) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang  = storyLang === 'en' ? 'en-US' : 'tr-TR';
    utter.rate  = 0.82; utter.pitch = 1.0; utter.volume = 1.0;
    const go = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find(v => v.lang.startsWith(storyLang === 'en' ? 'en' : 'tr') && v.name.includes('Google')) ||
        voices.find(v => v.lang.startsWith(storyLang === 'en' ? 'en' : 'tr') && v.name.includes('Microsoft')) ||
        voices.find(v => v.lang.startsWith(storyLang === 'en' ? 'en' : 'tr') && v.localService) ||
        voices.find(v => v.lang.startsWith(storyLang === 'en' ? 'en' : 'tr'));
      if (preferred) utter.voice = preferred;
      utter.onstart = () => { setSpeaking(true); setPaused(false); };
      utter.onend   = () => { setSpeaking(false); setPaused(false); if (onEnd) onEnd(); };
      utter.onerror = () => { setSpeaking(false); setPaused(false); };
      utteranceRef.current = utter;
      window.speechSynthesis.speak(utter);
    };
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.onvoiceschanged = null; go(); };
    } else go();
  }, [storyLang]);

  const handleReadPage = useCallback(() => {
    if (speaking && !paused) { window.speechSynthesis.pause(); setPaused(true); return; }
    if (paused) { window.speechSynthesis.resume(); setPaused(false); return; }
    setReadAll(false);
    speakText(pages[currentPage]?.content || '');
  }, [speaking, paused, currentPage, pages, speakText]);

  const handleReadAll = useCallback(() => {
    if (speaking) { stopSpeech(); return; }
    setReadAll(true); setCurrentPage(0);
    const readPage = (idx) => {
      if (idx >= pages.length) { setReadAll(false); setSpeaking(false); return; }
      setCurrentPage(idx);
      speakText(pages[idx]?.content || '', () => setTimeout(() => readPage(idx + 1), 600));
    };
    setTimeout(() => readPage(0), 100);
  }, [speaking, pages, speakText, stopSpeech]);

  const playPageFlipSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const dur = 0.2, rate = ctx.sampleRate;
      const buf = ctx.createBuffer(1, rate * dur, rate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        const tt = i / rate;
        d[i] = (Math.random() * 2 - 1) * Math.exp(-tt * 18) * (1 - Math.exp(-tt * 220)) * 0.65;
      }
      const src = ctx.createBufferSource(); src.buffer = buf;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2800; bp.Q.value = 0.9;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.8, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      src.connect(bp); bp.connect(g); g.connect(ctx.destination);
      src.start(); src.stop(ctx.currentTime + dur);
      src.onended = () => ctx.close();
    } catch (e) {}
  }, []);

  const goTo = (dir) => {
    if (flipping) return;
    if (dir === 'next' && isLast) return;
    if (dir === 'prev' && isFirst) return;
    if (!readAll) stopSpeech();
    playPageFlipSound();
    setFlipDir(dir); setFlipping(true);
    setTimeout(() => { setCurrentPage(p => dir === 'next' ? p + 1 : p - 1); setFlipping(false); }, 500);
  };

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
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="spinner" />
      </div>
    </div>
  );

  if (error) return (
    <div className="reader-page">
      <div className="container" style={{ textAlign: 'center', padding: '60px' }}>
        <p style={{ color: 'var(--coral)', fontWeight: 600, marginBottom: 16 }}>{error}</p>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>← Geri</button>
      </div>
    </div>
  );

  if (!story) return null;

  return (
    <div className="sv-page sv-phase--reading">

      {/* Yıldız arka plan */}
      <div className="sv-bg">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="sv-star" style={{
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`, animationDuration: `${2 + Math.random() * 3}s`,
            width: `${4 + Math.random() * 6}px`, height: `${4 + Math.random() * 6}px`,
          }} />
        ))}
      </div>

      <div className="sv-reading animate-fadeIn">

        {/* ── ÜST BAR ── */}
        <div className="sv-topbar">
          <button className="sv-back" onClick={() => { stopSpeech(); navigate(-1); }}>
            ← {lang === 'tr' ? 'Geri' : 'Back'}
          </button>
          <span className="sv-topbar-title">{story.title}</span>
          {/* Owner aksiyonları */}
          {isOwner && (
            <div className="sv-top-actions">
              <button
                className={`sv-top-btn ${isPublic ? 'sv-top-btn--active' : ''}`}
                onClick={handleTogglePublish}
                disabled={publishing}
              >
                {publishing ? '⏳' : isPublic ? '🔒 Gizle' : '🌍 Paylaş'}
              </button>
            </div>
          )}
        </div>

        {/* ── SES ÇUBUĞU ── */}
        <div className="sv-tts-bar">
          <span className="sv-tts-icon">🔊</span>
          <span className="sv-tts-label">
            {speaking && !paused
              ? (lang === 'tr' ? 'Okunuyor...' : 'Reading...')
              : paused
              ? (lang === 'tr' ? 'Duraklatıldı' : 'Paused')
              : (lang === 'tr' ? 'Sesli Okuma' : 'Read Aloud')}
          </span>
          <div className={`sv-wave ${speaking && !paused ? 'sv-wave--active' : ''}`}>
            {[...Array(16)].map((_, i) => (
              <span key={i} className="sv-wave-bar"
                style={{ animationDelay: `${i * 0.06}s`, animationDuration: `${0.5 + (i % 4) * 0.15}s` }} />
            ))}
          </div>
          <div className="sv-tts-btns">
            <button className={`sv-tts-btn ${speaking && !paused ? 'active' : ''}`} onClick={handleReadPage}>
              {speaking && !paused ? '⏸' : '▶'}
              {lang === 'tr' ? (paused ? ' Devam' : ' Bu Sayfayı Oku') : (paused ? ' Resume' : ' Read Page')}
            </button>
            <button className={`sv-tts-btn ${readAll ? 'teal' : ''}`} onClick={handleReadAll}>
              {readAll ? '⏹' : '📖'}
              {lang === 'tr' ? (readAll ? ' Durdur' : ' Tümünü Oku') : (readAll ? ' Stop' : ' Read All')}
            </button>
            {(speaking || paused) && (
              <button className="sv-tts-btn coral" onClick={stopSpeech}>
                ⏹ {lang === 'tr' ? 'Durdur' : 'Stop'}
              </button>
            )}
          </div>
        </div>

        {/* ── KİTAP ── */}
        <div className="sv-book-wrap">
          <div className="sv-leaf sv-leaf--left">🌿</div>
          <div className="sv-leaf sv-leaf--right">🌿</div>

          <button className={`sv-nav-btn sv-nav-btn--left ${isFirst ? 'sv-hidden' : ''}`}
            onClick={() => goTo('prev')} disabled={isFirst || flipping}>‹</button>

          <div className="sv-book">
            <div className="sv-book-binding" />
            <div className="sv-book-edge" />
            <div className="sv-corner sv-corner--tl" />
            <div className="sv-corner sv-corner--tr" />
            <div className="sv-corner sv-corner--bl" />
            <div className="sv-corner sv-corner--br" />

            {/* Sol sayfa — mekan + karakterler */}
            <div className="sv-page-left">
              {location && (
                <div className="sv-page-left-bg"
                  style={{ backgroundImage: `url('/assets/locations/${location.file}')` }} />
              )}
              <div className="sv-chars-fullheight" style={{ '--char-count': chars.length || 1 }}>
                {chars.map((c, i) => (
                  <div key={c.id || i} className="sv-char-full-item">
                    <img src={`/assets/characters/${c.file}`} alt={c.name?.tr || ''}
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                    <span className="sv-char-emoji-fallback" style={{ display: 'none' }}>{c.emoji || '👤'}</span>
                  </div>
                ))}
              </div>
              <div className="sv-spine" />
            </div>

            {/* Orta cilt */}
            <div className="sv-book-gutter" />

            {/* Sağ sayfa — metin */}
            <div className={`sv-page-right ${flipping ? `flip-${flipDir}` : ''}`}>
              <div className="sv-page-header">
                <span className="sv-page-num">
                  ⭐ {lang === 'tr' ? 'Sayfa' : 'Page'} {currentPage + 1} / {totalPages}
                </span>
              </div>
              <div className="sv-page-divider">
                <div className="sv-page-divider-line" />
                <span className="sv-page-divider-star">✦</span>
                <div className="sv-page-divider-line" />
              </div>
              <div className="sv-page-text">
                <p>{pages[currentPage]?.content}</p>
              </div>
            </div>
          </div>

          <button className={`sv-nav-btn sv-nav-btn--right ${isLast ? 'sv-hidden' : ''}`}
            onClick={() => goTo('next')} disabled={isLast || flipping}>›</button>

          <div className="sv-bookmark">🔖</div>
        </div>

        {/* Sayfa noktaları */}
        <div className="sv-nav">
          <div className="sv-dots">
            {pages.map((_, i) => (
              <button key={i}
                className={`sv-dot ${i === currentPage ? 'active' : ''} ${readAll && i === currentPage ? 'reading' : ''}`}
                onClick={() => { if (!flipping && !readAll) { setFlipDir(i > currentPage ? 'next' : 'prev'); setCurrentPage(i); } }}
              />
            ))}
          </div>
        </div>

        {/* Son sayfa + owner aksiyonları */}
        {isLast && (
          <div className="sv-finish-banner animate-fadeIn">
            <div className="sv-finish-left">
              <span className="sv-finish-emoji">🎉</span>
              <div className="sv-finish-text">
                <strong>{lang === 'tr' ? 'Hikaye bitti!' : 'Story complete!'}</strong>
                <span>{lang === 'tr' ? 'Harika bir okuma yaptın.' : 'Great reading!'}</span>
              </div>
            </div>
            <div className="sv-finish-right">
              <button className="sv-finish-btn sv-finish-btn--replay"
                onClick={() => { stopSpeech(); setCurrentPage(0); }}>
                🔄 {lang === 'tr' ? 'Tekrar Oku' : 'Read Again'}
              </button>
              {isOwner && (
                <div className="sr-owner-rating">
                  <span className="sr-rating-label">
                    {ratingDone ? `✓ ${rating}/5` : (lang === 'tr' ? 'Puanla:' : 'Rate:')}
                  </span>
                  <div className="sr-stars">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button"
                        className={`sr-star ${s <= (hover || rating) ? 'filled' : ''}`}
                        onMouseEnter={() => setHover(s)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => handleRate(s)}>★</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
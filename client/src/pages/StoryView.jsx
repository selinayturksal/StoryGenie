import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import './StoryView.css';

export default function StoryView() {
  const { state }    = useLocation();
  const navigate     = useNavigate();
  const { t, lang }  = useLang();

  // state'den hikaye verisi
  const story      = state?.story;
  const pages      = story?.pages || [];
  const characters = story?.characters || [];
  const location   = story?.location  || null;
  const onSave     = state?.onSave;

  // Aşamalar: 'intro' → 'opening' → 'reading'
  const [phase, setPhase]           = useState('intro');
  const [currentPage, setCurrentPage] = useState(0);
  const [flipping, setFlipping]     = useState(false);
  const [flipDir, setFlipDir]       = useState('next');
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);

  // TTS
  const [speaking, setSpeaking]     = useState(false);
  const [paused, setPaused]         = useState(false);
  const [readAll, setReadAll]       = useState(false);
  const utteranceRef                = useRef(null);

  const totalPages = pages.length;
  const isFirst    = currentPage === 0;
  const isLast     = currentPage === totalPages - 1;

  // Hikaye yoksa geri yönlendir
  useEffect(() => {
    if (!story) { navigate('/'); return; }
    // Giriş animasyonu → kitap açılışı
    const t1 = setTimeout(() => setPhase('opening'), 800);
    const t2 = setTimeout(() => setPhase('reading'), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => { if (!readAll) stopSpeech(); }, [currentPage]);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const stopSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false); setPaused(false);
    setReadAll(false);
  }, []);

  const speakText = useCallback((text, onEnd) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang  = lang === 'en' ? 'en-US' : 'tr-TR';
    utter.rate  = 0.88; utter.pitch = 1.05;

    const go = () => {
      const voices   = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.startsWith(lang === 'en' ? 'en' : 'tr') && v.localService)
                     || voices.find(v => v.lang.startsWith(lang === 'en' ? 'en' : 'tr'));
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
  }, [lang]);

  const handleReadPage = useCallback(() => {
    if (speaking && !paused) { window.speechSynthesis.pause(); setPaused(true); return; }
    if (paused) { window.speechSynthesis.resume(); setPaused(false); return; }
    setReadAll(false);
    speakText(pages[currentPage]?.content || '');
  }, [speaking, paused, currentPage, pages, speakText]);

  const handleReadAll = useCallback(() => {
    if (speaking) { stopSpeech(); return; }
    setReadAll(true);
    setCurrentPage(0);
    const readPage = (idx) => {
      if (idx >= pages.length) { setReadAll(false); setSpeaking(false); return; }
      setCurrentPage(idx);
      speakText(pages[idx]?.content || '', () => setTimeout(() => readPage(idx + 1), 600));
    };
    setTimeout(() => readPage(0), 100);
  }, [speaking, pages, speakText, stopSpeech]);

  const goTo = (dir) => {
    if (flipping) return;
    if (dir === 'next' && isLast) return;
    if (dir === 'prev' && isFirst) return;
    if (!readAll) stopSpeech();
    setFlipDir(dir);
    setFlipping(true);
    setTimeout(() => { setCurrentPage(p => dir === 'next' ? p + 1 : p - 1); setFlipping(false); }, 340);
  };

  const handleSave = async () => {
    if (saving || saved || !onSave) return;
    setSaving(true);
    try { await onSave(); setSaved(true); }
    catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  if (!story) return null;

  return (
    <div className={`sv-page sv-phase--${phase}`}>

      {/* ── YILDIZ ARKA PLAN ── */}
      <div className="sv-bg">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="sv-star" style={{
            left: `${Math.random() * 100}%`,
            top:  `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            width:  `${4 + Math.random() * 6}px`,
            height: `${4 + Math.random() * 6}px`,
          }} />
        ))}
      </div>

      {/* ── INTRO EKRANI ── */}
      {phase === 'intro' && (
        <div className="sv-intro">
          <div className="sv-intro-book">📖</div>
          <p className="sv-intro-text">
            {lang === 'tr' ? 'Hikaye hazırlanıyor...' : 'Preparing your story...'}
          </p>
        </div>
      )}

      {/* ── KİTAP AÇILIŞI ── */}
      {phase === 'opening' && (
        <div className="sv-opening">
          <div className="sv-book-open">
            <div className="sv-book-cover sv-book-left" />
            <div className="sv-book-cover sv-book-right" />
            <div className="sv-book-spine" />
          </div>
        </div>
      )}

      {/* ── OKUMA SAYFASI ── */}
      {phase === 'reading' && (
        <div className="sv-reading animate-fadeIn">

          {/* Geri butonu */}
          <button className="sv-back" onClick={() => { stopSpeech(); navigate('/'); }}>
            ← {lang === 'tr' ? 'Geri' : 'Back'}
          </button>

          {/* Hikaye başlığı */}
          <h1 className="sv-title">{story.title}</h1>

          {/* Karakterler — üstte boydan */}
          <div className="sv-chars-row">
            {characters.map((c, i) => (
              <div key={c.id || i} className="sv-char" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="sv-char-img-wrap">
                  <img
                    src={`/assets/characters/${c.file}`}
                    alt={c.name?.tr || c.name || ''}
                    onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}
                  />
                  <span style={{ display:'none', fontSize:'3rem' }}>{c.emoji}</span>
                </div>
                <span className="sv-char-name">{c.name?.tr || c.name}</span>
              </div>
            ))}
            {location && (
              <div className="sv-location">
                <img
                  src={`/assets/locations/${location.file}`}
                  alt={location.name?.tr || location.name || ''}
                  onError={e => { e.target.style.display='none'; }}
                />
                <span className="sv-char-name">{location.name?.tr || location.name}</span>
              </div>
            )}
          </div>

          {/* TTS Bar */}
          <div className="sv-tts-bar">
            <span className="sv-tts-icon">{speaking ? '🔊' : '🔈'}</span>
            <span className="sv-tts-label">
              {speaking && !paused
                ? (lang === 'tr' ? 'Okunuyor...' : 'Reading...')
                : paused
                ? (lang === 'tr' ? 'Duraklatıldı' : 'Paused')
                : (lang === 'tr' ? 'Sesli Okuma' : 'Read Aloud')}
            </span>
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
                <button className="sv-tts-btn coral" onClick={stopSpeech}>⏹ {lang === 'tr' ? 'Durdur' : 'Stop'}</button>
              )}
            </div>
          </div>

          {/* Kitap */}
          <div className="sv-book">
            {/* Sol sayfa */}
            <div className="sv-page-left">
              <div className="sv-page-ornament">✦</div>
              <div className="sv-page-chars">
                {characters.slice(0, 3).map((c, i) => (
                  <div key={c.id || i} className="sv-page-char">
                    <img
                      src={`/assets/characters/${c.file}`}
                      alt={c.name?.tr || c.name || ''}
                      onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}
                    />
                    <span style={{ display:'none', fontSize:'2rem' }}>{c.emoji}</span>
                    <span className="sv-page-char-name">{c.name?.tr || c.name}</span>
                  </div>
                ))}
              </div>
              {location && (
                <div className="sv-page-loc">
                  <span>{location.emoji}</span>
                  <span>{location.name?.tr || location.name}</span>
                </div>
              )}
              <div className="sv-page-ornament">✦</div>
              <div className="sv-spine" />
            </div>

            {/* Sağ sayfa */}
            <div className={`sv-page-right ${flipping ? `flip-${flipDir}` : ''}`}>
              <div className="sv-page-header">
                <span className="sv-page-num">
                  {lang === 'tr' ? 'Sayfa' : 'Page'} {currentPage + 1} / {totalPages}
                </span>
                <button
                  className={`sv-play-mini ${speaking && !paused ? 'playing' : ''}`}
                  onClick={handleReadPage}
                >
                  {speaking && !paused ? '⏸' : '▶'}
                </button>
              </div>
              <div className="sv-page-text">
                <p>{pages[currentPage]?.content}</p>
              </div>
              {/* Alt karakter şeridi */}
              <div className="sv-strip">
                {characters.map((c, i) => (
                  <div key={c.id || i} className="sv-strip-char" title={c.name?.tr || c.name}>
                    <img
                      src={`/assets/characters/${c.file}`}
                      alt={c.name?.tr || c.name || ''}
                      onError={e => { e.target.style.display='none'; }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigasyon */}
          <div className="sv-nav">
            <button className={`sv-nav-btn ${isFirst ? 'sv-hidden' : ''}`}
              onClick={() => goTo('prev')} disabled={isFirst || flipping}>‹</button>

            <div className="sv-dots">
              {pages.map((_, i) => (
                <button key={i}
                  className={`sv-dot ${i === currentPage ? 'active' : ''} ${readAll && i === currentPage ? 'reading' : ''}`}
                  onClick={() => { if (!flipping && !readAll) { setFlipDir(i > currentPage ? 'next' : 'prev'); setCurrentPage(i); } }}
                />
              ))}
            </div>

            <button className={`sv-nav-btn ${isLast ? 'sv-hidden' : ''}`}
              onClick={() => goTo('next')} disabled={isLast || flipping}>›</button>
          </div>

          {/* Son sayfa aksiyonları */}
          {isLast && (
            <div className="sv-actions animate-fadeIn">
              <button className="sv-action-btn sv-action-outline"
                onClick={() => { stopSpeech(); setCurrentPage(0); }}>
                🔄 {lang === 'tr' ? 'Tekrar Oku' : 'Read Again'}
              </button>
              {onSave && (
                <button className={`sv-action-btn ${saved ? 'sv-action-gold' : 'sv-action-primary'}`}
                  onClick={handleSave} disabled={saving || saved}>
                  {saving ? '⏳ ' : saved ? '✓ ' : '💾 '}
                  {saving ? (lang === 'tr' ? 'Kaydediliyor...' : 'Saving...')
                  : saved  ? (lang === 'tr' ? 'Kaydedildi!' : 'Saved!')
                           : (lang === 'tr' ? 'Hikayeyi Kaydet' : 'Save Story')}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

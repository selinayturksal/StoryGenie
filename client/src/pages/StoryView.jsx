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

  const playPageFlipSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const dur = 0.2, rate = ctx.sampleRate;
      const buf = ctx.createBuffer(1, rate * dur, rate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        const t = i / rate;
        d[i] = (Math.random() * 2 - 1) * Math.exp(-t * 18) * (1 - Math.exp(-t * 220)) * 0.65;
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

  const speakText = useCallback((text, onEnd) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === 'en' ? 'en-US' : 'tr-TR';
    utter.rate = 0.82; utter.pitch = 1.0; utter.volume = 1.0;
    const go = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find(v => v.lang.startsWith(lang === 'en' ? 'en' : 'tr') && v.name.includes('Google')) ||
        voices.find(v => v.lang.startsWith(lang === 'en' ? 'en' : 'tr') && v.name.includes('Microsoft')) ||
        voices.find(v => v.lang.startsWith(lang === 'en' ? 'en' : 'tr') && v.localService) ||
        voices.find(v => v.lang.startsWith(lang === 'en' ? 'en' : 'tr'));
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
    setReadAll(true); setCurrentPage(0);
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
    playPageFlipSound();
    setFlipDir(dir); setFlipping(true);
    setTimeout(() => { setCurrentPage(p => dir === 'next' ? p + 1 : p - 1); setFlipping(false); }, 500);
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
            <div className="sv-book-pages-edge" />
            <div className="sv-book-spine-open" />
            <div className="sv-book-cover-left" />
            <div className="sv-book-cover-right" />
          </div>
        </div>
      )}

      {/* ── OKUMA SAYFASI ── */}
      {phase === 'reading' && (
        <div className="sv-reading animate-fadeIn">

          <button className="sv-back" onClick={() => { stopSpeech(); navigate('/'); }}>
            ← {lang === 'tr' ? 'Geri' : 'Back'}
          </button>

          {/* Audio Bar */}
          <div className="sv-tts-bar">
            <span className="sv-tts-icon">🔊</span>
            <span className="sv-tts-label">
              {speaking && !paused ? (lang === 'tr' ? 'Okunuyor...' : 'Reading...')
                : paused ? (lang === 'tr' ? 'Duraklatıldı' : 'Paused')
                : (lang === 'tr' ? 'Sesli Okuma' : 'Read Aloud')}
            </span>
            <div className={`sv-wave ${speaking && !paused ? 'sv-wave--active' : ''}`}>
              {[...Array(16)].map((_, i) => (
                <span key={i} className="sv-wave-bar"
                  style={{ animationDelay: `${i * 0.06}s`,
                           animationDuration: `${0.5 + (i % 4) * 0.15}s` }} />
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
                <button className="sv-tts-btn coral" onClick={stopSpeech}>⏹ {lang === 'tr' ? 'Durdur' : 'Stop'}</button>
              )}
            </div>
          </div>

          {/* Kitap */}
          <div className="sv-book-wrap">
            <div className="sv-leaf sv-leaf--left">🌿</div>
            <div className="sv-leaf sv-leaf--right">🌿</div>

            <button className={`sv-nav-btn sv-nav-btn--left ${isFirst ? 'sv-hidden' : ''}`}
              onClick={() => goTo('prev')} disabled={isFirst || flipping}>‹</button>

            <div className="sv-book">
              {/* Cilt */}
              <div className="sv-book-binding" />
              <div className="sv-book-edge" />

              {/* Altın köşe süsleri */}
              <div className="sv-corner sv-corner--tl" />
              <div className="sv-corner sv-corner--tr" />
              <div className="sv-corner sv-corner--bl" />
              <div className="sv-corner sv-corner--br" />

              {/* Sol sayfa */}
              <div className="sv-page-left">
                <span className="sv-sparkle sv-sparkle--1">✦</span>
                <span className="sv-sparkle sv-sparkle--2">✦</span>

                <div className="sv-char-circle">
                  {characters[0] ? (
                    <>
                      <img src={`/assets/characters/${characters[0].file}`}
                        alt={characters[0].name?.tr || characters[0].name || ''}
                        onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                      <span style={{ display:'none', fontSize:'6rem', lineHeight:1 }}>{characters[0].emoji}</span>
                    </>
                  ) : <span style={{ fontSize:'6rem' }}>🧒</span>}
                </div>

                <h2 className="sv-book-title">{story.title}</h2>

                {location && (
                  <div className="sv-page-loc">
                    <span>{location.emoji}</span>
                    <span>{location.name?.tr || location.name}</span>
                  </div>
                )}

                <span className="sv-sparkle sv-sparkle--3">✦</span>
                <div className="sv-spine" />
              </div>

              {/* Orta cilt */}
              <div className="sv-book-gutter" />

              {/* Sağ sayfa */}
              <div className={`sv-page-right ${flipping ? `flip-${flipDir}` : ''}`}>
                <div className="sv-page-header">
                  <span className="sv-page-num">
                    ⭐ {lang === 'tr' ? 'Sayfa' : 'Page'} {currentPage + 1} / {totalPages}
                  </span>
                  <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                    <span className="sv-bookmark-icon">🔖</span>
                    <button className={`sv-play-mini ${speaking && !paused ? 'playing' : ''}`} onClick={handleReadPage}>
                      {speaking && !paused ? '⏸' : '▶'}
                    </button>
                  </div>
                </div>

                <div className="sv-page-divider">
                  <div className="sv-page-divider-line" />
                  <span className="sv-page-divider-star">✦</span>
                  <div className="sv-page-divider-line" />
                </div>

                <div className="sv-page-text">
                  <p>{pages[currentPage]?.content}</p>
                </div>

                <div className="sv-strip">
                  {characters.slice(0, 1).map((c, i) => (
                    <div key={c.id || i} className="sv-strip-char">
                      <img src={`/assets/characters/${c.file}`}
                        alt={c.name?.tr || c.name || ''}
                        onError={e => { e.target.style.display='none'; }} />
                    </div>
                  ))}
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
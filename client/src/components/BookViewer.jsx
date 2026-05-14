import React, { useState, useEffect, useRef, useCallback } from 'react';
import './BookViewer.css';

export default function BookViewer({ pages, title, characters, location, lang, t, onSave, saving, saved }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [flipping, setFlipping]       = useState(false);
  const [flipDir, setFlipDir]         = useState('next');
  const [speaking, setSpeaking]       = useState(false);
  const [paused, setPaused]           = useState(false);
  const [readAll, setReadAll]         = useState(false);
  const utteranceRef                  = useRef(null);
  const readAllPageRef                = useRef(0);

  const totalPages = pages.length;
  const isFirst    = currentPage === 0;
  const isLast     = currentPage === totalPages - 1;

  useEffect(() => { if (!readAll) stopSpeech(); }, [currentPage]);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const stopSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false); setPaused(false);
    setReadAll(false); readAllPageRef.current = 0;
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
    setReadAll(true); readAllPageRef.current = 0; setCurrentPage(0);
    const readPage = (idx) => {
      if (idx >= pages.length) { setReadAll(false); setSpeaking(false); return; }
      readAllPageRef.current = idx; setCurrentPage(idx);
      speakText(pages[idx]?.content || '', () => setTimeout(() => readPage(idx + 1), 600));
    };
    setTimeout(() => readPage(0), 100);
  }, [speaking, pages, speakText, stopSpeech]);

  const playPageFlipSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const dur = 0.18, rate = ctx.sampleRate;
      const buf = ctx.createBuffer(1, rate * dur, rate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        const t = i / rate;
        d[i] = (Math.random() * 2 - 1) * Math.exp(-t * 22) * (1 - Math.exp(-t * 180)) * 0.55;
      }
      const src = ctx.createBufferSource(); src.buffer = buf;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2800; bp.Q.value = 0.7;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 800;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.7, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      src.connect(hp); hp.connect(bp); bp.connect(g); g.connect(ctx.destination);
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

  const allChars = characters || [];

  return (
    <div className="bv-wrapper">
      <h2 className="bv-title">{title}</h2>

      {/* ── SES ÇUBUĞU ── */}
      <div className="bv-tts animate-fadeIn">
        <div className="bv-tts-info">
          <span>{speaking ? '🔊' : '🔈'}</span>
          <span className="bv-tts-label">
            {speaking && !paused
              ? (lang === 'tr' ? 'Okunuyor...' : 'Reading...')
              : paused
              ? (lang === 'tr' ? 'Duraklatıldı' : 'Paused')
              : (lang === 'tr' ? 'Sesli Okuma' : 'Read Aloud')}
          </span>
        </div>
        <div className="bv-tts-btns">
          <button className={`bv-tts-btn ${speaking && !paused ? 'active' : ''}`} onClick={handleReadPage}>
            {speaking && !paused ? '⏸' : '▶'}
            <span>{lang === 'tr' ? (paused ? 'Devam' : 'Bu Sayfayı Oku') : (paused ? 'Resume' : 'Read Page')}</span>
          </button>
          <button className={`bv-tts-btn ${readAll ? 'teal' : ''}`} onClick={handleReadAll}>
            {readAll ? '⏹' : '📖'}
            <span>{lang === 'tr' ? (readAll ? 'Durdur' : 'Tümünü Oku') : (readAll ? 'Stop' : 'Read All')}</span>
          </button>
          {(speaking || paused) && (
            <button className="bv-tts-btn coral" onClick={stopSpeech}>
              ⏹ <span>{lang === 'tr' ? 'Durdur' : 'Stop'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── KİTAP ── */}
      <div className="bv-book-wrap">
        <button className={`bv-nav-btn ${isFirst ? 'bv-hidden' : ''}`}
          onClick={() => goTo('prev')} disabled={isFirst || flipping}>‹</button>

        <div className="bv-book">
          {/* Sol sayfa — karakter & mekan */}
          <div className="bv-page bv-page--left">
            {location && (
              <div className="bv-page-bg"
                style={{ backgroundImage: `url('/assets/locations/${location.file}')` }} />
            )}
            <div className="bv-page-left-content">
              {location && (
                <div className="bv-loc-badge">
                  <span>{location.emoji}</span>
                  <span>{location.name?.[lang] || location.name?.tr || ''}</span>
                </div>
              )}
              <div className="bv-chars-grid">
                {allChars.slice(0, 4).map((c, i) => (
                  <div key={c.id || i} className="bv-char-item">
                    <div className="bv-char-img">
                      <img
                        src={`/assets/characters/${c.file}`}
                        alt={c.name?.[lang] || c.name?.tr || ''}
                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                      <span className="bv-char-fallback" style={{ display: 'none' }}>{c.emoji || '👤'}</span>
                    </div>
                    <span className="bv-char-name">{c.name?.[lang] || c.name?.tr || ''}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bv-spine" />
          </div>

          {/* Orta cilt */}
          <div className="bv-gutter" />

          {/* Sağ sayfa — metin */}
          <div className={`bv-page bv-page--right ${flipping ? `flip-${flipDir}` : ''}`}>
            <div className="bv-page-header">
              <span className="bv-page-num">
                {t?.story?.page || 'Sayfa'} {currentPage + 1} / {totalPages}
              </span>
              <button className={`bv-play-btn ${speaking && !paused ? 'playing' : ''}`} onClick={handleReadPage}>
                {speaking && !paused ? '⏸' : '▶'}
              </button>
            </div>
            <div className="bv-page-divider">
              <div className="bv-divider-line" /><span>✦</span><div className="bv-divider-line" />
            </div>
            <div className="bv-page-text">
              <p>{pages[currentPage]?.content}</p>
            </div>
          </div>
        </div>

        <button className={`bv-nav-btn ${isLast ? 'bv-hidden' : ''}`}
          onClick={() => goTo('next')} disabled={isLast || flipping}>›</button>
      </div>

      {/* ── SAYFA NOKTALARI ── */}
      <div className="bv-dots">
        {pages.map((_, i) => (
          <button key={i}
            className={`bv-dot ${i === currentPage ? 'active' : ''} ${readAll && i === currentPage ? 'reading' : ''}`}
            onClick={() => { if (!flipping && !readAll) { setFlipDir(i > currentPage ? 'next' : 'prev'); setCurrentPage(i); } }}
          />
        ))}
      </div>

      {/* ── SON SAYFA AKSİYONLARI ── */}
      {isLast && (
        <div className="bv-actions animate-fadeIn">
          <button className="bv-btn bv-btn--outline" onClick={() => { stopSpeech(); setCurrentPage(0); }}>
            🔄 {t?.story?.readAgain || 'Tekrar Oku'}
          </button>
          <button
            className={`bv-btn ${saved ? 'bv-btn--saved' : 'bv-btn--primary'}`}
            onClick={onSave}
            disabled={saving || saved}
          >
            {saving ? `⏳ ${t?.story?.saving || 'Kaydediliyor...'}` :
             saved  ? `✓ ${t?.story?.saved  || 'Kaydedildi'}`       :
                      `💾 ${t?.story?.saveStory || 'Hikayelerime Kaydet'}`}
          </button>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './BookViewer.css';

export default function BookViewer({ pages, title, characters, location, lang, t, onSave, saving, saved }) {
  const [currentPage, setCurrentPage]   = useState(0);
  const [flipping, setFlipping]         = useState(false);
  const [flipDir, setFlipDir]           = useState('next');

  // ── Sesli okuma state ──
  const [speaking, setSpeaking]         = useState(false);
  const [paused, setPaused]             = useState(false);
  const [readAll, setReadAll]           = useState(false); // tüm hikayeyi oku modu
  const utteranceRef                    = useRef(null);
  const readAllPageRef                  = useRef(0);

  const totalPages = pages.length;
  const isFirst    = currentPage === 0;
  const isLast     = currentPage === totalPages - 1;

  // Sayfa değişince okumayı durdur (readAll modunda değilsek)
  useEffect(() => {
    if (!readAll) stopSpeech();
  }, [currentPage]);

  // Component unmount → durdur
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const stopSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setPaused(false);
    setReadAll(false);
    readAllPageRef.current = 0;
  }, []);

  const getLang = () => {
    // Web Speech API dil kodu
    if (lang === 'en') return 'en-US';
    return 'tr-TR';
  };

  const speakText = useCallback((text, onEnd) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang  = getLang();
    utter.rate  = 0.88;
    utter.pitch = 1.05;

    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferred = voices.find(v =>
          v.lang.startsWith(lang === 'en' ? 'en' : 'tr') && v.localService
        ) || voices.find(v =>
          v.lang.startsWith(lang === 'en' ? 'en' : 'tr')
        );
        if (preferred) utter.voice = preferred;
      }

      utter.onstart = () => { setSpeaking(true); setPaused(false); };
      utter.onend   = () => { setSpeaking(false); setPaused(false); if (onEnd) onEnd(); };
      utter.onerror = () => { setSpeaking(false); setPaused(false); };

      utteranceRef.current = utter;
      window.speechSynthesis.speak(utter);
    };

    // Sesler henüz yüklenmediyse bekle
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        setVoiceAndSpeak();
      };
    } else {
      setVoiceAndSpeak();
    }
  }, [lang]);

  // Sadece mevcut sayfayı oku
  const handleReadPage = useCallback(() => {
    if (speaking && !paused) {
      window.speechSynthesis.pause();
      setPaused(true);
      return;
    }
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      return;
    }
    setReadAll(false);
    speakText(pages[currentPage]?.content || '');
  }, [speaking, paused, currentPage, pages, speakText]);

  // Tüm hikayeyi baştan oku
  const handleReadAll = useCallback(() => {
    if (speaking) { stopSpeech(); return; }
    setReadAll(true);
    readAllPageRef.current = 0;
    setCurrentPage(0);

    const readPage = (idx) => {
      if (idx >= pages.length) {
        setReadAll(false);
        setSpeaking(false);
        return;
      }
      readAllPageRef.current = idx;
      setCurrentPage(idx);
      speakText(pages[idx]?.content || '', () => {
        setTimeout(() => readPage(idx + 1), 600);
      });
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
    setTimeout(() => {
      setCurrentPage(p => dir === 'next' ? p + 1 : p - 1);
      setFlipping(false);
    }, 320);
  };

  const allChars = characters || [];

  const speechSupported = !!window.speechSynthesis;

  return (
    <div className="book-wrapper">
      <h2 className="book-title">{title}</h2>

      {/* ── Sesli Okuma Kontrolleri ── */}
      <div className="tts-bar animate-fadeIn">
        <div className="tts-info">
          <span className="tts-icon">{speaking ? '🔊' : '🔈'}</span>
          <span className="tts-label">
            {speaking && !paused
              ? (lang === 'tr' ? 'Okunuyor...' : 'Reading...')
              : paused
              ? (lang === 'tr' ? 'Duraklatıldı' : 'Paused')
              : (lang === 'tr' ? 'Sesli Okuma' : 'Read Aloud')}
          </span>
        </div>
        <div className="tts-btns">
          <button
            className={`tts-btn ${speaking && !paused ? 'tts-btn--active' : ''}`}
            onClick={handleReadPage}
            title={lang === 'tr' ? 'Bu sayfayı oku' : 'Read this page'}
          >
            {speaking && !paused ? '⏸' : paused ? '▶' : '▶'}
            <span>{lang === 'tr'
              ? (paused ? 'Devam' : 'Bu Sayfayı Oku')
              : (paused ? 'Resume' : 'Read Page')}</span>
          </button>

          <button
            className={`tts-btn ${readAll ? 'tts-btn--all' : ''}`}
            onClick={handleReadAll}
            title={lang === 'tr' ? 'Tüm hikayeyi oku' : 'Read full story'}
          >
            {readAll ? '⏹' : '📖'}
            <span>{lang === 'tr'
              ? (readAll ? 'Durdur' : 'Tümünü Oku')
              : (readAll ? 'Stop' : 'Read All')}</span>
          </button>

          {(speaking || paused) && (
            <button className="tts-btn tts-btn--stop" onClick={stopSpeech} title="Durdur">
              ⏹ <span>{lang === 'tr' ? 'Durdur' : 'Stop'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Kitap ── */}
      <div className="book-container">
        {/* Sol sayfa */}
        <div className="book-page book-page-left">
          <div className="book-page-inner">
            <div className="book-decoration">
              <div className="book-ornament">✦</div>
              <div className="char-showcase">
                {allChars.slice(0, 3).map(c => (
                  <div key={c.id} className="showcase-char" title={c.name}>
                    <img
                      src={`/assets/characters/${c.file}`}
                      alt={c.name}
                      onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                    />
                    <span className="showcase-emoji" style={{ display:'none' }}>{c.emoji}</span>
                    <span className="showcase-name">{c.name[lang] || c.name.tr}</span>
                  </div>
                ))}
              </div>
              {location && (
                <div className="showcase-location">
                  <span className="loc-emoji">{location.emoji}</span>
                  <span className="loc-name">{location.name[lang] || location.name.tr}</span>
                </div>
              )}
              <div className="book-ornament">✦</div>
            </div>
          </div>
          <div className="page-spine" />
        </div>

        {/* Sağ sayfa */}
        <div className={`book-page book-page-right ${flipping ? `flip-${flipDir}` : ''}`}>
          <div className="book-page-inner">
            <div className="page-header">
              <span className="page-num">
                {t.story.page} {currentPage + 1} {t.story.of} {totalPages}
              </span>
              {/* Sayfa içi mini play butonu */}
              <button
                className={`page-play-btn ${speaking && !paused ? 'playing' : ''}`}
                onClick={handleReadPage}
                title={lang === 'tr' ? 'Bu sayfayı sesli oku' : 'Read this page aloud'}
              >
                {speaking && !paused ? '⏸' : '▶'}
              </button>
            </div>
            <div className="page-content">
              <p>{pages[currentPage]?.content}</p>
            </div>
            <div className="page-chars-strip">
              {allChars.map(c => (
                <div key={c.id} className="strip-char" title={c.name[lang] || c.name.tr}>
                  <img
                    src={`/assets/characters/${c.file}`}
                    alt={c.name[lang] || c.name.tr}
                    onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}
                  />
                  <span style={{ display:'none', fontSize:'1.4rem' }}>{c.emoji}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigasyon */}
      <div className="book-nav">
        <button
          className={`nav-btn ${isFirst ? 'hidden' : ''}`}
          onClick={() => goTo('prev')}
          disabled={isFirst || flipping}
        >‹</button>

        <div className="page-dots">
          {pages.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === currentPage ? 'active' : ''} ${readAll && i === currentPage ? 'dot--reading' : ''}`}
              onClick={() => {
                if (!flipping && !readAll) {
                  setFlipDir(i > currentPage ? 'next' : 'prev');
                  setCurrentPage(i);
                }
              }}
            />
          ))}
        </div>

        <button
          className={`nav-btn ${isLast ? 'hidden' : ''}`}
          onClick={() => goTo('next')}
          disabled={isLast || flipping}
        >›</button>
      </div>

      {/* Aksiyonlar */}
      {isLast && (
        <div className="book-actions animate-fadeIn">
          <button className="btn btn-outline" onClick={() => { stopSpeech(); setCurrentPage(0); }}>
            🔄 {t.story.readAgain}
          </button>
          <button
            className={`btn ${saved ? 'btn-gold' : 'btn-primary'}`}
            onClick={onSave}
            disabled={saving || saved}
          >
            {saving ? '⏳ ' + t.story.saving :
             saved  ? '✓ '  + t.story.saved  :
                      '💾 ' + t.story.saveStory}
          </button>
        </div>
      )}
    </div>
  );
}

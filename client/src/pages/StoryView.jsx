import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import api from '../services/api';
import './StoryView.css';

export default function StoryView() {
  const { state }    = useLocation();
  const navigate     = useNavigate();
  const { t, lang }  = useLang();

  const story      = state?.story;
  const pages      = story?.pages || [];
  const characters = story?.characters || [];
  const location   = story?.location  || null;
  const onSave     = state?.onSave;

  const [phase, setPhase]             = useState('intro');
  const [currentPage, setCurrentPage] = useState(0);
  const [flipping, setFlipping]       = useState(false);
  const [flipDir, setFlipDir]         = useState('next');
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [storyId, setStoryId]         = useState(story?._id || null);

  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused]     = useState(false);
  const [readAll, setReadAll]   = useState(false);
  const utteranceRef            = useRef(null);

  const totalPages = pages.length;
  const isFirst    = currentPage === 0;
  const isLast     = currentPage === totalPages - 1;

  useEffect(() => {
    if (!story) { navigate('/'); return; }
    const t1 = setTimeout(() => setPhase('opening'), 600);
    const t2 = setTimeout(() => setPhase('reading'), 3200);
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
    if (saving || saved) return;
    setSaving(true);
    try {
      if (onSave) {
        await onSave();
      } else {
        const opts = story.options || {};
        const chars = typeof opts.characters === 'string'
          ? JSON.parse(opts.characters) : (opts.characters || []);
        const loc = typeof opts.location === 'string'
          ? JSON.parse(opts.location) : (opts.location || null);
        const saveRes = await api.post('/stories', {
          title:    story.title,
          fullText: story.fullText || story.pages?.map(p => p.content).join(' ') || '',
          pages:    story.pages || [],
          options:  { ...opts, characters: chars, location: loc },
        });
        setStoryId(saveRes.data.story._id);
      }
      setSaved(true);
    } catch (e) {
      alert(e.message || 'Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  if (!story) return null;

  const alreadySaved = !!(storyId || saved);

  return (
    <div className={`sv-page sv-phase--${phase}`}>

      {/* ── YILDIZ ARKA PLAN ── */}
      <div className="sv-bg">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="sv-star" style={{
            left:              `${Math.random() * 100}%`,
            top:               `${Math.random() * 100}%`,
            animationDelay:    `${Math.random() * 4}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            width:             `${4 + Math.random() * 6}px`,
            height:            `${4 + Math.random() * 6}px`,
          }} />
        ))}
      </div>

      {/* ── INTRO ── */}
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
            <div className="sv-book-pages-edge-left" />
            <div className="sv-book-spine-open" />
            <div className="sv-book-cover-left">
              <div className="sv-cover-corner sv-cover-corner--tl" />
              <div className="sv-cover-corner sv-cover-corner--bl" />
            </div>
            <div className="sv-book-cover-right">
              <div className="sv-cover-corner sv-cover-corner--tr" />
              <div className="sv-cover-corner sv-cover-corner--br" />
            </div>
            <div className="sv-book-bottom" />
          </div>
        </div>
      )}

      {/* ── OKUMA SAYFASI ── */}
      {phase === 'reading' && (
        <div className="sv-reading animate-fadeIn">

          {/* ── ÜST BAR ── */}
          <div className="sv-topbar">
            <button className="sv-back" onClick={() => { stopSpeech(); navigate('/'); }}>
              ← {lang === 'tr' ? 'Geri' : 'Back'}
            </button>

            {/* Başlık */}
            <span className="sv-topbar-title">{story.title}</span>

            {/* Kaydet butonu — sadece kaydedilmemişse göster */}
            <div className="sv-top-actions">
              {!alreadySaved && (
                <button
                  className={`sv-top-btn ${saving ? 'sv-top-btn--saving' : ''}`}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <><span className="sv-btn-spinner" /> {lang === 'tr' ? 'Kaydediliyor' : 'Saving'}</>
                  ) : (
                    <><span>💾</span> {lang === 'tr' ? 'Kaydet' : 'Save'}</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* ── SON SAYFA AKSIYON BANDI (üstte, kitabın hemen üstü) ── */}
          {isLast && (
            <div className="sv-finish-banner animate-fadeIn">
              <div className="sv-finish-left">
                <span className="sv-finish-emoji">🎉</span>
                <div className="sv-finish-text">
                  <strong>{lang === 'tr' ? 'Hikaye bitti!' : 'Story complete!'}</strong>
                  <span>{lang === 'tr' ? 'Harika bir okuma yaptın.' : 'Great reading session!'}</span>
                </div>
              </div>
              <div className="sv-finish-right">
                <button className="sv-finish-btn sv-finish-btn--replay"
                  onClick={() => { stopSpeech(); setCurrentPage(0); }}>
                  🔄 {lang === 'tr' ? 'Tekrar Oku' : 'Read Again'}
                </button>
                {!alreadySaved && (
                  <button className="sv-finish-btn sv-finish-btn--save"
                    onClick={handleSave} disabled={saving}>
                    {saving ? '⏳' : '💾'} {lang === 'tr' ? 'Hikayelerime Ekle' : 'Add to My Stories'}
                  </button>
                )}
                {alreadySaved && (
                  <span className="sv-finish-saved">
                    ✅ {lang === 'tr' ? 'Hikayelerime eklendi!' : 'Added to My Stories!'}
                  </span>
                )}
              </div>
            </div>
          )}

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

              {/* ── SOL SAYFA — MEKAN ARKA PLAN + KARAKTERLERİ BOYDAN ── */}
              <div className="sv-page-left">
                {/* Mekan arka plan görseli */}
                {location && (
                  <div className="sv-page-left-bg"
                    style={{ backgroundImage: `url('/assets/locations/${location.file}')` }} />
                )}

                {/* Mekan isim rozeti — en altta */}

                {/* Karakterler boydan — kaç tane olursa sığsın */}
                <div
                  className="sv-chars-fullheight"
                  style={{ '--char-count': characters.length }}
                >
                  {characters.map((c, i) => (
                    <div key={c.id || i} className="sv-char-full-item">
                      <img
                        src={`/assets/characters/${c.file}`}
                        alt={c.name?.tr || c.name || ''}
                        onError={e => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <span className="sv-char-emoji-fallback" style={{ display: 'none' }}>
                        {c.emoji || '👤'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="sv-spine" />
              </div>

              {/* Orta cilt */}
              <div className="sv-book-gutter" />

              {/* ── SAĞ SAYFA — METİN ── */}
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

          {/* ── SAYFA NOKTALARI ── */}
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

        </div>
      )}
    </div>
  );
}
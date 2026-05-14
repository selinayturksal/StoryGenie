import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BookOpeningTransition.css';

/* Pre-defined particles — deterministic, no Math.random on each render */
const PARTICLES = [
  { id:  0, x: -145, y: -210, delay: 0.00, dur: 2.4, emoji: '✨', size: 17 },
  { id:  1, x:  125, y: -255, delay: 0.35, dur: 2.6, emoji: '⭐', size: 13 },
  { id:  2, x: -195, y: -175, delay: 0.75, dur: 2.0, emoji: '💫', size: 15 },
  { id:  3, x:  175, y: -220, delay: 0.20, dur: 2.2, emoji: '✦',  size: 11 },
  { id:  4, x:  -58, y: -275, delay: 1.00, dur: 2.9, emoji: '🌟', size: 14 },
  { id:  5, x:  158, y: -182, delay: 0.50, dur: 2.1, emoji: '✨', size: 12 },
  { id:  6, x: -158, y: -235, delay: 1.20, dur: 2.5, emoji: '⭐', size: 16 },
  { id:  7, x:   48, y: -198, delay: 0.65, dur: 2.3, emoji: '💫', size: 12 },
  { id:  8, x:  215, y: -160, delay: 1.40, dur: 2.8, emoji: '✦',  size: 10 },
  { id:  9, x: -215, y: -150, delay: 0.55, dur: 1.9, emoji: '✨', size: 18 },
  { id: 10, x:  118, y: -280, delay: 1.10, dur: 2.6, emoji: '🌟', size: 12 },
  { id: 11, x:  -78, y: -165, delay: 1.60, dur: 2.2, emoji: '⭐', size: 14 },
];

const MIN_DISPLAY_MS = 4000;
const SLOW_DOWN_MS   = 1200;

/**
 * BookOpeningTransition
 *
 * Props:
 *   visible     — show/hide the overlay (true while API is running)
 *   storyReady  — set true when API resolves successfully
 *   onComplete  — called after exit animation; parent should navigate here
 *   lang        — 'tr' | 'en'
 */
export default function BookOpeningTransition({ visible, storyReady, onComplete, lang }) {
  const [phase, setPhase]       = useState('hidden');
  const [isSlowing, setIsSlowing] = useState(false);

  const minDoneRef    = useRef(false);
  const calledRef     = useRef(false);
  const storyReadyRef = useRef(storyReady);
  const onCompleteRef = useRef(onComplete);

  storyReadyRef.current = storyReady;
  onCompleteRef.current = onComplete;

  const tryCompleteRef = useRef(null);
  tryCompleteRef.current = () => {
    if (calledRef.current) return;
    if (minDoneRef.current && storyReadyRef.current) {
      calledRef.current = true;
      setIsSlowing(true);
      setTimeout(() => {
        setPhase('exit');
        setTimeout(() => onCompleteRef.current && onCompleteRef.current(), 860);
      }, SLOW_DOWN_MS);
    }
  };

  useEffect(() => {
    if (!visible) {
      setPhase('hidden');
      setIsSlowing(false);
      minDoneRef.current = false;
      calledRef.current  = false;
      return;
    }
    const tc = tryCompleteRef;
    const ts = [
      setTimeout(() => setPhase('overlay'),   10),
      setTimeout(() => setPhase('book'),     300),
      setTimeout(() => setPhase('flipping'), 820),
      setTimeout(() => { minDoneRef.current = true; tc.current(); }, MIN_DISPLAY_MS),
    ];
    return () => ts.forEach(clearTimeout);
  }, [visible]);

  useEffect(() => {
    if (visible) tryCompleteRef.current();
  }, [storyReady, visible]);

  if (phase === 'hidden') return null;

  const showBook     = phase !== 'overlay';
  const showFlipping = phase === 'flipping' || phase === 'exit';
  const isExiting    = phase === 'exit';
  const uiLang       = lang || 'tr';

  const statusLabel = uiLang === 'tr'
    ? (storyReady ? '✨ Masalınız hazır!' : 'Masalınız yazılıyor...')
    : (storyReady ? '✨ Your story is ready!' : 'Writing your story...');

  return (
    <div
      className="bot-root"
      role="dialog"
      aria-modal="true"
      aria-label={uiLang === 'tr' ? 'Hikaye oluşturuluyor' : 'Generating story'}
      aria-live="polite"
    >
      {/* Frosted backdrop */}
      <motion.div
        className="bot-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ duration: 0.65 }}
      />

      {/* Ambient star field */}
      <div className="bot-stars" aria-hidden="true">
        {Array.from({ length: 28 }, (_, i) => (
          <div key={i} className="bot-star" style={{ '--si': i }} />
        ))}
      </div>

      {/* Book + particles + status */}
      <AnimatePresence>
        {showBook && (
          <motion.div
            key="book-scene"
            className="bot-scene"
            initial={{ opacity: 0, y: 80, scale: 0.52 }}
            animate={
              isExiting
                ? { opacity: 0 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            transition={
              isExiting
                ? { duration: 0.80, ease: 'easeIn' }
                : { type: 'spring', stiffness: 175, damping: 22, delay: 0.05 }
            }
          >
            {/* Magical glow */}
            <div className={`bot-glow${showFlipping ? ' bot-glow--active' : ''}`} aria-hidden="true" />

            {/* Open book spread */}
            <div className="bot-book-wrap" aria-hidden="true">
              <div className="bot-spread">

                {/* Ground shadow */}
                <div className="bot-shadow" />

                {/* ── Left page (already-written content) ── */}
                <div className="bot-page bot-page--left">
                  <div className="bot-pg-lines">
                    {Array.from({ length: 9 }, (_, i) => (
                      <div key={i} className="bot-pg-line bot-pg-line--done" style={{ '--li': i }} />
                    ))}
                  </div>
                  <div className="bot-pg-deco">📖</div>
                </div>

                {/* ── Center spine / gutter ── */}
                <div className="bot-spine-gutter" />

                {/* ── Right page (base — content being written) ── */}
                <div className="bot-page bot-page--right">
                  <div className="bot-pg-lines">
                    {Array.from({ length: 9 }, (_, i) => (
                      <div
                        key={i}
                        className={`bot-pg-line${showFlipping ? ' bot-pg-line--shimmer' : ''}`}
                        style={{ '--li': i }}
                      />
                    ))}
                  </div>
                </div>

                {/*
                  ── Flipping pages ──
                  3 pages flip sequentially (CSS animation, staggered via --fi).
                  They are absolute children of bot-spread, positioned over the
                  right half, rotating around the spine (transform-origin: left center).
                */}
                {showFlipping && [0, 1, 2].map(fi => (
                  <div
                    key={fi}
                    className={`bot-flip-page${isSlowing ? ' bot-flip-page--slow' : ''}`}
                    style={{ '--fi': fi }}
                    aria-hidden="true"
                  >
                    {/* Front face — visible when page is on the right (0°) */}
                    <div className="bot-flip-f">
                      <div className="bot-pg-lines">
                        {Array.from({ length: 9 }, (_, li) => (
                          <div key={li} className="bot-pg-line bot-pg-line--shimmer" style={{ '--li': li }} />
                        ))}
                      </div>
                    </div>
                    {/* Back face — visible when page has landed on the left (−180°) */}
                    <div className="bot-flip-b">
                      <div className="bot-pg-lines">
                        {Array.from({ length: 9 }, (_, li) => (
                          <div key={li} className="bot-pg-line bot-pg-line--done" style={{ '--li': li }} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            </div>

            {/* Floating magic particles */}
            {showFlipping && PARTICLES.map(p => (
              <motion.div
                key={p.id}
                className="bot-particle"
                style={{ fontSize: `${p.size}px` }}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0, rotate: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  x: [0, p.x * 0.42, p.x],
                  y: [0, p.y * 0.42, p.y],
                  scale: [0, 1.35, 0.75],
                  rotate: [0, 25, -18],
                }}
                transition={{
                  delay: p.delay,
                  duration: p.dur,
                  ease: 'easeOut',
                  times: [0, 0.35, 1],
                  repeat: Infinity,
                  repeatDelay: p.dur * 0.48,
                }}
                aria-hidden="true"
              >
                {p.emoji}
              </motion.div>
            ))}

            {/* Status text */}
            <motion.div
              className="bot-status"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.45 }}
            >
              {storyReady ? (
                <motion.span
                  className="bot-ready-star"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 16 }}
                  aria-hidden="true"
                >
                  ✨
                </motion.span>
              ) : (
                <span className="bot-dots" aria-hidden="true">
                  <span /><span /><span />
                </span>
              )}
              <span className="bot-status-text">{statusLabel}</span>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

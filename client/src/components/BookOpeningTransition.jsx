import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BookOpeningTransition.css';

const PARTICLES = [
  { id:  0, x: -130, y: -190, delay: 0.00, dur: 2.4, emoji: '✨', size: 16 },
  { id:  1, x:  115, y: -235, delay: 0.35, dur: 2.6, emoji: '⭐', size: 12 },
  { id:  2, x: -175, y: -160, delay: 0.75, dur: 2.0, emoji: '💫', size: 14 },
  { id:  3, x:  160, y: -200, delay: 0.20, dur: 2.2, emoji: '✦',  size: 10 },
  { id:  4, x:  -52, y: -255, delay: 1.00, dur: 2.9, emoji: '🌟', size: 13 },
  { id:  5, x:  145, y: -168, delay: 0.50, dur: 2.1, emoji: '✨', size: 11 },
  { id:  6, x: -145, y: -215, delay: 1.20, dur: 2.5, emoji: '⭐', size: 15 },
  { id:  7, x:   42, y: -182, delay: 0.65, dur: 2.3, emoji: '💫', size: 12 },
  { id:  8, x:  198, y: -148, delay: 1.40, dur: 2.8, emoji: '✦',  size:  9 },
  { id:  9, x: -198, y: -138, delay: 0.55, dur: 1.9, emoji: '✨', size: 17 },
  { id: 10, x:  108, y: -260, delay: 1.10, dur: 2.6, emoji: '🌟', size: 11 },
  { id: 11, x:  -68, y: -152, delay: 1.60, dur: 2.2, emoji: '⭐', size: 13 },
];

const MIN_DISPLAY_MS = 5500;
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
  const [phase, setPhase]         = useState('hidden');
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
      setTimeout(() => setPhase('book'),     350),
      // kapak 1100ms'de dönmeye başlar, tam açılması ~2850ms sürer
      setTimeout(() => setPhase('opening'), 1100),
      // kapak tamamen açıldıktan sonra sayfa çevirme başlar
      setTimeout(() => setPhase('flipping'), 4050),
      setTimeout(() => { minDoneRef.current = true; tc.current(); }, MIN_DISPLAY_MS),
    ];
    return () => ts.forEach(clearTimeout);
  }, [visible]);

  useEffect(() => {
    if (visible) tryCompleteRef.current();
  }, [storyReady, visible]);

  if (phase === 'hidden') return null;

  const showBook     = phase !== 'overlay';
  const coverOpen    = phase === 'flipping' || phase === 'exit';
  const showFlipping = phase === 'flipping' || phase === 'exit';
  const isExiting    = phase === 'exit';
  const uiLang       = lang || 'tr';

  return (
    <div
      className="bot-root"
      role="dialog"
      aria-modal="true"
      aria-label={uiLang === 'tr' ? 'Hikaye oluşturuluyor' : 'Generating story'}
      aria-live="polite"
    >
      {/* Kitap + parçacıklar + durum */}
      <AnimatePresence>
        {showBook && (
          <motion.div
            key="book-scene"
            className="bot-scene"
            initial={{ opacity: 0, y: 64, scale: 0.50 }}
            animate={
              isExiting
                ? { opacity: 0 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            transition={
              isExiting
                ? { duration: 0.80, ease: 'easeIn' }
                : { type: 'spring', stiffness: 170, damping: 22, delay: 0.06 }
            }
          >
            {/* Kitabın arkasındaki sihirli parlaklık */}
            <div className={`bot-glow${coverOpen ? ' bot-glow--open' : ''}`} aria-hidden="true" />

            {/* 3D Kitap — açıkken tam açılım ortalansın diye sağa kayar */}
            <div className={`bot-book-wrap${showFlipping ? ' bot-book-wrap--open' : ''}`} aria-hidden="true">
              <div className="bot-book">

                {/* Zemin gölgesi */}
                <div className="bot-shadow" />

                {/*
                  Sol sayfa — kapak açıldığında belirir.
                  bot-book'un soluna absolute konumlanır (right: 100%).
                  "Zaten yazılmış" içerik simülasyonu gösterir.
                */}
                {showFlipping && (
                  <motion.div
                    className="bot-left-page"
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.38, delay: 0.1 }}
                  >
                    <div className="bot-pg-lines-inner">
                      {Array.from({ length: 7 }, (_, i) => (
                        <div key={i} className="bot-pg-line bot-pg-line--done" style={{ '--li': i }} />
                      ))}
                    </div>
                    <div className="bot-pg-icon" aria-hidden="true">📖</div>
                  </motion.div>
                )}

                {/* Sağ sayfa — kapağın arkasında her zaman görünür */}
                <div className="bot-pages">
                  <AnimatePresence>
                    {coverOpen && (
                      <motion.div
                        key="page-content"
                        className="bot-pages-inner"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.45 }}
                      >
                        <span className="bot-pages-icon" aria-hidden="true">✨</span>
                        {Array.from({ length: 6 }, (_, i) => (
                          <div key={i} className="bot-pg-line bot-pg-line--shimmer" style={{ '--li': i }} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Çevrilen sayfalar — sağ sayfayla aynı sınırlar, cilt etrafında döner */}
                {showFlipping && [0, 1, 2].map(fi => (
                  <div
                    key={fi}
                    className={`bot-flip-page${isSlowing ? ' bot-flip-page--slow' : ''}`}
                    style={{ '--fi': fi }}
                    aria-hidden="true"
                  >
                    <div className="bot-flip-f">
                      <div className="bot-pg-lines-inner">
                        {Array.from({ length: 6 }, (_, li) => (
                          <div key={li} className="bot-pg-line bot-pg-line--shimmer" style={{ '--li': li }} />
                        ))}
                      </div>
                    </div>
                    {/* Arka yüz şeffaf — sayfalar kitaba "emilir" görünür, açılımı ortada tutar */}
                    <div className="bot-flip-b" />
                  </div>
                ))}

                {/* Kapak — sayfa çevirme başlayınca DOM'dan kaldırılır (3D z-fighting'i önler) */}
                {!showFlipping && (
                  <div className={`bot-cover${coverOpen ? ' bot-cover--open' : ''}`}>
                    <div className="bot-cover-f">
                      <div className="bot-cover-art">
                        <div className="bot-moon">🌙</div>
                        <p className="bot-cover-word">
                          {uiLang === 'tr' ? 'Masal' : 'Story'}
                        </p>
                        <p className="bot-cover-word bot-cover-word--sub">
                          {uiLang === 'tr' ? 'Zamanı' : 'Time'}
                        </p>
                        <p className="bot-cover-deco">✦ ✨ ✦</p>
                      </div>
                      <div className="bot-cover-shine" />
                      <div className="bot-cover-frame" />
                    </div>
                    <div className="bot-cover-b">
                      <span aria-hidden="true">📖</span>
                    </div>
                  </div>
                )}

                {/* Cilt */}
                <div className="bot-spine" />
              </div>
            </div>

            {/* Uçan sihir parçacıkları */}
            {showFlipping && PARTICLES.map(p => (
              <motion.div
                key={p.id}
                className="bot-particle"
                style={{ fontSize: `${p.size}px` }}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0, rotate: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  x: [0, p.x * 0.40, p.x],
                  y: [0, p.y * 0.40, p.y],
                  scale: [0, 1.30, 0.72],
                  rotate: [0, 24, -16],
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


          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
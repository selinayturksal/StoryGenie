import { useMemo, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/*
 * Magical constellation star field.
 * 3 depth layers with scroll-driven parallax.
 * Deterministic positions — no Math.random.
 */

const TOTAL = 130;

function seededStars(count) {
  const stars = [];
  let seed = 137;
  const rand = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    const depth = i < 55 ? 0 : i < 100 ? 1 : 2;
    stars.push({
      id:          i,
      x:           rand() * 100,
      y:           rand() * 100,
      size:        depth === 0 ? 0.8 + rand() * 1   : depth === 1 ? 1.2 + rand() * 1.4 : 1.6 + rand() * 2,
      baseOpacity: depth === 0 ? 0.2  + rand() * 0.3 : depth === 1 ? 0.35 + rand() * 0.3 : 0.5 + rand() * 0.35,
      twinkleDur:  1.8 + rand() * 3.5,
      twinkleDelay: rand() * 5,
      depth,
      // Bazı yıldızlar çarpı/artı parlaklık şekli alır
      sparkle: rand() > 0.82,
    });
  }
  return stars;
}

// Yakın yıldızlar arasında birkaç "takımyıldızı" çizgisi
const CONSTELLATIONS = [
  [2, 7], [7, 15], [15, 22],
  [5, 11], [11, 18],
  [30, 36], [36, 44],
];

export default function StarField({ className = '' }) {
  const { scrollY } = useScroll();
  const [winH, setWinH] = useState(800);

  useEffect(() => {
    setWinH(window.innerHeight);
    const onResize = () => setWinH(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const stars = useMemo(() => seededStars(TOTAL), []);

  const y0 = useTransform(scrollY, [0, winH * 3], [0, -winH * 0.06]);
  const y1 = useTransform(scrollY, [0, winH * 3], [0, -winH * 0.15]);
  const y2 = useTransform(scrollY, [0, winH * 3], [0, -winH * 0.28]);
  const layerY = [y0, y1, y2];

  const starsByDepth = useMemo(() => [
    stars.filter(s => s.depth === 0),
    stars.filter(s => s.depth === 1),
    stars.filter(s => s.depth === 2),
  ], [stars]);

  return (
    <div
      className={className}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {[0, 1, 2].map(depth => (
        <motion.div
          key={depth}
          style={{ position: 'absolute', inset: 0, y: layerY[depth] }}
        >
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            {/* Constellation lines — depth 1 only */}
            {depth === 1 && CONSTELLATIONS.map(([a, b], idx) => {
              const sa = starsByDepth[1][a % starsByDepth[1].length];
              const sb = starsByDepth[1][b % starsByDepth[1].length];
              if (!sa || !sb) return null;
              return (
                <line
                  key={idx}
                  x1={`${sa.x}%`} y1={`${sa.y}%`}
                  x2={`${sb.x}%`} y2={`${sb.y}%`}
                  stroke="rgba(200,185,255,0.12)"
                  strokeWidth="0.6"
                />
              );
            })}
          </svg>

          {starsByDepth[depth].map(star => (
            star.sparkle ? (
              /* Cross/sparkle star */
              <motion.div
                key={star.id}
                style={{
                  position: 'absolute',
                  left: `${star.x}%`,
                  top:  `${star.y}%`,
                  width: star.size * 4,
                  height: star.size * 4,
                  transform: 'translate(-50%, -50%)',
                }}
                animate={{
                  opacity: [star.baseOpacity * 0.4, star.baseOpacity, star.baseOpacity * 0.5, star.baseOpacity],
                  scale:   [0.7, 1.2, 0.8, 1],
                }}
                transition={{ duration: star.twinkleDur, delay: star.twinkleDelay, repeat: Infinity, ease: 'easeInOut' }}
              >
                <svg viewBox="0 0 10 10" style={{ width: '100%', height: '100%' }}>
                  <line x1="5" y1="0" x2="5" y2="10" stroke="rgba(220,210,255,0.9)" strokeWidth="1"/>
                  <line x1="0" y1="5" x2="10" y2="5" stroke="rgba(220,210,255,0.9)" strokeWidth="1"/>
                  <line x1="1.5" y1="1.5" x2="8.5" y2="8.5" stroke="rgba(220,210,255,0.55)" strokeWidth="0.6"/>
                  <line x1="8.5" y1="1.5" x2="1.5" y2="8.5" stroke="rgba(220,210,255,0.55)" strokeWidth="0.6"/>
                </svg>
              </motion.div>
            ) : (
              /* Plain dot star */
              <motion.div
                key={star.id}
                style={{
                  position: 'absolute',
                  left: `${star.x}%`,
                  top:  `${star.y}%`,
                  width: star.size,
                  height: star.size,
                  borderRadius: '50%',
                  background: 'rgba(220,210,255,0.9)',
                  transform: 'translate(-50%,-50%)',
                }}
                animate={{
                  opacity: [star.baseOpacity * 0.4, star.baseOpacity, star.baseOpacity * 0.6, star.baseOpacity],
                  scale:   [0.75, 1.1, 0.85, 1],
                }}
                transition={{ duration: star.twinkleDur, delay: star.twinkleDelay, repeat: Infinity, ease: 'easeInOut' }}
              />
            )
          ))}
        </motion.div>
      ))}
    </div>
  );
}

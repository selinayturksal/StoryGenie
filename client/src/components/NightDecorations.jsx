import { motion } from 'framer-motion';

/*
 * Ambient night-sky decorations: crescent moons, stars, soft cloud halos.
 * Purely decorative — no mascot, no cat.
 * Positions are deterministic (seeded) to avoid layout shift.
 */

const MOONS = [
  { x: '8%',  y: '12%', size: 38, rot: -20, delay: 0,    dur: 6 },
  { x: '88%', y: '8%',  size: 24, rot:  15, delay: 1.2,  dur: 7.5 },
  { x: '76%', y: '68%', size: 18, rot: -10, delay: 2.5,  dur: 5.5 },
];

const HALOS = [
  { x: '15%', y: '25%', w: 280, h: 180, opacity: 0.07, color: 'rgba(200,160,255,' },
  { x: '70%', y: '15%', w: 220, h: 150, opacity: 0.06, color: 'rgba(84,151,167,' },
  { x: '50%', y: '75%', w: 260, h: 170, opacity: 0.05, color: 'rgba(160,120,255,' },
];

const STARS = Array.from({ length: 22 }, (_, i) => {
  let s = 42 + i * 137.5 % 100;
  return {
    x:     `${s % 100}%`,
    y:     `${(s * 1.618) % 100}%`,
    size:  1 + (i % 3) * 0.8,
    delay: (i * 0.37) % 4,
    dur:   2.5 + (i % 3) * 1.2,
  };
});

export default function NightDecorations({ className = '' }) {
  return (
    <div
      className={className}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}
      aria-hidden="true"
    >
      {/* ── Soft color halos ── */}
      {HALOS.map((h, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: h.x,
            top: h.y,
            width: h.w,
            height: h.h,
            background: `radial-gradient(ellipse, ${h.color}${h.opacity}) 0%, transparent 70%)`,
            borderRadius: '50%',
            filter: 'blur(32px)',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* ── Crescent moons ── */}
      {MOONS.map((m, i) => (
        <motion.div
          key={i}
          style={{ position: 'absolute', left: m.x, top: m.y }}
          animate={{
            y: [0, -14, -6, 0],
            rotate: [m.rot - 5, m.rot + 5, m.rot - 3, m.rot],
          }}
          transition={{ duration: m.dur, delay: m.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width={m.size} height={m.size} viewBox="0 0 40 40" fill="none">
            {/* Crescent: large circle minus offset circle */}
            <path
              d="M30 20 A14 14 0 1 1 30.001 20 Z M36 14 A10 10 0 1 0 36.001 14 Z"
              fill="rgba(200,185,255,0.55)"
            />
            <path
              d="M20 6 A14 14 0 0 1 34 20 A10 10 0 0 0 22 8 Z"
              fill="rgba(180,160,240,0.7)"
            />
            {/* simpler crescent */}
            <path
              d="M28 8 A14 14 0 1 0 28 32 A10 10 0 1 1 28 8 Z"
              fill="rgba(210,195,255,0.6)"
            />
          </svg>
        </motion.div>
      ))}

      {/* ── Tiny twinkling stars ── */}
      {STARS.map((s, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: s.x,
            top: s.y,
            width: s.size * 2,
            height: s.size * 2,
            borderRadius: '50%',
            background: 'rgba(220,210,255,0.9)',
          }}
          animate={{
            opacity: [0.15, 0.9, 0.2, 0.85, 0.15],
            scale:   [0.7,  1.3,  0.8, 1.2,  0.7],
          }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* ── Soft cloud outline rings (decorative) ── */}
      <div style={{
        position: 'absolute', bottom: '18%', left: '5%',
        width: 120, height: 36,
        background: 'rgba(200,185,255,0.06)',
        borderRadius: 99,
        filter: 'blur(8px)',
      }} />
      <div style={{
        position: 'absolute', top: '55%', right: '8%',
        width: 90, height: 28,
        background: 'rgba(84,151,167,0.07)',
        borderRadius: 99,
        filter: 'blur(8px)',
      }} />
    </div>
  );
}

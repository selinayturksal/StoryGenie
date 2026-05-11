import React from 'react';
import { motion } from 'framer-motion';

/*
 * Mystical White Cat mascot — two poses:
 *   pose="lantern"  upright cat holding a glowing lantern
 *   pose="sleep"    curled cat with Zzz bubbles
 *
 * Props:
 *   pose      – "lantern" | "sleep"
 *   size      – base width in px
 *   className – extra wrapper classes
 */
export default function WhiteCat({ pose = 'lantern', size = 220, className = '' }) {
  return pose === 'sleep'
    ? <SleepingCat size={size} className={className} />
    : <LanternCat size={size} className={className} />;
}

/* ────────────────────────── LANTERN POSE ────────────────────────── */
function LanternCat({ size, className }) {
  const h = size * 1.35;

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <motion.div
        animate={{ y: [0, -14, -6, 0], rotate: [0, 1.2, -0.8, 0] }}
        transition={{ duration: 4.5, ease: [0.45, 0, 0.55, 1], repeat: Infinity, repeatType: 'loop' }}
        style={{ willChange: 'transform' }}
      >
        <svg
          width={size}
          height={h}
          viewBox="0 0 200 270"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 16px 40px rgba(28,49,68,0.28))' }}
        >
          {/* ── Lantern glow (ambient) ── */}
          <ellipse cx="155" cy="148" rx="32" ry="32" fill="rgba(255,200,80,0.18)" />
          <ellipse cx="155" cy="148" rx="20" ry="20" fill="rgba(255,200,80,0.28)" />

          {/* ── Tail ── */}
          <motion.path
            d="M118 228 Q145 200 138 168 Q132 152 122 162 Q130 182 124 222 Z"
            fill="#e8e8e8"
            animate={{ rotate: [-6, 6, -6] }}
            transition={{ duration: 2.8, ease: 'easeInOut', repeat: Infinity }}
            style={{ transformOrigin: '120px 228px' }}
          />

          {/* ── Body ── */}
          <ellipse cx="95" cy="218" rx="56" ry="46" fill="#f0f0f0" />
          <ellipse cx="78" cy="212" rx="18" ry="12" fill="#dcdcdc" opacity="0.4" />
          <ellipse cx="112" cy="226" rx="16" ry="10" fill="#dcdcdc" opacity="0.3" />

          {/* ── Left arm (holding lantern up) ── */}
          <path d="M138 196 Q148 178 152 158" stroke="#e0e0e0" strokeWidth="10" strokeLinecap="round" fill="none" />
          {/* Paw at arm end */}
          <ellipse cx="152" cy="156" rx="9" ry="7" fill="#f0f0f0" />

          {/* ── Lantern ── */}
          {/* Chain */}
          <line x1="152" y1="150" x2="155" y2="132" stroke="#c8a050" strokeWidth="1.5" />
          {/* Lantern top cap */}
          <rect x="148" y="108" width="14" height="5" rx="2.5" fill="#c8a050" />
          {/* Lantern body */}
          <rect x="146" y="113" width="18" height="22" rx="5" fill="rgba(255,220,100,0.25)" stroke="#c8a050" strokeWidth="1.5" />
          {/* Flame glow */}
          <motion.ellipse
            cx="155" cy="124"
            rx="5" ry="7"
            fill="rgba(255,180,40,0.7)"
            animate={{ ry: [7, 9, 7], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity }}
          />
          <ellipse cx="155" cy="125" rx="3" ry="4.5" fill="rgba(255,240,180,0.9)" />
          {/* Lantern bottom cap */}
          <rect x="148" y="135" width="14" height="4" rx="2" fill="#c8a050" />

          {/* ── Sparkles around lantern ── */}
          {[
            { cx: 137, cy: 100, size: 4, delay: 0 },
            { cx: 172, cy: 112, size: 3, delay: 0.5 },
            { cx: 165, cy: 95,  size: 2.5, delay: 1 },
            { cx: 140, cy: 118, size: 2, delay: 1.5 },
          ].map(({ cx, cy, size: s, delay }) => (
            <motion.circle
              key={`${cx}-${cy}`}
              cx={cx} cy={cy} r={s}
              fill="rgba(255,220,80,0.9)"
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5] }}
              transition={{ duration: 2, delay, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
          ))}

          {/* ── Ears ── */}
          <polygon points="44,82 36,34 78,77" fill="#f0f0f0" />
          <polygon points="48,76 44,42 74,72" fill="#f5c0cc" opacity="0.7" />
          <polygon points="120,77 162,34 154,82" fill="#f0f0f0" />
          <polygon points="126,72 158,42 150,76" fill="#f5c0cc" opacity="0.7" />

          {/* ── Head ── */}
          <circle cx="99" cy="110" r="62" fill="#f5f5f5" />
          <ellipse cx="70" cy="110" rx="18" ry="30" fill="#dcdcdc" opacity="0.2" />
          <ellipse cx="128" cy="110" rx="18" ry="30" fill="#dcdcdc" opacity="0.2" />

          {/* ── Muzzle ── */}
          <ellipse cx="99" cy="126" rx="35" ry="26" fill="#efefef" />

          {/* ── Eyes (amber/golden) ── */}
          <ellipse cx="78" cy="100" rx="16" ry="17" fill="white" />
          <ellipse cx="78" cy="101" rx="11.5" ry="12.5" fill="#D4860A" />
          <ellipse cx="78" cy="101" rx="7"    ry="8.5"  fill="#1a1207" />
          <circle  cx="82" cy="96"  r="3.5"  fill="white" />
          <circle  cx="74" cy="104" r="2"    fill="white" opacity="0.55" />

          <motion.ellipse cx="78" cy="91" rx="16" ry="0" fill="#f5f5f5"
            animate={{ ry: [0, 17, 17, 0] }}
            transition={{ duration: 0.28, times: [0, 0.35, 0.65, 1], repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
          />

          <ellipse cx="120" cy="100" rx="16" ry="17" fill="white" />
          <ellipse cx="120" cy="101" rx="11.5" ry="12.5" fill="#D4860A" />
          <ellipse cx="120" cy="101" rx="7"    ry="8.5"  fill="#1a1207" />
          <circle  cx="124" cy="96"  r="3.5"  fill="white" />
          <circle  cx="116" cy="104" r="2"    fill="white" opacity="0.55" />

          <motion.ellipse cx="120" cy="91" rx="16" ry="0" fill="#f5f5f5"
            animate={{ ry: [0, 17, 17, 0] }}
            transition={{ duration: 0.28, times: [0, 0.35, 0.65, 1], repeat: Infinity, repeatDelay: 5, ease: 'easeInOut', delay: 0.06 }}
          />

          {/* ── Nose ── */}
          <path d="M94 121 L104 121 L99 128 Z" fill="#f5a0b0" />

          {/* ── Mouth ── */}
          <path d="M99 128 Q92 134 86 131" stroke="#d08090" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M99 128 Q106 134 112 131" stroke="#d08090" strokeWidth="1.6" fill="none" strokeLinecap="round" />

          {/* ── Cheek blush ── */}
          <ellipse cx="64" cy="118" rx="11" ry="6" fill="#f5b0c0" opacity="0.25" />
          <ellipse cx="134" cy="118" rx="11" ry="6" fill="#f5b0c0" opacity="0.25" />

          {/* ── Whiskers ── */}
          <line x1="22" y1="116" x2="74" y2="121" stroke="#c8c8c8" strokeWidth="1.2" />
          <line x1="22" y1="122" x2="74" y2="122" stroke="#c8c8c8" strokeWidth="1.2" />
          <line x1="22" y1="128" x2="74" y2="124" stroke="#c8c8c8" strokeWidth="1.2" />
          <line x1="124" y1="121" x2="176" y2="116" stroke="#c8c8c8" strokeWidth="1.2" />
          <line x1="124" y1="122" x2="176" y2="122" stroke="#c8c8c8" strokeWidth="1.2" />
          <line x1="124" y1="124" x2="176" y2="128" stroke="#c8c8c8" strokeWidth="1.2" />

          {/* ── Front paws ── */}
          <ellipse cx="70" cy="248" rx="22" ry="11" fill="#f0f0f0" />
          <circle cx="60"  cy="244" r="4.5" fill="#e4e4e4" />
          <circle cx="70"  cy="240" r="4.5" fill="#e4e4e4" />
          <circle cx="80"  cy="244" r="4.5" fill="#e4e4e4" />

          <ellipse cx="124" cy="248" rx="22" ry="11" fill="#f0f0f0" />
          <circle cx="114" cy="244" r="4.5" fill="#e4e4e4" />
          <circle cx="124" cy="240" r="4.5" fill="#e4e4e4" />
          <circle cx="134" cy="244" r="4.5" fill="#e4e4e4" />
        </svg>
      </motion.div>
    </div>
  );
}

/* ────────────────────────── SLEEPING POSE ────────────────────────── */
function SleepingCat({ size, className }) {
  const h = size * 0.7;

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      {/* Zzz bubbles */}
      <div style={{ position: 'relative', height: 40, width: size }}>
        {[
          { size: 10, x: '62%', y: 0,  delay: 0 },
          { size: 14, x: '70%', y: -14, delay: 0.6 },
          { size: 18, x: '80%', y: -28, delay: 1.2 },
        ].map(({ size: s, x, y, delay }, i) => (
          <motion.span
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              fontSize: s,
              color: 'rgba(28,49,68,0.55)',
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              lineHeight: 1,
            }}
            animate={{ opacity: [0, 0.8, 0], y: [-4, -12, -20] }}
            transition={{ duration: 2.4, delay, repeat: Infinity, ease: 'easeOut' }}
          >
            z
          </motion.span>
        ))}
      </div>

      {/* Sleeping cat body */}
      <svg
        width={size}
        height={h}
        viewBox="0 0 220 154"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 8px 24px rgba(28,49,68,0.2))' }}
      >
        {/* Curled body */}
        <ellipse cx="110" cy="120" rx="90" ry="38" fill="#f5f5f5" />
        <ellipse cx="80"  cy="110" rx="52" ry="30" fill="#ececec" opacity="0.5" />

        {/* Tail wrapping around */}
        <path d="M195 118 Q210 90 200 68 Q192 50 176 62 Q188 76 188 112 Z" fill="#e8e8e8" />

        {/* Head resting */}
        <circle cx="68" cy="82" r="46" fill="#f5f5f5" />
        <ellipse cx="52" cy="82" rx="14" ry="24" fill="#dcdcdc" opacity="0.22" />

        {/* Ears */}
        <polygon points="36,54 28,20 60,50" fill="#f0f0f0" />
        <polygon points="40,50 34,26 56,46" fill="#f5c0cc" opacity="0.6" />
        <polygon points="86,50 108,22 100,54" fill="#f0f0f0" />
        <polygon points="90,46 108,28 98,50" fill="#f5c0cc" opacity="0.6" />

        {/* Muzzle */}
        <ellipse cx="68" cy="96" rx="28" ry="20" fill="#efefef" />

        {/* Closed eyes — curved lines */}
        <path d="M51 74 Q57 68 63 74" stroke="#8a7070" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M73 74 Q79 68 85 74" stroke="#8a7070" strokeWidth="2.2" fill="none" strokeLinecap="round" />

        {/* Nose */}
        <path d="M64 90 L72 90 L68 96 Z" fill="#f5a0b0" />

        {/* Smile */}
        <path d="M68 96 Q63 100 59 98" stroke="#d08090" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M68 96 Q73 100 77 98" stroke="#d08090" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Cheeks */}
        <ellipse cx="44" cy="90" rx="9" ry="5" fill="#f5b0c0" opacity="0.28" />
        <ellipse cx="92" cy="90" rx="9" ry="5" fill="#f5b0c0" opacity="0.28" />

        {/* Whiskers */}
        <line x1="10" y1="87" x2="48" y2="92" stroke="#c8c8c8" strokeWidth="1.1" />
        <line x1="10" y1="93" x2="48" y2="93" stroke="#c8c8c8" strokeWidth="1.1" />
        <line x1="88" y1="92" x2="126" y2="87" stroke="#c8c8c8" strokeWidth="1.1" />
        <line x1="88" y1="93" x2="126" y2="93" stroke="#c8c8c8" strokeWidth="1.1" />

        {/* Front paws tucked */}
        <ellipse cx="126" cy="138" rx="28" ry="12" fill="#f0f0f0" />
        <circle cx="110" cy="134" r="5" fill="#e4e4e4" />
        <circle cx="122" cy="130" r="5" fill="#e4e4e4" />
        <circle cx="134" cy="130" r="5" fill="#e4e4e4" />
        <circle cx="146" cy="134" r="5" fill="#e4e4e4" />
      </svg>
    </div>
  );
}

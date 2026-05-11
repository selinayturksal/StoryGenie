import React from 'react';
import { motion } from 'framer-motion';

/*
 * "Pati" — the MasalMatik mascot.
 * Pure SVG + Framer Motion. No image file required.
 *
 * Props:
 *   size       – base width in px (height = size * 1.22)
 *   withBubble – show a speech bubble above the cat
 *   bubbleText – text in the speech bubble (supports \n)
 *   lightBubble – white-on-cream bubble (for dark sections)
 *   className  – wrapper class
 */
export default function CatMascot({
  size        = 220,
  withBubble  = false,
  bubbleText  = '',
  lightBubble = false,
  className   = '',
}) {
  const h = size * 1.22;

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      {/* ── Speech Bubble ── */}
      {withBubble && bubbleText && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.4 }}
          className={`cat-bubble ${lightBubble ? 'cat-bubble--light' : ''} animate-bubble`}
          style={{ marginBottom: 10 }}
        >
          {bubbleText}
        </motion.div>
      )}

      {/* ── Floating cat wrapper ── */}
      <motion.div
        animate={{
          y:      [0, -16, -7, 0],
          rotate: [0,  1.4, -0.9, 0],
        }}
        transition={{
          duration:   4.2,
          ease:       [0.45, 0, 0.55, 1],
          repeat:     Infinity,
          repeatType: 'loop',
        }}
        style={{ willChange: 'transform' }}
      >
        <svg
          width={size}
          height={h}
          viewBox="0 0 200 245"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Pati the cat"
          style={{ filter: 'drop-shadow(0 14px 36px rgba(117,70,104,0.22))' }}
        >
          {/* ═════════════════ TAIL (behind body) ════════════════ */}
          <motion.path
            d="M152 208 Q182 168 172 130 Q166 112 154 124 Q164 150 157 200 Z"
            fill="#c0ae98"
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity }}
            style={{ transformOrigin: '155px 208px' }}
          />

          {/* ═════════════════ BODY ════════════════ */}
          <ellipse cx="100" cy="203" rx="60" ry="50" fill="#c5b49f"/>
          {/* Body soft shading */}
          <ellipse cx="78" cy="196" rx="20" ry="14" fill="#b0a08a" opacity="0.22"/>
          <ellipse cx="118" cy="210" rx="18" ry="12" fill="#b0a08a" opacity="0.14"/>

          {/* ═════════════════ EARS ════════════════ */}
          {/* Left ear */}
          <polygon points="44,80 36,30 78,75" fill="#c5b49f"/>
          <polygon points="48,74 42,40 72,70" fill="#f0a0b2"/>
          {/* Right ear */}
          <polygon points="122,75 164,30 156,80" fill="#c5b49f"/>
          <polygon points="128,70 158,40 152,74" fill="#f0a0b2"/>

          {/* ═════════════════ HEAD ════════════════ */}
          <circle cx="100" cy="107" r="64" fill="#c5b49f"/>
          {/* Side shading */}
          <ellipse cx="68" cy="107" rx="20" ry="34" fill="#b0a08a" opacity="0.18"/>
          <ellipse cx="132" cy="107" rx="20" ry="34" fill="#b0a08a" opacity="0.18"/>

          {/* ── Forehead stripes ── */}
          <path d="M88 52 Q96 41 104 52" stroke="#a89070" strokeWidth="2.6" fill="none" strokeLinecap="round"/>
          <path d="M76 60 Q82 49 89 60"  stroke="#a89070" strokeWidth="2.1" fill="none" strokeLinecap="round"/>
          <path d="M111 60 Q118 49 124 60" stroke="#a89070" strokeWidth="2.1" fill="none" strokeLinecap="round"/>

          {/* ── Muzzle (lighter area) ── */}
          <ellipse cx="100" cy="123" rx="38" ry="28" fill="#e2d6c4"/>

          {/* ═════════════════ EYES ════════════════ */}
          {/* Left eye — white */}
          <ellipse cx="79" cy="96" rx="17.5" ry="18.5" fill="white"/>
          {/* Left eye — teal iris */}
          <ellipse cx="79" cy="97" rx="12.5" ry="13.5" fill="#5497A7"/>
          {/* Left eye — pupil */}
          <ellipse cx="79" cy="97" rx="7.5"  ry="9.5"  fill="#131d24"/>
          {/* Highlights */}
          <circle cx="83.5" cy="92" r="4"   fill="white"/>
          <circle cx="74.5" cy="101" r="2"  fill="white" opacity="0.6"/>

          {/* Animated eyelid (blink) */}
          <motion.ellipse
            cx="79" cy="87"
            rx="17.5" ry="0"
            fill="#c5b49f"
            animate={{ ry: [0, 18.5, 18.5, 0] }}
            transition={{
              duration: 0.28,
              times: [0, 0.35, 0.65, 1],
              repeat: Infinity,
              repeatDelay: 4.2,
              ease: 'easeInOut',
            }}
          />

          {/* Right eye — white */}
          <ellipse cx="121" cy="96" rx="17.5" ry="18.5" fill="white"/>
          {/* Right eye — teal iris */}
          <ellipse cx="121" cy="97" rx="12.5" ry="13.5" fill="#5497A7"/>
          {/* Right eye — pupil */}
          <ellipse cx="121" cy="97" rx="7.5"  ry="9.5"  fill="#131d24"/>
          {/* Highlights */}
          <circle cx="125.5" cy="92" r="4"   fill="white"/>
          <circle cx="116.5" cy="101" r="2"  fill="white" opacity="0.6"/>

          {/* Animated eyelid (blink) */}
          <motion.ellipse
            cx="121" cy="87"
            rx="17.5" ry="0"
            fill="#c5b49f"
            animate={{ ry: [0, 18.5, 18.5, 0] }}
            transition={{
              duration: 0.28,
              times: [0, 0.35, 0.65, 1],
              repeat: Infinity,
              repeatDelay: 4.2,
              ease: 'easeInOut',
            }}
          />

          {/* ═════════════════ NOSE ════════════════ */}
          <path d="M95 119 L105 119 L100 126 Z" fill="#e87890"/>
          <ellipse cx="98.5" cy="119" rx="2.8" ry="1.6" fill="#f4adc0" opacity="0.8"/>

          {/* ═════════════════ MOUTH ════════════════ */}
          <path d="M100 126 Q93 132 87 129" stroke="#c06878" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <path d="M100 126 Q107 132 113 129" stroke="#c06878" strokeWidth="1.8" fill="none" strokeLinecap="round"/>

          {/* ═════════════════ CHEEK BLUSH ════════════════ */}
          <ellipse cx="66" cy="115" rx="12.5" ry="6.5" fill="#f0a0b0" opacity="0.28"/>
          <ellipse cx="134" cy="115" rx="12.5" ry="6.5" fill="#f0a0b0" opacity="0.28"/>

          {/* ═════════════════ WHISKERS ════════════════ */}
          <line x1="22" y1="112" x2="79" y2="118" stroke="#d5cab8" strokeWidth="1.4"/>
          <line x1="22" y1="118" x2="79" y2="119" stroke="#d5cab8" strokeWidth="1.4"/>
          <line x1="22" y1="124" x2="79" y2="121" stroke="#d5cab8" strokeWidth="1.4"/>
          <line x1="121" y1="118" x2="178" y2="112" stroke="#d5cab8" strokeWidth="1.4"/>
          <line x1="121" y1="119" x2="178" y2="118" stroke="#d5cab8" strokeWidth="1.4"/>
          <line x1="121" y1="121" x2="178" y2="124" stroke="#d5cab8" strokeWidth="1.4"/>

          {/* ═════════════════ BANDANA ════════════════ */}
          {/* Main bandana shape */}
          <path d="M51 153 Q100 170 149 153 Q143 144 100 160 Q57 144 51 153 Z" fill="#5497A7"/>
          {/* Bow/knot */}
          <path d="M91 148 L109 148 L106 159 L100 154 L94 159 Z" fill="#3a7a8c"/>
          <circle cx="100" cy="151" r="4.5" fill="#2c6070"/>
          {/* Paw prints on bandana */}
          <circle cx="73" cy="157" r="3.8" fill="#3a7a8c" opacity="0.5"/>
          <circle cx="70" cy="153"  r="1.7" fill="#3a7a8c" opacity="0.4"/>
          <circle cx="74" cy="152"  r="1.7" fill="#3a7a8c" opacity="0.4"/>
          <circle cx="78" cy="153.5" r="1.7" fill="#3a7a8c" opacity="0.4"/>

          <circle cx="127" cy="157" r="3.8" fill="#3a7a8c" opacity="0.5"/>
          <circle cx="124" cy="153"  r="1.7" fill="#3a7a8c" opacity="0.4"/>
          <circle cx="128" cy="152"  r="1.7" fill="#3a7a8c" opacity="0.4"/>
          <circle cx="132" cy="153.5" r="1.7" fill="#3a7a8c" opacity="0.4"/>

          {/* ═════════════════ PAWS ════════════════ */}
          {/* Left paw */}
          <ellipse cx="68" cy="234" rx="24" ry="12.5" fill="#c5b49f"/>
          <ellipse cx="68" cy="238" rx="9"  ry="5.5"  fill="#d4c2ac"/>
          <circle cx="58"  cy="229" r="5" fill="#d4c2ac"/>
          <circle cx="68"  cy="226" r="5" fill="#d4c2ac"/>
          <circle cx="78"  cy="229" r="5" fill="#d4c2ac"/>

          {/* Right paw */}
          <ellipse cx="132" cy="234" rx="24" ry="12.5" fill="#c5b49f"/>
          <ellipse cx="132" cy="238" rx="9"  ry="5.5"  fill="#d4c2ac"/>
          <circle cx="122" cy="229" r="5" fill="#d4c2ac"/>
          <circle cx="132" cy="226" r="5" fill="#d4c2ac"/>
          <circle cx="142" cy="229" r="5" fill="#d4c2ac"/>
        </svg>
      </motion.div>
    </div>
  );
}

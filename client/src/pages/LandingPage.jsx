import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLang } from '../context/LangContext';
import StarField from '../components/StarField';
import NightDecorations from '../components/NightDecorations';
import './LandingPage.css';

const EASE = [0.16, 1, 0.3, 1];

const fadeUp = (delay = 0) => ({
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: EASE, delay } },
});

const stagger = (delay = 0) => ({
  hidden:  {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: delay } },
});

export default function LandingPage() {
  const { t } = useLang();
  const lp = t.landing;

  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div className="lp-root">
      <motion.div className="lp-progress" style={{ width: progressWidth }} />

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="lp-hero">
        <StarField />
        <NightDecorations />

        <div className="container lp-hero-inner">
          <motion.div
            className="lp-hero-text"
            initial="hidden"
            animate="visible"
            variants={stagger(0.15)}
          >
            <motion.div className="lp-hero-badge" variants={fadeUp()}>
              {lp.hero.badge}
            </motion.div>

            <motion.h1 className="lp-hero-title" variants={fadeUp(0.05)}>
              {lp.hero.title.split('\n').map((line, i) => (
                <React.Fragment key={i}>{line}{i === 0 && <br />}</React.Fragment>
              ))}
            </motion.h1>

            <motion.p className="lp-hero-subtitle" variants={fadeUp(0.1)}>
              {lp.hero.subtitle}
            </motion.p>

            <motion.div className="lp-hero-actions" variants={fadeUp(0.16)}>
              <Link to="/register" className="lp-btn-primary">
                {t.auth.register}
              </Link>
              <Link to="/login" className="lp-btn-ghost">
                {t.auth.login}
              </Link>
            </motion.div>
          </motion.div>

          {/* Night icon — large crescent + stars composition */}
          <motion.div
            className="lp-hero-icon"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
          >
            <svg viewBox="0 0 260 260" width="260" height="260" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Glow halo */}
              <circle cx="130" cy="130" r="110" fill="rgba(117,70,104,0.12)" />
              <circle cx="130" cy="130" r="85"  fill="rgba(117,70,104,0.1)" />

              {/* Large crescent moon */}
              <motion.g
                animate={{ y: [0, -10, -4, 0], rotate: [-6, 4, -2, 0] }}
                transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity }}
                style={{ transformOrigin: '130px 130px' }}
              >
                <path
                  d="M155 60 A75 75 0 1 0 155 200 A55 55 0 1 1 155 60 Z"
                  fill="rgba(210,195,255,0.75)"
                />
                {/* Moon texture shading */}
                <ellipse cx="105" cy="105" rx="12" ry="8" fill="rgba(150,130,200,0.18)" />
                <ellipse cx="120" cy="155" rx="8"  ry="6" fill="rgba(150,130,200,0.12)" />
                <ellipse cx="92"  cy="148" rx="10" ry="7" fill="rgba(150,130,200,0.15)" />
              </motion.g>

              {/* Orbiting sparkle stars */}
              {[
                { cx: 190, cy:  72, r: 4.5, delay: 0 },
                { cx: 212, cy: 130, r: 3,   delay: 0.6 },
                { cx: 196, cy: 190, r: 3.5, delay: 1.1 },
                { cx:  48, cy:  88, r: 3,   delay: 0.3 },
                { cx:  38, cy: 160, r: 4,   delay: 0.9 },
                { cx: 165, cy:  42, r: 2.5, delay: 1.5 },
              ].map(({ cx, cy, r, delay }) => (
                <motion.g key={`${cx}-${cy}`}>
                  {/* Cross sparkle */}
                  <motion.line
                    x1={cx} y1={cy - r * 1.8} x2={cx} y2={cy + r * 1.8}
                    stroke="rgba(220,210,255,0.85)" strokeWidth="1.2" strokeLinecap="round"
                    animate={{ opacity: [0.2, 1, 0.2], scaleY: [0.6, 1, 0.6] }}
                    transition={{ duration: 2.5, delay, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                  />
                  <motion.line
                    x1={cx - r * 1.8} y1={cy} x2={cx + r * 1.8} y2={cy}
                    stroke="rgba(220,210,255,0.85)" strokeWidth="1.2" strokeLinecap="round"
                    animate={{ opacity: [0.2, 1, 0.2], scaleX: [0.6, 1, 0.6] }}
                    transition={{ duration: 2.5, delay, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                  />
                  <motion.circle
                    cx={cx} cy={cy} r={r * 0.55}
                    fill="rgba(255,240,200,0.9)"
                    animate={{ opacity: [0.4, 1, 0.4], r: [r * 0.4, r * 0.65, r * 0.4] }}
                    transition={{ duration: 2.5, delay, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.g>
              ))}

              {/* Small open book at the bottom */}
              <g transform="translate(95, 192)">
                <path d="M0 0 Q0 -4 4 -4 L32 -1 L32 24 L4 21 Q0 21 0 17 Z" fill="rgba(200,185,255,0.55)" />
                <path d="M70 0 Q70 -4 66 -4 L38 -1 L38 24 L66 21 Q70 21 70 17 Z" fill="rgba(200,185,255,0.65)" />
                <rect x="32" y="-4" width="6" height="28" rx="3" fill="rgba(180,160,240,0.45)" />
                {/* Page lines */}
                <line x1="6"  y1="5"  x2="28" y2="5"  stroke="rgba(255,255,255,0.3)" strokeWidth="1.2"/>
                <line x1="6"  y1="10" x2="28" y2="10" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2"/>
                <line x1="6"  y1="15" x2="22" y2="15" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2"/>
                <line x1="42" y1="5"  x2="64" y2="5"  stroke="rgba(255,255,255,0.3)" strokeWidth="1.2"/>
                <line x1="42" y1="10" x2="64" y2="10" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2"/>
                <line x1="48" y1="15" x2="64" y2="15" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2"/>
              </g>
            </svg>
          </motion.div>
        </div>

        {/* Wave to next section */}
        <div className="lp-wave-bottom">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
            <path d="M0 20 C360 90 1080 0 1440 55 L1440 90 L0 90 Z" fill="var(--lp-section-bg)" />
          </svg>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="lp-section">
        <div className="container">
          <motion.div
            className="lp-section-head"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp()}
          >
            <h2 className="lp-section-title">{lp.how.title}</h2>
            <p className="lp-section-sub">{lp.how.subtitle}</p>
          </motion.div>

          <motion.div
            className="lp-steps-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger(0.08)}
          >
            {lp.how.steps.map((step, i) => (
              <motion.div key={i} className="lp-step-card" variants={fadeUp()}>
                <div className="lp-step-num">{i + 1}</div>
                <div className="lp-step-icon">{step.icon}</div>
                <h3 className="lp-step-title">{step.title}</h3>
                <p className="lp-step-desc">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="lp-section lp-section-alt">
        <div className="container">
          <motion.div
            className="lp-section-head"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp()}
          >
            <h2 className="lp-section-title">{lp.features.title}</h2>
          </motion.div>

          <motion.div
            className="lp-features-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger(0.05)}
          >
            {lp.features.items.map((item, i) => (
              <motion.div key={i} className="lp-feature-card" variants={fadeUp()}>
                <div className="lp-feature-icon">{item.icon}</div>
                <h3 className="lp-feature-title">{item.title}</h3>
                <p className="lp-feature-desc">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ PREVIEW ═══════════════ */}
      <section className="lp-section">
        <div className="container lp-preview-inner">
          <motion.div
            className="lp-preview-book"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="lp-book-stripe" />
            <div className="lp-preview-label">{lp.preview.label}</div>
            <h3 className="lp-preview-story-title">{lp.preview.storyTitle}</h3>
            <p className="lp-preview-excerpt">{lp.preview.excerpt}</p>
            <div className="lp-preview-tags">
              <span className="lp-preview-tag">{lp.preview.age}</span>
              <span className="lp-preview-tag">{lp.preview.duration}</span>
            </div>
          </motion.div>

          <motion.div
            className="lp-preview-pitch"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.12 }}
          >
            <h2 className="lp-section-title">{lp.preview.heading}</h2>
            <p className="lp-section-sub" style={{ margin: 0 }}>{lp.preview.desc}</p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="lp-cta">
        <StarField />
        <NightDecorations />
        <div className="lp-cta-orb lp-cta-orb--tl" />
        <div className="lp-cta-orb lp-cta-orb--br" />

        <div className="container lp-cta-inner">
          <motion.div
            className="lp-cta-text"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger(0)}
          >
            <motion.h2 className="lp-cta-title" variants={fadeUp()}>
              {lp.cta.title}
            </motion.h2>
            <motion.p className="lp-cta-sub" variants={fadeUp(0.06)}>
              {lp.cta.subtitle}
            </motion.p>
            <motion.div variants={fadeUp(0.12)}>
              <Link to="/register" className="lp-btn-cta">
                {lp.cta.btn}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="lp-footer">
        <p>{lp.footer.copy}</p>
      </footer>
    </div>
  );
}

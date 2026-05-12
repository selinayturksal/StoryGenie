import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLang } from '../context/LangContext';
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
  const { t, lang } = useLang();
  const lp = t.landing;
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    const navbar = document.querySelector('.navbar');
    if (navbar) navbar.classList.add('navbar-transparent');
    return () => { if (navbar) navbar.classList.remove('navbar-transparent'); };
  }, []);

  return (
    <div className="lp-root">
      <motion.div className="lp-progress" style={{ width: progressWidth }} />

      {/* ═══ HERO ═══ */}
      <section className="lp-hero">
        <img src="/hero_bg.png" alt="" className="lp-hero-img" />
        <div className="lp-hero-overlay" />

        <div className="container lp-hero-inner">
          <motion.div className="lp-hero-text" initial="hidden" animate="visible" variants={stagger(0.15)}>
            <motion.h1 className="lp-hero-title" variants={fadeUp(0.05)}>
              {lang === 'tr'
                ? <>{`Hayal gücü`}<br/>{`sınırsız,`}<br/>{`masallar sonsuz.`}</>
                : <>{`Imagination`}<br/>{`unlimited,`}<br/>{`stories endless.`}</>}
            </motion.h1>
            <motion.p className="lp-hero-subtitle" variants={fadeUp(0.1)}>
              {lang === 'tr'
                ? 'Çocuğunuza özel, her gece farklı bir uyku masalı oluşturun. Karakterleri siz seçin, sihri biz yaratalım!'
                : 'Create unique bedtime stories tailored for your child every night. You choose the characters, we weave the magic!'}
            </motion.p>
            <motion.div className="lp-hero-actions" variants={fadeUp(0.16)}>
              <Link to="/register" className="lp-btn-primary">
                {lang === 'tr' ? 'Ücretsiz Başla' : 'Get Started — Free!'} ★
              </Link>
              <Link to="/login" className="lp-btn-ghost">
                {lang === 'tr' ? 'Giriş Yap' : 'Log In'}
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Alt mini feature strip */}
        <motion.div
          className="lp-hero-strip"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
        >
          <div className="container lp-strip-inner">
            <div className="lp-strip-item">
              <div className="lp-strip-icon">📖</div>
              <div>
                <strong>{lang === 'tr' ? 'Yapay Zeka Masalları' : 'AI-Powered Stories'}</strong>
                <span>{lang === 'tr' ? 'Çocuğunuza özel hikayeler.' : 'Unique stories for your child.'}</span>
              </div>
            </div>
            <div className="lp-strip-divider" />
            <div className="lp-strip-item">
              <div className="lp-strip-icon">🛡️</div>
              <div>
                <strong>{lang === 'tr' ? 'Güvenli & Reklamasız' : 'Safe & Child-Friendly'}</strong>
                <span>{lang === 'tr' ? 'Güvenli içerik ortamı.' : '100% safe content in a secure environment.'}</span>
              </div>
            </div>
            <div className="lp-strip-divider" />
            <div className="lp-strip-item">
              <div className="lp-strip-icon">💜</div>
              <div>
                <strong>{lang === 'tr' ? 'Aileler Tarafından Sevilen' : 'Loved by Families'}</strong>
                <span>{lang === 'tr' ? 'Ebeveynler güveniyor.' : 'Trusted by parents, loved by children.'}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="lp-section">
        <div className="container">
          <motion.div className="lp-section-head" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={fadeUp()}>
            <h2 className="lp-section-title">{lp.how.title}</h2>
            <p className="lp-section-sub">{lp.how.subtitle}</p>
          </motion.div>
          <motion.div className="lp-steps-grid" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={stagger(0.08)}>
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

      {/* ═══ FEATURES ═══ */}
      <section className="lp-section lp-section-alt">
        <div className="container">
          <motion.div className="lp-section-head" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={fadeUp()}>
            <h2 className="lp-section-title">{lp.features.title}</h2>
          </motion.div>
          <motion.div className="lp-features-grid" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={stagger(0.05)}>
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

      {/* ═══ PREVIEW ═══ */}
      <section className="lp-section">
        <div className="container lp-preview-inner">
          <motion.div className="lp-preview-book" initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, ease: EASE }}>
            <div className="lp-book-stripe" />
            <div className="lp-preview-label">{lp.preview.label}</div>
            <h3 className="lp-preview-story-title">{lp.preview.storyTitle}</h3>
            <p className="lp-preview-excerpt">{lp.preview.excerpt}</p>
            <div className="lp-preview-tags">
              <span className="lp-preview-tag">{lp.preview.age}</span>
              <span className="lp-preview-tag">{lp.preview.duration}</span>
            </div>
          </motion.div>
          <motion.div className="lp-preview-pitch" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, ease: EASE, delay: 0.12 }}>
            <h2 className="lp-section-title">{lp.preview.heading}</h2>
            <p className="lp-section-sub" style={{ margin: 0 }}>{lp.preview.desc}</p>
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="lp-cta">
        <div className="lp-cta-bg"><img src="/cta_bg.png" alt="" /></div>
        <div className="lp-cta-orb lp-cta-orb--tl" />
        <div className="lp-cta-orb lp-cta-orb--br" />
        <div className="container lp-cta-inner">
          <motion.div className="lp-cta-text" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger(0)}>
            <motion.h2 className="lp-cta-title" variants={fadeUp()}>{lp.cta.title}</motion.h2>
            <motion.p className="lp-cta-sub" variants={fadeUp(0.06)}>{lp.cta.subtitle}</motion.p>
            <motion.div variants={fadeUp(0.12)}>
              <Link to="/register" className="lp-btn-cta">{lp.cta.btn}</Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <footer className="lp-footer"><p>{lp.footer.copy}</p></footer>
    </div>
  );
}
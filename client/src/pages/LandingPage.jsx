import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLang } from '../context/LangContext';
import './LandingPage.css';

const EASE = [0.16, 1, 0.3, 1];
const fadeUp = (d=0) => ({ hidden:{opacity:0,y:40}, visible:{opacity:1,y:0,transition:{duration:0.72,ease:EASE,delay:d}} });
const stagger = (d=0) => ({ hidden:{}, visible:{transition:{staggerChildren:0.11,delayChildren:d}} });

const FEATURES = [
  { icon:'⭐', tr:['Sana Özel Masallar','Her masal yalnızca senin çocuğun için özel olarak yazılır.'], en:['Personalized Stories','Every story is uniquely written just for your child.'] },
  { icon:'🌍', tr:['Türkçe & İngilizce','İki dilde masal oluştur, dil gelişimini destekle.'], en:['Turkish & English','Create stories in two languages to support language development.'] },
  { icon:'👶', tr:['Yaşa Uygun İçerik','2-12 yaş arasındaki her çocuğa uygun hikayeler.'], en:['Age-Appropriate','Stories perfectly suited for children aged 2-12.'] },
  { icon:'🌟', tr:['Topluluk & Keşif','Diğer ailelerin masallarını keşfet ve en iyileri puanla.'], en:['Community & Explore','Discover stories from other families and rate the best.'] },
  { icon:'🔊', tr:['Sesli Okuma','Hikayeni sesli dinle, uyku vaktini büyülü hale getir.'], en:['Read Aloud','Listen to your story and make bedtime magical.'] },
  { icon:'🛡️', tr:['Güvenli & Reklamasız','Çocukların özgürce keşfedebileceği güvenli ortam.'], en:['Safe & Ad-Free','A secure child-friendly environment to explore.'] },
];

const HOW_STEPS = [
  {
    num:'1',
    darkImg:'/how_dark_1.png', lightImg:'/how_light_1.png',
    tr:['Dünyani & Karakterlerini Seç','Favori karakterlerini, temanı ve mekânını seç.'],
    en:['Choose Your World & Characters','Select your favorite characters, theme, and setting.'],
  },
  {
    num:'2',
    darkImg:'/how_dark_2.png', lightImg:'/how_light_2.png',
    tr:['Yapay Zeka Masalını Yazar','Yapay zekamız çocuğuna özel, benzersiz bir hikaye oluşturur.'],
    en:['AI Creates Your Story','Our AI crafts a unique, personalized story just for your child.'],
  },
  {
    num:'3',
    darkImg:'/how_dark_3.png', lightImg:'/how_light_3.png',
    tr:['Oku, Dinle & Eğlen','Masalı birlikte oku, sesli dinle ve sihrin gerçekleşmesine izin ver.'],
    en:['Read, Listen & Enjoy','Read the story together, listen to the narration, and let the magic come to life.'],
  },
];

export default function LandingPage() {
  const { t, lang } = useLang();
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0,1], ['0%','100%']);

  // Tema toggle'landığında re-render et
  const [isDark, setIsDark] = React.useState(
    () => document.documentElement.getAttribute('data-theme') === 'dark'
  );
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const nb = document.querySelector('.navbar');
    if (nb) nb.classList.add('navbar-hero');
    return () => { if (nb) nb.classList.remove('navbar-hero'); };
  }, []);

  return (
    <div className="lp-root">
      <motion.div className="lp-progress" style={{ width: progressWidth }} />

      {/* ═══ HERO ═══ */}
      <section className="lp-hero" id="anasayfa">
        <img 
            src={isDark ? "/hero_bg.png" : "/day.png"} 
            alt="" 
            className="lp-hero-img" 
          />        
        <div className="lp-hero-overlay" />
        <div className="lp-hero-content">
          <motion.div className="lp-hero-text" initial="hidden" animate="visible" variants={stagger(0.1)}>
            <motion.h1 className="lp-hero-title" variants={fadeUp(0.05)}>
              {lang==='tr'
                ? <>{`Hayal gücü`}<br/><span>{`sınırsız,`}</span><br/>{`masallar sonsuz.`}</>
                : <>{`Imagination`}<br/><span>{`unlimited,`}</span><br/>{`stories endless.`}</>}
            </motion.h1>
            <motion.p className="lp-hero-sub" variants={fadeUp(0.12)}>
              {lang==='tr'
                ? 'Çocuğunuza özel, her gece farklı bir uyku masalı oluşturun. Karakterleri siz seçin, sihri biz yaratalım!'
                : 'Create unique bedtime stories tailored for your child every night. You choose the characters, we weave the magic!'}
            </motion.p>
            <motion.div className="lp-hero-btns" variants={fadeUp(0.18)}>
              <Link to="/register" className="lp-btn-primary">{lang==='tr' ? 'Ücretsiz Başla ★' : 'Get Started — Free ★'}</Link>
              <Link to="/login"    className="lp-btn-ghost">{lang==='tr' ? 'Giriş Yap' : 'Log In'}</Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ ÖZELLİKLER ═══ */}
      <section className="lp-features-section" id="ozellikler">
        <div className="container">
          <motion.div className="lp-sec-head" initial="hidden" whileInView="visible" viewport={{once:true,margin:'-60px'}} variants={fadeUp()}>
            <h2>{lang==='tr' ? 'Neden Masalmatik?' : 'Why Masalmatik?'}</h2>
            <p>{lang==='tr' ? 'Çocuğunuza büyülü bir hikaye deneyimi yaşatın.' : 'Give your child a magical storytelling experience.'}</p>
          </motion.div>
          <motion.div className="lp-feat-grid" initial="hidden" whileInView="visible" viewport={{once:true,margin:'-40px'}} variants={stagger(0.07)}>
            {FEATURES.map((f,i) => (
              <motion.div key={i} className="lp-feat-card" variants={fadeUp()}>
                <div className="lp-feat-icon">{f.icon}</div>
                <h3>{lang==='tr' ? f.tr[0] : f.en[0]}</h3>
                <p>{lang==='tr' ? f.tr[1] : f.en[1]}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ NASIL ÇALIŞIR ═══ */}
      <section className="lp-how-section" id="nasil-calisir">
        <div className="container">
          <motion.div className="lp-sec-head lp-sec-head--how" initial="hidden" whileInView="visible" viewport={{once:true,margin:'-60px'}} variants={fadeUp()}>
            <h2>{lang==='tr' ? 'Masalmatik Nasıl Çalışır?' : 'How Masalmatik Works'}</h2>
            <p>{lang==='tr' ? 'Üç basit adımda büyülü masallar oluşturun.' : 'Create magical stories in three simple steps.'}</p>
          </motion.div>

          <motion.div className="lp-how-grid" initial="hidden" whileInView="visible" viewport={{once:true,margin:'-40px'}} variants={stagger(0.12)}>
            {HOW_STEPS.map((s,i) => (
              <React.Fragment key={i}>
                <motion.div className="lp-how-card" variants={fadeUp()}>
                  <div className="lp-how-num">{s.num}</div>
                  <div className="lp-how-img-wrap">
                    <img
                      src={isDark ? s.darkImg : s.lightImg}
                      alt={lang==='tr' ? s.tr[0] : s.en[0]}
                      className="lp-how-img"
                    />
                  </div>
                  <h3>{lang==='tr' ? s.tr[0] : s.en[0]}</h3>
                  <p>{lang==='tr' ? s.tr[1] : s.en[1]}</p>
                </motion.div>
                {i < HOW_STEPS.length-1 && (
                  <div className="lp-how-arrow">· · ›</div>
                )}
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ ÖRNEK HİKAYE ═══ */}
      <section className="lp-showcase" id="ornek">
        <div className="container">
          <motion.div className="lp-sec-head" initial="hidden" whileInView="visible" viewport={{once:true,margin:'-60px'}} variants={fadeUp()}>
            <h2>{lang==='tr' ? 'Masalmatik\'in Sihrine Bakın' : 'See the Magic of Masalmatik'}</h2>
            <p>{lang==='tr' ? 'Her masal benzersiz, kişisel ve hayal dolu.' : 'Every story is unique, personalized and full of imagination.'}</p>
          </motion.div>

          <motion.div className="lp-showcase-card" initial="hidden" whileInView="visible" viewport={{once:true,margin:'-40px'}} variants={fadeUp(0.08)}>
            {/* Sol: nasıl oluşturuldu */}
            <div className="lp-showcase-meta">
              <h4>{lang==='tr' ? 'Bu masal nasıl oluşturuldu' : 'How this story was created'}</h4>
              <div className="lp-showcase-meta-item">
                <div className="lp-showcase-meta-avatar" style={{background:'linear-gradient(135deg,#f9a8d4,#c084fc)'}}>👦</div>
                <div>
                  <div className="lp-showcase-meta-label">{lang==='tr' ? 'Kahraman' : 'Hero'}</div>
                  <div className="lp-showcase-meta-val">Emir</div>
                </div>
              </div>
              <div className="lp-showcase-meta-line" />
              <div className="lp-showcase-meta-item">
                <div className="lp-showcase-meta-avatar" style={{background:'linear-gradient(135deg,#6ee7b7,#3b82f6)'}}>🏰</div>
                <div>
                  <div className="lp-showcase-meta-label">{lang==='tr' ? 'Dünya' : 'World'}</div>
                  <div className="lp-showcase-meta-val">{lang==='tr' ? 'Büyülü Orman' : 'Enchanted Forest'}</div>
                </div>
              </div>
              <div className="lp-showcase-meta-line" />
              <div className="lp-showcase-meta-item">
                <div className="lp-showcase-meta-avatar" style={{background:'linear-gradient(135deg,#fbbf24,#a78bfa)'}}>🛡️</div>
                <div>
                  <div className="lp-showcase-meta-label">{lang==='tr' ? 'Ders' : 'Lesson'}</div>
                  <div className="lp-showcase-meta-val">{lang==='tr' ? 'Cesaret & İyilik' : 'Courage & Kindness'}</div>
                </div>
              </div>
            </div>

            {/* Orta: hikaye metni */}
            <div className="lp-showcase-story">
              <h3>{lang==='tr' ? 'Emir ve Gizli Işık ✨' : 'Emir and the Hidden Light ✨'}</h3>
              <p>{lang==='tr'
                ? 'Bir zamanlar Emir adında meraklı ve cesur bir küçük çocuk vardı. Köyünün yakınındaki Büyülü Orman\'ı keşfetmeyi çok severdi.'
                : 'Once upon a time, Emir was a curious and brave little boy who loved exploring the Enchanted Forest near his village.'}</p>
              <p>{lang==='tr'
                ? 'Bir gün ormanın sihirli ışığının kaybolduğunu fark etti. Gökkuşağı soluyordu ve hayvanlar üzgündü.'
                : 'One day, he discovered that the forest\'s magical light had disappeared. The rainbow was fading, and the animals were feeling sad.'}</p>
              <p>{lang==='tr'
                ? 'Emir gizli ışığı bulmaya karar verdi. Pırıltılı nehri geçti, altın tepesine tırmandı ve küçük bir ateşböceğinin yolunu bulmasına yardım etti.'
                : 'Emir decided to find the hidden light. He crossed the sparkling river, climbed the golden hill, and helped a tiny firefly find its way home.'}</p>
              <p>{lang==='tr'
                ? 'Ateşböceği güldü: "Teşekkür ederim Emir! Sen çok iyi kalplisin." Emir ışığı ormana geri getirdi ve her şey eskisinden daha parlak parladı. 🌈'
                : 'The firefly smiled: "Thank you, Emir! You are kind and brave." Emir brought the light back to the forest, and everything shined brighter than ever! 🌈'}</p>
              <div className="lp-showcase-tags">
                <span className="lp-showcase-tag lp-showcase-tag--green">🌿 {lang==='tr' ? '3-7 Yaş' : 'For Ages 3-7'}</span>
                <span className="lp-showcase-tag lp-showcase-tag--blue">⏱ {lang==='tr' ? '5 dk okuma' : '5 min read'}</span>
                <span className="lp-showcase-tag lp-showcase-tag--pink">❤️ {lang==='tr' ? 'Olumlu Değerler' : 'Positive Values'}</span>
                <span className="lp-showcase-tag lp-showcase-tag--purple">✦ {lang==='tr' ? 'Yapay Zeka' : 'AI-Powered'}</span>
              </div>
            </div>

            {/* Sağ: görsel */}
            <div className="lp-showcase-img-wrap">
              <img src="/image.png" alt={lang==='tr' ? 'Örnek masal görseli' : 'Example story illustration'} className="lp-showcase-img" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA + FOOTER ═══ */}
      <section className="lp-cta" id="iletisim">
        <div className="lp-cta-bg"><img src={isDark ? "/cta_bg.png" : "/dayfooter.png"} alt="" /></div>

        {/* Çağrı metni */}
        <div className="container lp-cta-inner">
          <motion.div className="lp-cta-text" initial="hidden" whileInView="visible" viewport={{once:true}} variants={stagger(0)}>
            <motion.h2 variants={fadeUp()}>{lang==='tr' ? 'Hadi İlk Masalını Oluştur!' : "Let's Create Your First Story!"}</motion.h2>
            <motion.p variants={fadeUp(0.06)}>{lang==='tr' ? 'Ücretsiz hesap aç, hemen başla.' : 'Create a free account and start right away.'}</motion.p>
            <motion.div variants={fadeUp(0.12)}>
              <Link to="/register" className="lp-btn-cta">{lang==='tr' ? '✨ Ücretsiz Başla' : '✨ Start for Free'}</Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Marka + footer — görselin üzerinde */}
        <footer className="lp-footer">
          <div className="lp-footer-brand">
            <img src="/logo.png" alt="Masalmatik" className="lp-footer-logo" />
            <span className="lp-footer-name">Masalmatik</span>
            <p className="lp-footer-slogan">
              {lang==='tr' ? '✨ Küçük hayalciler için sevgiyle yapıldı' : '✨ Made with love for little dreamers'}
            </p>
          </div>

          <div className="lp-footer-bottom">
            <a href="mailto:destek@masalmatik.com" className="lp-footer-link">{lang==='tr' ? '✉ İletişim' : '✉ Contact'}</a>
            <span className="lp-footer-dot">·</span>
            <a href="/privacy" className="lp-footer-link">{lang==='tr' ? '🔒 Gizlilik Politikası' : '🔒 Privacy Policy'}</a>
            <span className="lp-footer-dot">·</span>
            <span className="lp-footer-copy">© 2026 Masalmatik</span>
          </div>
        </footer>
      </section>
    </div>
  );
}
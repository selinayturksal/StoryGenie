import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import CharacterCard from '../components/CharacterCard';
import BookOpeningTransition from '../components/BookOpeningTransition';
import {
  GIRL_CHARACTERS, BOY_CHARACTERS, ANIMAL_CHARACTERS, LOCATIONS,
  AGE_OPTIONS, STORY_LANGUAGES,
} from '../data/storyOptions';
import api from '../services/api';
import './CreateStory.css';

const MAX_CHARS = 6;

// Adım tanımları
const STEPS = ['humans', 'animals', 'location', 'settings'];

export default function CreateStory() {
  const { t, lang } = useLang();
  const navigate = useNavigate();

  const [step, setStep]                         = useState(0); // 0–3
  const [selectedChars, setSelectedChars]       = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [childAge, setChildAge]                 = useState(5);
  const [duration, setDuration]                 = useState('medium');
  const [storyLang, setStoryLang]               = useState(lang);
  const [customPrompt, setCustomPrompt]         = useState('');
  const [generating, setGenerating]             = useState(false);
  const [storyData, setStoryData]               = useState(null);
  const [genError, setGenError]                 = useState('');
  const [validError, setValidError]             = useState('');
  const [isDark, setIsDark] = useState(
    () => document.documentElement.getAttribute('data-theme') !== 'light'
  );

  React.useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.getAttribute('data-theme') !== 'light')
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const toggleChar = (char) => {
    setSelectedChars(prev => {
      const exists = prev.find(c => c.id === char.id);
      if (exists) return prev.filter(c => c.id !== char.id);
      if (prev.length >= MAX_CHARS) return prev;
      return [...prev, char];
    });
    setValidError('');
  };

  const goNext = () => {
    // Adım validasyonları
    if (step === 0) {
      const humanSelected = selectedChars.some(c => !c.id.startsWith('animal'));
      if (!humanSelected) { setValidError(lang === 'tr' ? 'En az bir çocuk karakter seç!' : 'Select at least one kid character!'); return; }
    }
    if (step === 2 && !selectedLocation) {
      setValidError(t.create.selectLocation); return;
    }
    setValidError('');
    setStep(s => s + 1);
  };

  const goBack = () => { setValidError(''); setStep(s => s - 1); };

  const applyQuickPrompt = (p) =>
    setCustomPrompt(prev => prev ? prev + ' ' + p : p);

  const handleGenerate = async () => {
    if (selectedChars.length === 0) { setValidError(t.create.selectChar); return; }
    if (!selectedLocation)          { setValidError(t.create.selectLocation); return; }
    setValidError('');
    setGenerating(true);
    setGenError('');
    setStoryData(null);
    try {
      const payload = {
        characters: selectedChars.map(c => ({
          id: c.id, name: c.name[storyLang] || c.name.tr,
          type: c.id.startsWith('animal') ? 'animal' : 'human',
          imagePath: `/assets/characters/${c.file}`, emoji: c.emoji,
        })),
        location: {
          id: selectedLocation.id, name: selectedLocation.name[storyLang] || selectedLocation.name.tr,
          imagePath: `/assets/locations/${selectedLocation.file}`, emoji: selectedLocation.emoji,
        },
        childAge, duration, storyLanguage: storyLang, customPrompt,
      };
      const res = await api.post('/ai/generate', payload);
      // Store story — BookOpeningTransition will call handleTransitionComplete when ready
      setStoryData({
        ...res.data,
        options: payload,
        _id: res.data._id,
        characters: payload.characters.map(c => ({
          ...c, name: { tr: c.name, en: c.name },
          file: c.imagePath?.split('/').pop() || '',
        })),
        location: {
          ...payload.location,
          name: { tr: payload.location.name, en: payload.location.name },
          file: payload.location.imagePath?.split('/').pop() || '',
        },
      });
    } catch (err) {
      setGenError(err.message);
      setGenerating(false); // only hide overlay on error
    }
  };

  const handleTransitionComplete = () => {
    navigate('/story-view', { state: { story: storyData } });
  };

  return (
    <div className="create-page">
      <div className="create-container">

        {/* ── PROGRESS BAR ── */}
        <div className="wizard-progress animate-fadeIn">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`wp-step ${i <= step ? 'wp-step--done' : ''} ${i === step ? 'wp-step--active' : ''}`}>
                <div className="wp-circle">
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="wp-label">
                  {i === 0 ? (lang === 'tr' ? 'Çocuklar' : 'Kids')
                  : i === 1 ? (lang === 'tr' ? 'Hayvanlar' : 'Animals')
                  : i === 2 ? (lang === 'tr' ? 'Mekan' : 'Location')
                  : (lang === 'tr' ? 'Ayarlar' : 'Settings')}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`wp-line ${i < step ? 'wp-line--done' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── SEÇİLEN ÖZET ── */}
        {selectedChars.length > 0 && (
          <div className="selection-summary animate-fadeIn">
            {selectedChars.map(c => (
              <button key={c.id}
                className={`sum-chip ${c.id.startsWith('animal') ? 'sum-chip--animal' : ''}`}
                onClick={() => toggleChar(c)}>
                <img src={`/assets/characters/${c.file}`} alt=""
                  onError={e => { e.target.style.display='none'; }} />
                <span>{c.name[lang] || c.name.tr}</span>
                <span className="sum-remove">✕</span>
              </button>
            ))}
            {selectedLocation && (
              <div className="sum-chip sum-chip--loc">
                <img src={`/assets/locations/${selectedLocation.file}`} alt=""
                  onError={e => { e.target.style.display='none'; }} />
                <span>{selectedLocation.name[lang] || selectedLocation.name.tr}</span>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════
            ADIM 0 — ÇOCUK KARAKTERLERİ
        ══════════════════════════════════ */}
        {step === 0 && (
          <div className="wizard-step animate-fadeIn">
            <div className="step-header">
              <h1 className="step-title">
                {lang === 'tr' ? 'Çocuk Karakterlerini Seç' : 'Pick Your Kid Characters'}
              </h1>
              <p className="step-sub">
                {lang === 'tr' ? `En fazla ${MAX_CHARS} karakter seçebilirsin` : `Pick up to ${MAX_CHARS} characters`}
              </p>
            </div>
            <div className="char-grid char-grid--humans">
              {GIRL_CHARACTERS.map((c, i) => (
                <div key={c.id} className="char-cell" style={{ animationDelay: `${i * 0.03}s` }}>
                  <CharacterCard character={c}
                    selected={!!selectedChars.find(s => s.id === c.id)}
                    onToggle={toggleChar} lang={lang}
                    disabled={selectedChars.length >= MAX_CHARS && !selectedChars.find(s => s.id === c.id)}
                  />
                </div>
              ))}
            </div>
            <div className="char-grid char-grid--humans">
              {BOY_CHARACTERS.map((c, i) => (
                <div key={c.id} className="char-cell" style={{ animationDelay: `${i * 0.03}s` }}>
                  <CharacterCard character={c}
                    selected={!!selectedChars.find(s => s.id === c.id)}
                    onToggle={toggleChar} lang={lang}
                    disabled={selectedChars.length >= MAX_CHARS && !selectedChars.find(s => s.id === c.id)}
                  />
                </div>
              ))}
            </div>
            {validError && <div className="valid-error"><span>⚠️</span> {validError}</div>}
            <div className="wizard-nav">
              <button className="wizard-btn wizard-btn--back" style={{visibility:'hidden'}} disabled>← {lang === 'tr' ? 'Geri' : 'Back'}</button>
              <button className="wizard-btn wizard-btn--next" onClick={goNext}>
                {lang === 'tr' ? 'İlerle' : 'Next'} →
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════
            ADIM 1 — HAYVAN KARAKTERLERİ
        ══════════════════════════════════ */}
        {step === 1 && (
          <div className="wizard-step animate-fadeIn">
            <div className="step-header">
              <h1 className="step-title">
                {lang === 'tr' ? 'Hayvan Arkadaş Seç' : 'Pick Animal Friends'}
              </h1>
              <p className="step-sub">
                {lang === 'tr' ? 'İstersen atla, hayvan seçmek zorunda değilsin' : 'Optional — you can skip this step'}
              </p>
            </div>
            <div className="char-grid char-grid--animals">
              {ANIMAL_CHARACTERS.map((c, i) => (
                <div key={c.id} className="char-cell" style={{ animationDelay: `${i * 0.05}s` }}>
                  <CharacterCard character={c}
                    selected={!!selectedChars.find(s => s.id === c.id)}
                    onToggle={toggleChar} lang={lang}
                    disabled={selectedChars.length >= MAX_CHARS && !selectedChars.find(s => s.id === c.id)}
                    variant="animal"
                  />
                </div>
              ))}
            </div>
            {validError && <div className="valid-error"><span>⚠️</span> {validError}</div>}
            <div className="wizard-nav">
              <button className="wizard-btn wizard-btn--back" onClick={goBack}>← {lang === 'tr' ? 'Geri' : 'Back'}</button>
              <button className="wizard-btn wizard-btn--next" onClick={goNext}>
                {lang === 'tr' ? 'İlerle' : 'Next'} →
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════
            ADIM 2 — MEKAN
        ══════════════════════════════════ */}
        {step === 2 && (
          <div className="wizard-step animate-fadeIn">
            <div className="step-header">
              <h1 className="step-title">
                {lang === 'tr' ? 'Macera Mekanını Seç' : 'Choose the Adventure Location'}
              </h1>
              <p className="step-sub">
                {lang === 'tr' ? 'Hikaye nerede geçsin?' : 'Where does the story take place?'}
              </p>
            </div>
            <div className="loc-grid">
              {LOCATIONS.map((loc, i) => (
                <button key={loc.id} type="button"
                  className={`loc-card ${selectedLocation?.id === loc.id ? 'selected' : ''}`}
                  style={{ animationDelay: `${i * 0.06}s` }}
                  onClick={() => { setSelectedLocation(loc); setValidError(''); }}
                >
                  <div className="loc-visual">
                    <img src={`/assets/locations/${loc.file}`} alt={loc.name[lang]}
                      onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                    <div className="loc-emoji-fallback" style={{ display:'none' }}>{loc.emoji}</div>
                    {selectedLocation?.id === loc.id && <div className="loc-check">✓</div>}
                  </div>
                  <span className="loc-name">{loc.name[lang] || loc.name.tr}</span>
                </button>
              ))}
            </div>
            {validError && <div className="valid-error"><span>⚠️</span> {validError}</div>}
            <div className="wizard-nav">
              <button className="wizard-btn wizard-btn--back" onClick={goBack}>← {lang === 'tr' ? 'Geri' : 'Back'}</button>
              <button className="wizard-btn wizard-btn--next" onClick={goNext}>
                {lang === 'tr' ? 'İlerle' : 'Next'} →
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════
            ADIM 3 — AYARLAR (üst kısım)
        ══════════════════════════════════ */}
        {step === 3 && !generating && (
          <div className="wizard-step animate-fadeIn">
            <div className="step-header">
              <h1 className="step-title">
                {lang === 'tr' ? 'Son Dokunuşlar' : 'Final Touches'}
              </h1>
              <p className="step-sub">
                {lang === 'tr' ? 'Hikayeni özelleştir ve oluştur!' : 'Customize and generate your story!'}
              </p>
            </div>

            <div className="settings-grid">
              {/* Yaş */}
              <div className="opt-card">
                <div className="opt-card-header">
                  <span className="opt-icon">🎂</span>
                  <h4 className="opt-title">{t.create.childAge}</h4>
                </div>
                <div className="age-pills">
                  {AGE_OPTIONS.map(age => (
                    <button key={age} type="button"
                      className={`age-pill ${childAge === age ? 'active' : ''}`}
                      onClick={() => setChildAge(age)}>{age}</button>
                  ))}
                </div>
              </div>

              {/* Süre */}
              <div className="opt-card">
                <div className="opt-card-header">
                  <span className="opt-icon">⏳</span>
                  <h4 className="opt-title">{t.create.duration}</h4>
                </div>
                <div className="dur-pills">
                  {[
                    { value: 'short',  label: lang === 'tr' ? 'Kısa (~5 dk)'   : 'Short (~5 min)'  },
                    { value: 'medium', label: lang === 'tr' ? 'Orta (~10 dk)'  : 'Medium (~10 min)' },
                    { value: 'long',   label: lang === 'tr' ? 'Uzun (~15 dk)'  : 'Long (~15 min)'  },
                  ].map(d => (
                    <button key={d.value} type="button"
                      className={`dur-pill ${duration === d.value ? 'active' : ''}`}
                      onClick={() => setDuration(d.value)}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dil */}
              <div className="opt-card">
                <div className="opt-card-header">
                  <span className="opt-icon">💬</span>
                  <h4 className="opt-title">{t.create.storyLanguage}</h4>
                </div>
                <div className="lang-toggle">
                  {STORY_LANGUAGES.map(l => (
                    <button key={l.value} type="button"
                      className={`lang-btn ${storyLang === l.value ? 'active' : ''}`}
                      onClick={() => setStoryLang(l.value)}>
                      {l.value === 'tr' ? 'Türkçe' : 'English'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>{/* /create-container */}

      {/* ══════════════════════════════════
          ADIM 3 — Alt sahne (tam genişlik)
      ══════════════════════════════════ */}
      {step === 3 && !generating && (
        <div className="step3-scene"
          style={{ backgroundImage: `url('/assets/create/settings-bg.png'), url('/assets/create/${isDark ? 'darkf' : 'dayf'}.png')` }}
        >
          <div className="create-container">
            <div className="step3-layout">

              {/* Sol: prompt + geri */}
              <div className="step3-left">
                <div className="step3-prompt-card">
                  <span className="step3-prompt-label">
                    {lang === 'tr' ? 'hikayeye yön ver' : 'guide the story'}
                  </span>
                  <textarea className="prompt-input step3-textarea"
                    placeholder={t.create.customPlaceholder}
                    value={customPrompt}
                    onChange={e => setCustomPrompt(e.target.value)}
                    rows={2} maxLength={500} />
                  <div className="quick-row">
                    <span className="quick-label">{t.create.quickPrompts}</span>
                    <div className="quick-chips">
                      {t.create.prompts.map((p, i) => (
                        <button key={i} type="button" className="quick-chip"
                          onClick={() => applyQuickPrompt(p)}>{p}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {validError && <div className="valid-error"><span>⚠️</span> {validError}</div>}
                {genError   && <div className="valid-error"><span>❌</span> {genError}</div>}

                <button className="wizard-btn wizard-btn--back step3-back" onClick={goBack}>
                  ← {lang === 'tr' ? 'Geri' : 'Back'}
                </button>
              </div>

              {/* Sağ: şato alanı + oluştur butonu alt köşede */}
              <div className="step3-right">
                <button className="generate-btn" onClick={handleGenerate}>
                  {t.create.generateBtn}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Cinematic book-opening transition overlay */}
      <BookOpeningTransition
        visible={generating}
        storyReady={!!storyData}
        onComplete={handleTransitionComplete}
        lang={lang}
      />
    </div>
  );
}
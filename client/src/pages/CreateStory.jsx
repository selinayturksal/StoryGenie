import React, { useState } from 'react';
import { useLang } from '../context/LangContext';
import CharacterCard from '../components/CharacterCard';
import BookViewer from '../components/BookViewer';
import {
  GIRL_CHARACTERS, BOY_CHARACTERS, ANIMAL_CHARACTERS, LOCATIONS,
  AGE_OPTIONS, DURATION_OPTIONS, STORY_LANGUAGES,
} from '../data/storyOptions';
import api from '../services/api';
import './CreateStory.css';

const MAX_CHARS = 6;

export default function CreateStory() {
  const { t, lang } = useLang();

  const [selectedChars, setSelectedChars] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [childAge, setChildAge] = useState(5);
  const [duration, setDuration] = useState('medium');
  const [storyLang, setStoryLang] = useState(lang);
  const [customPrompt, setCustomPrompt] = useState('');
  const [story, setStory] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [validError, setValidError] = useState('');

  const toggleChar = (char) => {
    setSelectedChars(prev => {
      const exists = prev.find(c => c.id === char.id);
      if (exists) return prev.filter(c => c.id !== char.id);
      if (prev.length >= MAX_CHARS) return prev;
      return [...prev, char];
    });
    setValidError('');
  };

  const applyQuickPrompt = (prompt) => {
    setCustomPrompt(prev => prev ? prev + ' ' + prompt : prompt);
  };

  const handleGenerate = async () => {
    if (selectedChars.length === 0) { setValidError(t.create.selectChar); return; }
    if (!selectedLocation) { setValidError(t.create.selectLocation); return; }
    setValidError('');
    setGenerating(true);
    setStory(null);
    setGenError('');
    setSaved(false);
    try {
      const payload = {
        characters: selectedChars.map(c => ({
          id: c.id,
          name: c.name[storyLang] || c.name.tr,
          type: c.id.startsWith('animal') ? 'animal' : 'human',
          imagePath: `/assets/characters/${c.file}`,
          emoji: c.emoji,
        })),
        location: {
          id: selectedLocation.id,
          name: selectedLocation.name[storyLang] || selectedLocation.name.tr,
          imagePath: `/assets/locations/${selectedLocation.file}`,
          emoji: selectedLocation.emoji,
        },
        childAge,
        duration,
        storyLanguage: storyLang,
        customPrompt,
      };
      const res = await api.post('/ai/generate', payload);
      setStory({ ...res.data, options: payload });
    } catch (err) {
      setGenError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!story || saving || saved) return;
    setSaving(true);
    try {
      await api.post('/stories', {
        title: story.title,
        fullText: story.fullText,
        pages: story.pages,
        options: {
          characters: story.options.characters,
          location: story.options.location,
          childAge, duration,
          storyLanguage: storyLang,
          customPrompt,
        },
      });
      setSaved(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-page">
      <div className="container">
        <div className="create-header animate-fadeIn">
          <h1 className="create-title">{t.create.pageTitle}</h1>
          <p className="create-subtitle">{t.create.subtitle}</p>
        </div>

        {!story && !generating && (
          <div className="create-panel animate-fadeIn">

           {/* Kız karakterler */}
            <section className="select-section">
              <div className="section-label">
                <span className="section-icon">👧</span>
                <h3>Kız Karakterler</h3>
              </div>
              <div className="char-grid">
                {GIRL_CHARACTERS.map(c => (
                  <CharacterCard key={c.id} character={c}
                    selected={!!selectedChars.find(s => s.id === c.id)}
                    onToggle={toggleChar} lang={lang}
                    disabled={selectedChars.length >= MAX_CHARS && !selectedChars.find(s => s.id === c.id)}
                  />
                ))}
              </div>
            </section>

            {/* Erkek karakterler */}
            <section className="select-section">
              <div className="section-label">
                <span className="section-icon">👦</span>
                <h3>Erkek Karakterler</h3>
              </div>
              <div className="char-grid">
                {BOY_CHARACTERS.map(c => (
                  <CharacterCard key={c.id} character={c}
                    selected={!!selectedChars.find(s => s.id === c.id)}
                    onToggle={toggleChar} lang={lang}
                    disabled={selectedChars.length >= MAX_CHARS && !selectedChars.find(s => s.id === c.id)}
                  />
                ))}
              </div>
            </section>

            {/* Animal characters */}
            <section className="select-section">
              <div className="section-label">
                <span className="section-icon">🐾</span>
                <h3>{t.create.animalChars}</h3>
              </div>
              <div className="char-grid">
                {ANIMAL_CHARACTERS.map(c => (
                  <CharacterCard key={c.id} character={c}
                    selected={!!selectedChars.find(s => s.id === c.id)}
                    onToggle={toggleChar} lang={lang}
                    disabled={selectedChars.length >= MAX_CHARS && !selectedChars.find(s => s.id === c.id)}
                  />
                ))}
              </div>
            </section>

            {/* Selected strip */}
            {selectedChars.length > 0 && (
              <div className="selected-strip">
                <span className="strip-label">{t.create.selectedChars}:</span>
                {selectedChars.map(c => (
                  <button key={c.id} className="selected-badge" onClick={() => toggleChar(c)}>
                    {c.emoji} {c.name[lang] || c.name.tr} ✕
                  </button>
                ))}
              </div>
            )}

            {/* Locations */}
            <section className="select-section">
              <div className="section-label">
                <span className="section-icon">🗺️</span>
                <h3>{t.create.locations}</h3>
              </div>
              <div className="char-grid">
                {LOCATIONS.map(loc => (
                  <button key={loc.id} type="button"
                    className={`char-card ${selectedLocation?.id === loc.id ? 'selected' : ''}`}
                    onClick={() => { setSelectedLocation(loc); setValidError(''); }}
                  >
                    <div className="char-visual">
                      <img src={`/assets/locations/${loc.file}`} alt={loc.name[lang]}
                        onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                      <div className="char-emoji-fallback" style={{ display:'none' }}>{loc.emoji}</div>
                      {selectedLocation?.id === loc.id && <div className="char-check">✓</div>}
                    </div>
                    <span className="char-name">{loc.name[lang] || loc.name.tr}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Options */}
            <div className="options-row">
              <div className="option-group">
                <label className="form-label">👶 {t.create.childAge}</label>
                <div className="age-selector">
                  {AGE_OPTIONS.map(age => (
                    <button key={age} type="button"
                      className={`age-btn ${childAge === age ? 'active' : ''}`}
                      onClick={() => setChildAge(age)}>
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <label className="form-label">⏱ {t.create.duration}</label>
                <div className="duration-selector">
                  {DURATION_OPTIONS.map(d => (
                    <button key={d.value} type="button"
                      className={`duration-btn ${duration === d.value ? 'active' : ''}`}
                      onClick={() => setDuration(d.value)}>
                      {d.icon} {t.create[d.labelKey]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <label className="form-label">🌐 {t.create.storyLanguage}</label>
                <div className="lang-selector">
                  {STORY_LANGUAGES.map(l => (
                    <button key={l.value} type="button"
                      className={`lang-opt-btn ${storyLang === l.value ? 'active' : ''}`}
                      onClick={() => setStoryLang(l.value)}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom prompt */}
            <div className="prompt-section">
              <label className="form-label">✏️ {t.create.customPrompt}</label>
              <textarea className="input-field prompt-textarea"
                placeholder={t.create.customPlaceholder}
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                rows={3} maxLength={500} />
              <div className="quick-prompts">
                <span className="quick-label">{t.create.quickPrompts}</span>
                <div className="quick-chips">
                  {t.create.prompts.map((p, i) => (
                    <button key={i} type="button" className="quick-chip" onClick={() => applyQuickPrompt(p)}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {validError && <div className="valid-error">⚠️ {validError}</div>}

            <button className="btn btn-primary generate-btn" onClick={handleGenerate}>
              {t.create.generateBtn}
            </button>
          </div>
        )}

        {/* Generating */}
        {generating && (
          <div className="generating-state animate-fadeIn">
            <div className="gen-book">📖</div>
            <div className="gen-sparkles">✨ ✦ ✨</div>
            <h3>{t.create.generating}</h3>
            <p>{t.create.generatingMsg}</p>
            <div className="gen-dots"><span /><span /><span /></div>
          </div>
        )}

        {/* Error */}
        {genError && !generating && (
          <div className="gen-error animate-fadeIn">
            <p>❌ {genError}</p>
            <button className="btn btn-outline" onClick={() => setGenError('')}>{t.back}</button>
          </div>
        )}

        {/* Book viewer */}
        {story && !generating && !genError && (
          <BookViewer
            pages={story.pages}
            title={story.title}
            characters={story.options.characters.map(c => ({
              ...c, name: { tr: c.name, en: c.name },
              file: c.imagePath?.split('/').pop() || '',
            }))}
            location={story.options.location ? {
              ...story.options.location,
              name: { tr: story.options.location.name, en: story.options.location.name },
              file: story.options.location.imagePath?.split('/').pop() || '',
            } : null}
            lang={storyLang} t={t}
            onSave={handleSave} saving={saving} saved={saved}
          />
        )}

        {story && !generating && (
          <div style={{ textAlign:'center', marginTop:16, paddingBottom:40 }}>
            <button className="btn btn-outline"
              onClick={() => { setStory(null); setGenError(''); setSaved(false); }}>
              ✨ {t.create.generateBtn}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

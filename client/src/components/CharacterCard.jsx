import React from 'react';
import './CharacterCard.css';

export default function CharacterCard({ character, selected, onToggle, lang, disabled, variant }) {
  const name = character.name[lang] || character.name.tr;
  const isAnimal = variant === 'animal';

  return (
    <button
      className={`char-card ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''} ${variant ? `char-card--${variant}` : ''}`}
      onClick={() => !disabled && onToggle(character)}
      type="button"
      title={name}
    >
      {/* Seçili highlight kutusu — sadece çocuklar için */}
      {selected && <div className="char-selected-bg" />}

      <div className="char-visual">
        <div className="char-glow" />
        <img
          src={`/assets/characters/${character.file}`}
          alt={name}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="char-emoji-fallback" style={{ display: 'none' }}>
          {character.emoji}
        </div>
        {selected && (
          <div className="char-check">
            <span>✓</span>
          </div>
        )}
      </div>
      <span className="char-name">{name}</span>

      {/* Hayvanlar için eski halka — dokunulmadı */}

    </button>
  );
}
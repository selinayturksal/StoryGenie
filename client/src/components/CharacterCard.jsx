import React from 'react';
import './CharacterCard.css';

export default function CharacterCard({ character, selected, onToggle, lang, disabled }) {
  const name = character.name[lang] || character.name.tr;

  return (
    <button
      className={`char-card ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={() => !disabled && onToggle(character)}
      type="button"
      title={name}
    >
      {/* Görsel veya emoji fallback */}
      <div className="char-visual">
        <img
          src={`/assets/characters/${character.file}`}
          alt={name}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
        <div className="char-emoji-fallback" style={{ display: 'none' }}>
          {character.emoji}
        </div>
        {selected && <div className="char-check">✓</div>}
      </div>
      <span className="char-name">{name}</span>
    </button>
  );
}

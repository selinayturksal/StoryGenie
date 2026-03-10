import React, { useState } from 'react';
import './BookViewer.css';

export default function BookViewer({ pages, title, characters, location, lang, t, onSave, saving, saved }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState('next');

  const totalPages = pages.length;
  const isFirst = currentPage === 0;
  const isLast = currentPage === totalPages - 1;

  const goTo = (dir) => {
    if (flipping) return;
    if (dir === 'next' && isLast) return;
    if (dir === 'prev' && isFirst) return;

    setFlipDir(dir);
    setFlipping(true);
    setTimeout(() => {
      setCurrentPage(p => dir === 'next' ? p + 1 : p - 1);
      setFlipping(false);
    }, 320);
  };

  const allChars = characters || [];

  return (
    <div className="book-wrapper">
      {/* Title */}
      <h2 className="book-title">{title}</h2>

      {/* Book */}
      <div className="book-container">
        {/* Left page — decorative / character panel */}
        <div className="book-page book-page-left">
          <div className="book-page-inner">
            <div className="book-decoration">
              <div className="book-ornament">✦</div>
              <div className="char-showcase">
                {allChars.slice(0, 3).map(c => (
                  <div key={c.id} className="showcase-char" title={c.name}>
                    <img
                      src={`/assets/characters/${c.file}`}
                      alt={c.name}
                      onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                    />
                    <span className="showcase-emoji" style={{ display:'none' }}>{c.emoji}</span>
                    <span className="showcase-name">{c.name[lang] || c.name.tr}</span>
                  </div>
                ))}
              </div>
              {location && (
                <div className="showcase-location">
                  <span className="loc-emoji">{location.emoji}</span>
                  <span className="loc-name">{location.name[lang] || location.name.tr}</span>
                </div>
              )}
              <div className="book-ornament">✦</div>
            </div>
          </div>
          <div className="page-spine" />
        </div>

        {/* Right page — story text */}
        <div className={`book-page book-page-right ${flipping ? `flip-${flipDir}` : ''}`}>
          <div className="book-page-inner">
            <div className="page-header">
              <span className="page-num">
                {t.story.page} {currentPage + 1} {t.story.of} {totalPages}
              </span>
            </div>
            <div className="page-content">
              <p>{pages[currentPage]?.content}</p>
            </div>
            {/* Bottom character strip */}
            <div className="page-chars-strip">
              {allChars.map(c => (
                <div key={c.id} className="strip-char" title={c.name[lang] || c.name.tr}>
                  <img
                    src={`/assets/characters/${c.file}`}
                    alt={c.name[lang] || c.name.tr}
                    onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}
                  />
                  <span style={{ display:'none', fontSize:'1.4rem' }}>{c.emoji}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="book-nav">
        <button
          className={`nav-btn ${isFirst ? 'hidden' : ''}`}
          onClick={() => goTo('prev')}
          disabled={isFirst || flipping}
        >
          ‹ {t.story.prev !== '‹' ? t.story.prev : ''}
        </button>

        {/* Page dots */}
        <div className="page-dots">
          {pages.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === currentPage ? 'active' : ''}`}
              onClick={() => { if (!flipping) { setFlipDir(i > currentPage ? 'next' : 'prev'); setCurrentPage(i); } }}
            />
          ))}
        </div>

        <button
          className={`nav-btn ${isLast ? 'hidden' : ''}`}
          onClick={() => goTo('next')}
          disabled={isLast || flipping}
        >
          {t.story.next !== '›' ? t.story.next : ''} ›
        </button>
      </div>

      {/* Actions */}
      {isLast && (
        <div className="book-actions animate-fadeIn">
          <button className="btn btn-outline" onClick={() => setCurrentPage(0)}>
            🔄 {t.story.readAgain}
          </button>
          <button
            className={`btn ${saved ? 'btn-gold' : 'btn-primary'}`}
            onClick={onSave}
            disabled={saving || saved}
          >
            {saving ? '⏳ ' + t.story.saving :
             saved  ? '✓ '  + t.story.saved  :
                      '💾 ' + t.story.saveStory}
          </button>
        </div>
      )}
    </div>
  );
}

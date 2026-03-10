import React, { createContext, useContext, useState } from 'react';
import translations from '../i18n/translations';

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem('sn_lang') || 'tr'
  );

  const t = translations[lang];

  const switchLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('sn_lang', newLang);
  };

  return (
    <LangContext.Provider value={{ lang, t, switchLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}

// components/LanguageContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextProps {
  language: 'en' | 'vi';
  toggleLanguage: (lang: 'en' | 'vi') => void;
}

const LanguageContext = createContext<LanguageContextProps>({
  language: 'vi',
  toggleLanguage: () => { },
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'vi'>('vi');

  const toggleLanguage = (lang: 'en' | 'vi') => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

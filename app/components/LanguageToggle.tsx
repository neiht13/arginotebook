// components/LanguageToggle.tsx
'use client';

import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import translations from './translations';

const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language].calculator;

  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const handleToggle = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    const newLang = language === 'en' ? 'vi' : 'en';

    // Đợi cho đến khi hiệu ứng hoàn tất trước khi thay đổi ngôn ngữ
    setTimeout(() => {
      toggleLanguage(newLang);
      setIsAnimating(false);
    }, 300); // Thời gian này nên trùng với thời gian hiệu ứng CSS
  };

  return (
    <div className="fixed z-40 top-3 right-3 w-8 h-8 group"> {/* Thêm class group */}
      <button
        onClick={handleToggle}
        aria-label={t.tooltipLanguage}
        className="relative w-full h-full focus:outline-none"
      >
        <img
          src={`/flags/${language === 'en' ? 'us' : 'vn'}.png`}
          alt={t.tooltipLanguage}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'
            }`}
        />
        
      </button>
      <span className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        {t.tooltipLanguage}
      </span>
    </div>
  );
};

export default LanguageToggle;

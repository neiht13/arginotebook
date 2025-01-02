// components/Calculator.tsx
'use client';

import React from 'react';
import Tabs from './components/Tabs';
import EGFRCalculator from './EGFRCalculator';
import LDLCalculator from './LDLCalculator';
import { useLanguage } from './components/LanguageContext';
import translations from './components/translations';
import Tab from './components/Tab';
import LanguageToggle from './components/LanguageToggle';

const Calculator: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language].calculator;

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-300 to-lime-400 p-5">
      <LanguageToggle/>
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl w-full">
        <Tabs key={language}>
          <Tab label={t.egfr}>
            <EGFRCalculator />
          </Tab>
          <Tab label={t.ldl}>
            <LDLCalculator />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default Calculator;

// components/Result.tsx
'use client';

import React from 'react';
import classNames from 'classnames';
import { useLanguage } from './LanguageContext';
import translations from './translations';

interface ResultProps {
  type: 'egfr' | 'ldl';
  value: number;
  unit?: string;
}

const Result: React.FC<ResultProps> = ({ type, value, unit }) => {
  const { language } = useLanguage();
  const t = translations[language].calculator;

  let statusKey = '';
  let bgColor = '';
  let textColor = '';

  if (type === 'egfr') {
    if (value >= 90) {
      statusKey = 'normal';
      bgColor = 'bg-lime-100';
      textColor = 'text-lime-800';
    } else if (value >= 60) {
      statusKey = 'mild';
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-700';
    } else {
      statusKey = 'severe';
      bgColor = 'bg-red-100';
      textColor = 'text-red-700';
    }
  } else if (type === 'ldl') {
    if (value < 100) {
      statusKey = 'normal';
      bgColor = 'bg-lime-100';
      textColor = 'text-lime-800';
    } else if (value < 160) {
      statusKey = 'risk';
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-700';
    } else {
      statusKey = 'high';
      bgColor = 'bg-red-100';
      textColor = 'text-red-700';
    }
  }

  //@ts-ignore
  const status = t.result[type][statusKey];

  return (
    <div
      className={classNames(
        'mt-5 text-lg font-bold text-center p-2 rounded-2xl',
        bgColor,
        textColor
      )}
    >
      {type === 'egfr'
        ? `${t.egfrLevel}: ${value?.toFixed(
            2
          )} mL/min/1.73m² (${status})`
        : `${t.ldlLevel}: ${value?.toFixed(
            2
          )} ${unit} (${status})`}
    </div>
  );
};

export default Result;

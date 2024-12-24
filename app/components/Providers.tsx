// components/Providers.tsx
'use client';

import React from 'react';
import { LanguageProvider } from './LanguageContext';

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
};

export default Providers;

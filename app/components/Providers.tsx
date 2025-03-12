// components/Providers.tsx
'use client';

import React from 'react';
import { LanguageProvider } from './LanguageContext';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Spinner from '@/components/ui/spinner';

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   if (status === "loading") {
//     return (
//       <div className="flex justify-center items-center h-screen">
//       <Spinner />
//       </div>
//     )
//   } else if (status === "authenticated") {
//   return (
//     <LanguageProvider>
//       {children}
//     </LanguageProvider>
//   );
// } else {
  // router.push('/auth');
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
};


export default Providers;

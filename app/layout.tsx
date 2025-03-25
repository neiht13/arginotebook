// app/layout.tsx
import React, { Suspense } from 'react';
import Providers from './components/Providers';
import "./styles/globals.css"
import Head from 'next/head';
import Header from './components/Header';
import { Toaster } from '@/components/ui/toaster';
import SessionProvider from '@/lib/provider';
import { nunito } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import Spinner from '@/components/ui/spinner';
import Script from 'next/script';

export const metadata = {
  title: 'NKSX',
  description: 'Nhật ký sản xuất',
  manifest: '/manifest.json',
};

// Define the type for props
interface LayoutProps {
  children: React.ReactNode;
}

const LisLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <html>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <title>NKCT</title>
      </Head>
      <body className={nunito.className}>
        <Suspense fallback={<div className='flex justify-center items-center h-screen'><Spinner/></div>}>
          <Toaster />
          <div>
            <SessionProvider>
              <Providers>
                {children}
              </Providers>
            </SessionProvider>
          </div>
        </Suspense>
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('Service Worker registration successful with scope: ', registration.scope);
                  },
                  function(err) {
                    console.log('Service Worker registration failed: ', err);
                  }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
};

export default LisLayout;
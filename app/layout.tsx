// app/layout.tsx
import React, { Suspense } from 'react';
import Providers from './components/Providers';
import "./styles/globals.css"
import Head from 'next/head';
import Header from './components/Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import SessionProvider from '@/lib/provider';
import { nunito } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import Spinner from '@/components/ui/spinner';


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
      <body className={nunito.className} >
        <Suspense fallback={<div className='flex justify-center items-center h-screen'><Spinner/></div>}>
        <Header />

        <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
              <div className='lg:mt-16'>
              <SessionProvider>

          <Providers>
            {children}
          </Providers>
          </SessionProvider>
        </div>
        </Suspense>
      </body>
    </html>
  );
};

export default LisLayout;
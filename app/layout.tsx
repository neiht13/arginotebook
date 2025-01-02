// app/layout.tsx
import React from 'react';
import Providers from './components/Providers';
import "./styles/globals.css"
import Head from 'next/head';
import Header from './components/Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'


export const metadata = {
  title: 'GDR & LDL Calculator',
  description: 'GDR & LDL Calculator',
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
        <title>GDR & LDL Calculator</title>
      </Head>
      <body className="font-helveticaneue">
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
          <Providers>
            {children}
          </Providers>
        </div>

      </body>
    </html>
  );
};

export default LisLayout;
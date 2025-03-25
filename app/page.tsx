// app/page.tsx
'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/ui/spinner';
const Home: React.FC = () => {

  const router = useRouter();
  router.push('/timeline');

  return (
    <div className='flex justify-center items-center h-screen'>
      <Spinner />
    </div>
  );
};

export default Home;

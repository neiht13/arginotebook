'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/ui/spinner';

const Home: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/timeline');
  }, [router]);

  return (
    <div className='flex justify-center items-center h-screen'>
      <Spinner />
    </div>
  );
};

export default Home;
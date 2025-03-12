'use client';

import React from 'react';
import Spinner from '@/components/ui/spinner';

const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <Spinner />
    </div>
  );
};

export default Loading;

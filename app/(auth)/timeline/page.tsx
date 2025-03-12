'use client'
import { useEffect, useState } from 'react';
import EnhancedAgriculturalTimeline from './EnhancedAgriculturalTimeline';
import { TimelineEntry } from './types';
import axios from "axios";
import useSWR from 'swr'
import Spinner from '@/components/ui/spinner';
import { useSession } from 'next-auth/react';

export default function TimelinePage() {
  const [timelineData, setTimelineData] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {data: session, status} = useSession()


 useEffect(() => {
    fetchData()
  }, [status])  

  const fetchData =  async () => {
    if(status === 'loading') return <div className='w-full h-screen flex justify-center items-center'><Spinner/></div>

    const response = await axios.get('/api/nhatky', {
          params: { uId: session?.user?.uId }
      });
      setIsLoading(false)
      console.log('data',response.data);
      
      setTimelineData(response.data)
    
  }

  const handleAddEntry = (newEntry: TimelineEntry) => {
    setTimelineData(prevData => [...prevData, { ...newEntry, _id: Date.now().toString() }]);
    axios.post('/api/nhatky', newEntry)
    console.log('New entry added:', newEntry);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-slate-700 uppercase">Nhật ký Canh tác</h1>
      {
        isLoading ? <div className='w-full h-screen flex justify-center items-center'><Spinner/></div>
      :
      <EnhancedAgriculturalTimeline data={timelineData} isLoading={isLoading} onAddEntry={handleAddEntry} />
}
    </div>
  );
}


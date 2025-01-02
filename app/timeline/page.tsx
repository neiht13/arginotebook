'use client'
import { useEffect, useState } from 'react';
import EnhancedAgriculturalTimeline from './EnhancedAgriculturalTimeline';
import { TimelineEntry } from './types';
import axios from "axios";
import {queryObjects} from "v8";


export default function TimelinePage() {
  const [timelineData, setTimelineData] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true)

 useEffect(() => {
   fetchData();
  setIsLoading(false)
 },[])

  const fetchData =  async () => {
    const response = await axios.get('/api/nhatky', {
          params: { uId: '673c02b70df7665d45340b11' }
      });
    if (response.status === 200) {
      setTimelineData(response.data)
      setIsLoading(false)
    }
  }

  const handleAddEntry = (newEntry: TimelineEntry) => {
    setTimelineData(prevData => [...prevData, { ...newEntry, _id: Date.now().toString() }]);
    // Here you would typically send the new entry to your backend API
    console.log('New entry added:', newEntry);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-slate-700 uppercase">Nhật ký Canh tác</h1>
      <EnhancedAgriculturalTimeline data={timelineData} isLoading={isLoading} onAddEntry={handleAddEntry} />
    </div>
  );
}


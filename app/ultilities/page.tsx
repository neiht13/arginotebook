"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WeatherWidget from './WeatherWidget'
import HarvestTracker from './HarvestTracker'
import CropCalendar from './CropCalendar'
import PestIdentifier from './PestIdentifier'
import dynamic from 'next/dynamic'
const CultivationMap = dynamic(() => import('./CultivationMap'), { ssr: false })

export default function UtilitiesPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tiện ích nông nghiệp</h1>
      <Tabs defaultValue="weather" className="w-full">
        <TabsList className="h-auto grid w-full grid-cols-5">
          <TabsTrigger
                                className="flex flex-col items-center justify-center h-full whitespace-normal text-center" value="weather">Thời tiết</TabsTrigger>
          <TabsTrigger
                                className="flex flex-col items-center justify-center h-full whitespace-normal text-center" value="map">Bản đồ canh tác</TabsTrigger>
          <TabsTrigger
                                className="flex flex-col items-center justify-center h-full whitespace-normal text-center" value="harvest">Theo dõi thu hoạch</TabsTrigger>
          <TabsTrigger
                                className="flex flex-col items-center justify-center h-full whitespace-normal text-center" value="calendar">Lịch mùa vụ</TabsTrigger>
          <TabsTrigger
                                className="flex flex-col items-center justify-center h-full whitespace-normal text-center" value="pest">Nhận diện dịch hại</TabsTrigger>
        </TabsList>
        <TabsContent value="weather">
          <WeatherWidget />
        </TabsContent>
        <TabsContent value="map">
          <CultivationMap />
        </TabsContent>
        <TabsContent value="harvest">
          <HarvestTracker />
        </TabsContent>
        <TabsContent value="calendar">
          <CropCalendar />
        </TabsContent>
        <TabsContent value="pest">
          <PestIdentifier />
        </TabsContent>
      </Tabs>
    </div>
  )
}


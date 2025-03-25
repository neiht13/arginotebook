"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WeatherWidget from "./components/WeatherWidget"
import HarvestTracker from "./components/HarvestTracker"
import PestIdentifier from "./components/PestIdentifier"
import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Cloud, Map, BarChart3, Bug } from 'lucide-react'
import QuanlyThuhoach from "./components/QuanlyThuhoach"

const CultivationMap = dynamic(() => import("./components/CultivationMap"), { ssr: false })

export default function UtilitiesPage() {
  const [activeTab, setActiveTab] = useState("weather")

  const tabVariants = {
    inactive: { opacity: 0.7, y: 0 },
    active: { opacity: 1, y: -5, transition: { type: "spring", stiffness: 300 } }
  }

  const contentVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  }

  return (
    <div className="container mx-auto p-4 bg-lime-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.h1 
          className="text-3xl font-bold mb-6 text-emerald-800 border-b pb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Tiện ích nông nghiệp
        </motion.h1>
        
        <Card className="shadow-lg border-none overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <Tabs 
              defaultValue="weather" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-5 rounded-none bg-white border-b p-0 h-auto">
                {[
                  { id: "weather", label: "Thời tiết", icon: <Cloud className="w-5 h-5" /> },
                  { id: "map", label: "Bản đồ canh tác", icon: <Map className="w-5 h-5" /> },
                  { id: "harvest", label: "Theo dõi thu hoạch", icon: <BarChart3 className="w-5 h-5" /> },
                  { id: "quanlythuhoach", label: "Quản lý thu hoạch", icon: <BarChart3 className="w-5 h-5" /> },
                  { id: "pest", label: "Nhận diện ", icon: <Bug className="w-5 h-5" /> }
                ].map((tab) => (
                  <motion.div
                    key={tab.id}
                    variants={tabVariants}
                    animate={activeTab === tab.id ? "active" : "inactive"}
                    className="w-full"
                  >
                    <TabsTrigger 
                      value={tab.id}
                      className="w-full h-full py-4 flex flex-col items-center gap-2 data-[state=active]:bg-lime-50 data-[state=active]:text-lime-700 rounded-none border-b-2 border-transparent data-[state=active]:border-lime-500 transition-all"
                    >
                      {tab.icon}
                      <span className="text-sm font-medium text-balance">{tab.label}</span>
                    </TabsTrigger>
                  </motion.div>
                ))}
              </TabsList>
              
              <motion.div
                key={activeTab}
                initial="hidden"
                animate="visible"
                variants={contentVariants}
              >
                <TabsContent value="weather" className="m-0 p-0">
                  <WeatherWidget />
                </TabsContent>
                <TabsContent value="map" className="m-0 p-0">
                  <CultivationMap />
                </TabsContent>
                <TabsContent value="harvest" className="m-0 p-0">
                  <HarvestTracker />
                </TabsContent>
                <TabsContent value="quanlythuhoach" className="m-0 p-0">
                  <QuanlyThuhoach />
                </TabsContent>
                <TabsContent value="pest" className="m-0 p-0">
                  <PestIdentifier />
                </TabsContent>
              </motion.div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"
import { useEffect, useState } from "react"
import type { TimelineEntry } from "./types"
import axios from "axios"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Calendar, RefreshCw } from "lucide-react"
import ModernTimeline from "./ModernTimeline"
import LoadingScreen from "./LoadingScreen"
import TimelineCalendar from "./TimelineCalendar"
import { useToast } from "@/components/ui/use-toast"

export default function TimelinePage() {
  const [timelineData, setTimelineData] = useState<TimelineEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeView, setActiveView] = useState<"timeline" | "calendar">("timeline")
  const [refreshKey, setRefreshKey] = useState(0)
  const { data: session, status } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    if (status === "authenticated") {
      fetchData()
    }
  }, [status, refreshKey])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get("/api/nhatky", {
        params: { uId: session?.user?.uId },
      })

      // Sort data by date (newest first)
      const sortedData = response.data.sort((a, b) => {
        const dateA = parseVietnameseDate(a.ngayThucHien)
        const dateB = parseVietnameseDate(b.ngayThucHien)
        return dateB.getTime() - dateA.getTime()
      })

      setTimelineData(sortedData)
    } catch (error) {
      console.error("Error fetching timeline data:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải dữ liệu nhật ký",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const parseVietnameseDate = (dateString) => {
    const [day, month, year] = dateString.split("-").map(Number)
    return new Date(year, month - 1, day)
  }

  const handleAddEntry = async (newEntry: TimelineEntry) => {
    try {
      await axios.post("/api/nhatky", newEntry)
      // Refresh data after adding new entry
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      console.error("Error adding new entry:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thêm nhật ký mới",
      })
    }
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  if (status === "loading" || isLoading) {
    return <LoadingScreen />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-6 max-w-6xl"
    >
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div>
            <CardTitle className="text-2xl font-bold">Nhật ký canh tác</CardTitle>
            <CardDescription>Theo dõi và quản lý các hoạt động canh tác của bạn</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={handleRefresh} className="h-8 w-8 rounded-full">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-lime-600 hover:bg-lime-700 text-white"
              onClick={() => document.getElementById("add-entry-button")?.click()}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger
                value="timeline"
                onClick={() => setActiveView("timeline")}
                className="data-[state=active]:bg-lime-100 data-[state=active]:text-lime-800"
              >
                <div className="flex items-center">Timeline</div>
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                onClick={() => setActiveView("calendar")}
                className="data-[state=active]:bg-lime-100 data-[state=active]:text-lime-800"
              >
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Lịch
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="mt-0">
              <ModernTimeline data={timelineData} onAddEntry={handleAddEntry} />
            </TabsContent>

            <TabsContent value="calendar" className="mt-0">
              <TimelineCalendar data={timelineData} onAddEntry={handleAddEntry} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}


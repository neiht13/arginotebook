"use client"
import { useEffect, useState, useCallback } from "react"
import type { TimelineEntry } from "./types"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Calendar, RefreshCw, WifiOff, Wifi, AlertTriangle } from "lucide-react"
import ModernTimeline from "./components/ModernTimeline"
import LoadingScreen from "./components/LoadingScreen"
import TimelineCalendar from "./components/TimelineCalendar"
import { useToast } from "@/components/ui/use-toast"
import { useNetworkStore } from "@/lib/network-status"
import { initNetworkListeners } from "@/lib/network-status"
import { initSyncService } from "@/lib/sync-service"
import { useTimelineStore } from "@/lib/stores/timeline-store"
import { useReferenceDataStore } from "@/lib/stores/reference-data-store"

export default function TimelinePage() {
  const [activeView, setActiveView] = useState<"timeline" | "calendar">("timeline")
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const isOnline = useNetworkStore((state) => state.isOnline)

  const {
    entries,
    isLoading,
    hasPendingChanges,
    fetchEntries,
    addEntry,
    removeEntry,
    checkPendingChanges,
    syncWithServer,
  } = useTimelineStore()

  const { fetchAllReferenceData } = useReferenceDataStore()

  useEffect(() => {
    console.log("Initializing network and sync services")
    const cleanupNetworkListeners = initNetworkListeners()
    const cleanupSyncService = initSyncService()

    return () => {
      cleanupNetworkListeners?.()
      cleanupSyncService?.()
    }
  }, [])

  useEffect(() => {
    if (status === "authenticated" && session?.user?.uId) {
      console.log("User authenticated, fetching data")
      fetchEntries(session.user.uId)
      fetchAllReferenceData()
      registerServiceWorker()
    }
  }, [status, session?.user?.uId, fetchEntries, fetchAllReferenceData])

  useEffect(() => {
    if (session?.user?.uId) {
      checkPendingChanges(session.user.uId)
    }
  }, [isOnline, session?.user?.uId, checkPendingChanges])

  useEffect(() => {
    if (isOnline) {
      toast({
        title: "Đã kết nối mạng",
        description: "Dữ liệu sẽ được đồng bộ tự động",
        variant: "default",
      })
      syncWithServer().then(() => {
        if (session?.user?.uId) {
          fetchEntries(session.user.uId)
          checkPendingChanges(session.user.uId)
        }
      })
    } else {
      toast({
        title: "Mất kết nối mạng",
        description: "Ứng dụng đang hoạt động ở chế độ ngoại tuyến",
        variant: "destructive",
      })
    }
  }, [isOnline, toast, syncWithServer, fetchEntries, checkPendingChanges, session?.user?.uId])

  const registerServiceWorker = useCallback(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js")
          console.log("Service worker registered:", registration)
          if (registration.active) {
            registration.active.postMessage({
              type: "CACHE_REFERENCE_DATA",
            })
          }
        } catch (error) {
          console.error("Service worker registration failed:", error)
        }
      })
    }
  }, [])

  const handleAddEntry = async (newEntry: TimelineEntry) => {
    try {
      console.log("Adding new timeline entry")
      if (session?.user?.uId) {
        newEntry.uId = session.user.uId
      }
      await addEntry(newEntry)
      toast({
        title: "Thành công",
        description: isOnline ? "Đã thêm nhật ký mới" : "Đã lưu nhật ký mới (chế độ ngoại tuyến)",
      })
    } catch (error) {
      console.error("Error adding new entry:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thêm nhật ký mới",
      })
    }
  }

  const handleDeleteEntry = async (id: string) => {
    try {
      console.log(`Deleting timeline entry: ${id}`)
      await removeEntry(id)
      toast({
        title: "Thành công",
        description: isOnline ? "Đã xóa nhật ký" : "Đã đánh dấu xóa nhật ký (chế độ ngoại tuyến)",
      })
    } catch (error) {
      console.error("Error deleting entry:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa nhật ký",
      })
    }
  }

  const handleRefresh = () => {
    console.log("Refreshing timeline data")
    if (session?.user?.uId) {
      fetchEntries(session.user.uId)
    }
    fetchAllReferenceData()
  }

  const handleManualSync = () => {
    if (isOnline) {
      console.log("Manually triggering data sync")
      toast({
        title: "Đang đồng bộ",
        description: "Đang đồng bộ dữ liệu với máy chủ...",
      })
      syncWithServer().then(() => {
        toast({
          title: "Đồng bộ thành công",
          description: "Dữ liệu đã được đồng bộ với máy chủ",
        })
        if (session?.user?.uId) {
          fetchEntries(session.user.uId)
          checkPendingChanges(session.user.uId)
        }
      })
    } else {
      toast({
        variant: "destructive",
        title: "Không thể đồng bộ",
        description: "Bạn đang ở chế độ ngoại tuyến",
      })
    }
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
            <CardTitle className="text-2xl font-bold text-pretty">Nhật ký canh tác</CardTitle>
            <CardDescription className="flex items-center">
              Theo dõi và quản lý các hoạt động canh tác của bạn
              {!isOnline && (
                <span className="ml-2 flex items-center text-amber-600 text-xs font-medium">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Chế độ ngoại tuyến
                </span>
              )}
              {hasPendingChanges && isOnline && (
                <span className="ml-2 flex items-center text-blue-600 text-xs font-medium">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Có thay đổi chưa đồng bộ
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              className="h-8 w-8 rounded-full"
              title={isOnline ? "Làm mới" : "Làm mới (ngoại tuyến)"}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSync}
              className={`h-8 ${isOnline ? (hasPendingChanges ? "text-blue-600" : "text-green-600") : "text-amber-600"}`}
              title={isOnline ? "Đồng bộ dữ liệu" : "Đang ở chế độ ngoại tuyến"}
            >
              {isOnline ? <Wifi className="h-4 w-4 mr-1" /> : <WifiOff className="h-4 w-4 mr-1" />}
              {isOnline ? (hasPendingChanges ? "Đồng bộ ngay" : "Đồng bộ") : "Ngoại tuyến"}
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
        {!isOnline && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4 mx-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <WifiOff className="h-5 w-5 text-amber-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  Bạn đang ở chế độ ngoại tuyến. Các thay đổi sẽ được lưu cục bộ và đồng bộ khi có kết nối mạng.
                </p>
              </div>
            </div>
          </div>
        )}
        {hasPendingChanges && isOnline && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 mx-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Có thay đổi chưa được đồng bộ với máy chủ. Nhấn "Đồng bộ ngay" để cập nhật.
                </p>
              </div>
            </div>
          </div>
        )}
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Chưa có nhật ký nào</h3>
              <p className="text-sm text-gray-500 mb-4">Bắt đầu thêm các hoạt động canh tác của bạn</p>
              <Button
                variant="default"
                size="sm"
                className="bg-lime-600 hover:bg-lime-700 text-white"
                onClick={() => document.getElementById("add-entry-button")?.click()}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Thêm nhật ký đầu tiên
              </Button>
            </div>
          ) : (
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
                <ModernTimeline
                  data={entries}
                  onAddEntry={handleAddEntry}
                  onDeleteEntry={handleDeleteEntry}
                  isOffline={!isOnline}
                />
              </TabsContent>
              <TabsContent value="calendar" className="mt-0">
                <TimelineCalendar
                  data={entries}
                  onAddEntry={handleAddEntry}
                  onDeleteEntry={handleDeleteEntry}
                  isOffline={!isOnline}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
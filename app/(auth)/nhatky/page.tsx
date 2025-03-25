"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Calendar, RefreshCw, WifiOff, Wifi, AlertTriangle, Search, Filter, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import axios from "axios"
import type { TimelineEntry } from "./types"
import TimelineCalendar from "./components/TimelineCalendar"
import ModernTimeline from "./components/ModernTimeline"
import LoadingScreen from "./components/LoadingScreen"
import { useMediaQuery } from "@/hooks/use-media-query"
import EnhancedAddEditModal from "./components/EnhancedAddEditModal"
import { format, parse, isWithinInterval } from "date-fns"
import { vi } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { DateRange } from "react-day-picker"

export default function TimelinePage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<TimelineEntry[]>([])
  const [activeView, setActiveView] = useState<"timeline" | "calendar">("timeline")
  const [isOnline, setIsOnline] = useState(true)
  const [hasPendingChanges, setHasPendingChanges] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<TimelineEntry | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [seasonFilter, setSeasonFilter] = useState<string>("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Fetch timeline entries
  useEffect(() => {
    if (status === "authenticated" && session?.user?.uId) {
      fetchEntries()
    }
  }, [status, session?.user?.uId])

  // Apply filters
  useEffect(() => {
    applyFilters()
  }, [entries, searchTerm, seasonFilter, dateRange])

  // Show toast when online status changes
  useEffect(() => {
    if (isOnline) {
      toast({
        title: "Đã kết nối mạng",
        description: "Dữ liệu sẽ được đồng bộ tự động",
        variant: "default",
      })
      syncWithServer()
    } else {
      toast({
        title: "Mất kết nối mạng",
        description: "Ứng dụng đang hoạt động ở chế độ ngoại tuyến",
        variant: "destructive",
      })
    }
  }, [isOnline, toast])

  const fetchEntries = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`/api/nhatky?uId=${session?.user?.uId}`)
      setEntries(response.data)
    } catch (error) {
      console.error("Error fetching timeline entries:", error)
      toast({ variant: "destructive", description: "Không thể tải danh sách nhật ký" })

      // If offline, try to load from local storage
      if (!isOnline) {
        const localEntries = localStorage.getItem("timeline_entries")
        if (localEntries) {
          setEntries(JSON.parse(localEntries))
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.uId, toast, isOnline])

  const applyFilters = () => {
    let filtered = [...entries]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.congViec?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.giaiDoan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.chiTietCongViec?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply season filter
    if (seasonFilter && seasonFilter !== "all") {
      filtered = filtered.filter((item) => item.muaVu === seasonFilter)
    }

    // Apply date range filter
    if (dateRange?.from) {
      filtered = filtered.filter((item) => {
        const itemDate = parse(item.ngayThucHien, "dd-MM-yyyy", new Date())

        if (dateRange.from && dateRange.to) {
          return isWithinInterval(itemDate, {
            start: dateRange.from,
            end: dateRange.to,
          })
        } else if (dateRange.from) {
          return itemDate >= dateRange.from
        }

        return true
      })
    }

    setFilteredEntries(filtered)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSeasonFilter("")
    setDateRange(undefined)
  }

  const syncWithServer = async () => {
    if (!isOnline) return

    try {
      // Check for pending changes in local storage
      const pendingChanges = localStorage.getItem("pending_timeline_changes")
      if (pendingChanges) {
        const changes = JSON.parse(pendingChanges)

        // Process each pending change
        for (const change of changes) {
          if (change.type === "add" || change.type === "update") {
            await axios.post("/api/nhatky", change.data)
          } else if (change.type === "delete") {
            await axios.delete(`/api/nhatky?id=${change.id}`)
          }
        }

        // Clear pending changes
        localStorage.removeItem("pending_timeline_changes")
        setHasPendingChanges(false)

        // Refresh data
        fetchEntries()

        toast({
          title: "Đồng bộ thành công",
          description: "Dữ liệu đã được đồng bộ với máy chủ",
        })
      }
    } catch (error) {
      console.error("Error syncing with server:", error)
      toast({
        variant: "destructive",
        title: "Lỗi đồng bộ",
        description: "Không thể đồng bộ dữ liệu với máy chủ",
      })
    }
  }

  const handleAddEntry = async (newEntry: TimelineEntry) => {
    try {
      if (isOnline) {
        // Online mode - send directly to server
        const response = await axios.post("/api/nhatky", newEntry)
        setEntries((prev) => [...prev, response.data])
        toast({
          title: "Thành công",
          description: "Đã thêm nhật ký mới",
        })
      } else {
        // Offline mode - store locally
        const entryWithId = { ...newEntry, _id: `local_${Date.now()}` }
        setEntries((prev) => [...prev, entryWithId])

        // Save to local storage
        localStorage.setItem("timeline_entries", JSON.stringify([...entries, entryWithId]))

        // Add to pending changes
        const pendingChanges = JSON.parse(localStorage.getItem("pending_timeline_changes") || "[]")
        pendingChanges.push({ type: "add", data: newEntry })
        localStorage.setItem("pending_timeline_changes", JSON.stringify(pendingChanges))
        setHasPendingChanges(true)

        toast({
          title: "Thành công",
          description: "Đã lưu nhật ký mới (chế độ ngoại tuyến)",
        })
      }
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
      if (isOnline) {
        // Online mode - delete from server
        await axios.delete(`/api/nhatky?id=${id}`)
        setEntries((prev) => prev.filter((entry) => entry._id !== id))
        toast({
          title: "Thành công",
          description: "Đã xóa nhật ký",
        })
      } else {
        // Offline mode - mark for deletion
        setEntries((prev) => prev.filter((entry) => entry._id !== id))

        // Update local storage
        localStorage.setItem("timeline_entries", JSON.stringify(entries.filter((entry) => entry._id !== id)))

        // Add to pending changes
        const pendingChanges = JSON.parse(localStorage.getItem("pending_timeline_changes") || "[]")
        pendingChanges.push({ type: "delete", id })
        localStorage.setItem("pending_timeline_changes", JSON.stringify(pendingChanges))
        setHasPendingChanges(true)

        toast({
          title: "Thành công",
          description: "Đã đánh dấu xóa nhật ký (chế độ ngoại tuyến)",
        })
      }
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
    fetchEntries()
  }

  const handleManualSync = () => {
    if (isOnline) {
      toast({
        title: "Đang đồng bộ",
        description: "Đang đồng bộ dữ liệu với máy chủ...",
      })
      syncWithServer()
    } else {
      toast({
        variant: "destructive",
        title: "Không thể đồng bộ",
        description: "Bạn đang ở chế độ ngoại tuyến",
      })
    }
  }

  const handleOpenAddModal = () => {
    setCurrentEntry(null)
    setIsModalOpen(true)
  }

  const handleEditEntry = (entry: TimelineEntry) => {
    setCurrentEntry(entry)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentEntry(null)
  }

  const handleExportData = useCallback(() => {
    // Convert data to CSV
    const headers = [
      "Ngày thực hiện",
      "Mùa vụ",
      "Giai đoạn",
      "Công việc",
      "Chi phí công",
      "Chi phí vật tư",
      "Tổng chi phí",
      "Ghi chú",
    ]
    const csvData = [
      headers.join(","),
      ...filteredEntries.map((item) => {
        const totalCost = item.chiPhiCong + item.chiPhiVatTu
        return [
          `"${item.ngayThucHien}"`,
          `"${item.muaVu || ""}"`,
          `"${item.giaiDoan || ""}"`,
          `"${item.congViec || ""}"`,
          item.chiPhiCong,
          item.chiPhiVatTu,
          totalCost,
          `"${item.ghiChu || ""}"`,
        ].join(",")
      }),
    ].join("\n")

    // Create download link
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `nhat-ky-canh-tac-${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({ description: "Xuất dữ liệu thành công" })
  }, [filteredEntries, toast])

  // Get unique seasons from data
  const seasons = Array.from(new Set(entries.map((item) => item.muaVu))).filter(Boolean)

  if (status === "loading" || isLoading) {
    return <LoadingScreen />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-green-50 p-3 md:p-6"
    >
      <div className="max-w-7xl mx-auto">
        <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between pb-2 space-y-4 md:space-y-0 bg-gradient-to-r from-lime-100 to-green-100">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800">Nhật ký canh tác</CardTitle>
              <CardDescription className="text-slate-600 flex items-center">
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
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                className="h-9 w-9 rounded-full bg-white"
                title={isOnline ? "Làm mới" : "Làm mới (ngoại tuyến)"}
              >
                <RefreshCw className="h-4 w-4 text-lime-600" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleManualSync}
                className={`h-9 w-9 rounded-full bg-white ${
                  isOnline ? (hasPendingChanges ? "text-blue-600" : "text-lime-600") : "text-amber-600"
                }`}
                title={isOnline ? "Đồng bộ dữ liệu" : "Đang ở chế độ ngoại tuyến"}
              >
                {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleExportData}
                className="h-9 w-9 rounded-full bg-white"
                title="Xuất dữ liệu"
              >
                <Download className="h-4 w-4 text-lime-600" />
              </Button>

              <Button
                variant="default"
                size="sm"
                className="bg-lime-500 hover:bg-lime-600 text-white shadow-sm"
                onClick={handleOpenAddModal}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Thêm nhật ký
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
                    Có thay đổi chưa được đồng bộ với máy chủ. Nhấn nút đồng bộ để cập nhật.
                  </p>
                </div>
              </div>
            </div>
          )}

          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-lime-600" />
                <Input
                  placeholder="Tìm kiếm nhật ký..."
                  className="pl-8 border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center h-10 border-lime-200 hover:bg-lime-50 text-lime-700"
              >
                <Filter className="mr-2 h-4 w-4" />
                Bộ lọc
                {(seasonFilter || dateRange) && (
                  <Badge variant="secondary" className="ml-2 bg-lime-100 text-lime-800">
                    {(seasonFilter && seasonFilter !== "all" ? 1 : 0) + (dateRange ? 1 : 0)}
                  </Badge>
                )}
              </Button>
              <Select value={seasonFilter} onValueChange={setSeasonFilter}>
                <SelectTrigger className="w-full md:w-[180px] border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500">
                  <SelectValue placeholder="Chọn mùa vụ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả mùa vụ</SelectItem>
                  {seasons.map((season) => (
                    <SelectItem key={season} value={season}>
                      {season}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showFilters && (
              <div className="p-4 bg-lime-50/50 rounded-lg flex flex-col md:flex-row gap-4 items-start border border-lime-100 mb-6">
                <div className="w-full md:w-1/3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Khoảng thời gian</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-lime-200 hover:bg-lime-50 focus-visible:ring-lime-500"
                      >
                        <Calendar className="mr-2 h-4 w-4 text-lime-600" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                            </>
                          ) : (
                            format(dateRange.from, "dd/MM/yyyy")
                          )
                        ) : (
                          "Chọn khoảng thời gian"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={isMobile ? 1 : 2}
                        locale={vi}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="w-full md:w-1/3 flex items-end md:justify-end mt-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-slate-600 hover:bg-lime-100 hover:text-lime-700"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Xóa bộ lọc
                  </Button>
                </div>
              </div>
            )}

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
                  onClick={handleOpenAddModal}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Thêm nhật ký đầu tiên
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="timeline" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 bg-white border-b border-lime-200">
                  <TabsTrigger
                    value="timeline"
                    onClick={() => setActiveView("timeline")}
                    className="py-3 flex items-center justify-center gap-2 data-[state=active]:bg-lime-50 data-[state=active]:text-lime-700 data-[state=active]:border-b-2 data-[state=active]:border-lime-500 hover:bg-lime-50"
                  >
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger
                    value="calendar"
                    onClick={() => setActiveView("calendar")}
                    className="py-3 flex items-center justify-center gap-2 data-[state=active]:bg-lime-50 data-[state=active]:text-lime-700 data-[state=active]:border-b-2 data-[state=active]:border-lime-500 hover:bg-lime-50"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Lịch
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="mt-0">
                  <ModernTimeline
                    data={filteredEntries}
                    onAddEntry={handleAddEntry}
                    onDeleteEntry={handleDeleteEntry}
                    onEditEntry={handleEditEntry}
                    isOffline={!isOnline}
                  />
                </TabsContent>

                <TabsContent value="calendar" className="mt-0">
                  <TimelineCalendar
                    data={filteredEntries}
                    onAddEntry={handleAddEntry}
                    onDeleteEntry={handleDeleteEntry}
                    onEditEntry={handleEditEntry}
                    isOffline={!isOnline}
                  />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Add/Edit Modal */}
      <EnhancedAddEditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddEntry}
        entry={currentEntry}
        isOffline={!isOnline}
      />
    </motion.div>
  )
}


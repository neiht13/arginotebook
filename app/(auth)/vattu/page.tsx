"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusCircle, RefreshCw, Search, Filter, Download, BarChart3 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import axios from "axios"
import type { VatTu } from "./types"
import VatTuTable from "./components/VatTuTable"
import VatTuModal from "./components/VatTuModal"
import VatTuStats from "./components/VatTuStats"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { useMediaQuery } from "./use-media-query"

export default function VatTuPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [vatTuList, setVatTuList] = useState<VatTu[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVatTu, setEditingVatTu] = useState<VatTu | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showStats, setShowStats] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    if (status === "authenticated" && session?.user?.uId) {
      fetchVatTu()
    }
  }, [status, session?.user?.uId, currentPage])

  const fetchVatTu = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`/api/vattu?uId=${session?.user?.uId}&page=${currentPage}&limit=${itemsPerPage}`)
      setVatTuList(response.data)
    } catch (error) {
      console.error("Error fetching supplies:", error)
      toast({ variant: "destructive", description: "Không thể tải danh sách vật tư" })
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.uId, toast, currentPage, itemsPerPage])

  const filteredList = useMemo(() => {
    let filtered = vatTuList
    if (activeTab !== "all") filtered = filtered.filter((item) => item.loai === activeTab)
    if (filterType === "huuCo") filtered = filtered.filter((item) => item.huuCo)
    if (filterType === "hoaHoc") filtered = filtered.filter((item) => !item.huuCo)
    if (filterType === "hetHang") filtered = filtered.filter((item) => item.soLuong <= 0)
    if (filterType === "hetHan")
      filtered = filtered.filter((item) => item.hanSuDung && new Date(item.hanSuDung) < new Date())
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (item) => item.ten.toLowerCase().includes(term) || (item.nhaCungCap?.toLowerCase() || "").includes(term),
      )
    }
    return filtered
  }, [activeTab, vatTuList, searchTerm, filterType])

  const tabCounts = useMemo(
    () => ({
      all: vatTuList.length,
      thuốc: vatTuList.filter((item) => item.loai === "thuốc").length,
      phân: vatTuList.filter((item) => item.loai === "phân").length,
      khác: vatTuList.filter((item) => item.loai === "khác").length,
    }),
    [vatTuList],
  )

  const handleAddVatTu = useCallback(() => {
    setEditingVatTu(null)
    setIsModalOpen(true)
  }, [])

  const handleEditVatTu = useCallback((vatTu: VatTu) => {
    setEditingVatTu(vatTu)
    setIsModalOpen(true)
  }, [])

  const handleDeleteVatTu = useCallback(
    async (id: string) => {
      try {
        await axios.delete(`/api/vattu?id=${id}`)
        toast({ description: "Xóa vật tư thành công" })
        fetchVatTu()
      } catch (error) {
        console.error("Error deleting supply:", error)
        toast({ variant: "destructive", description: "Không thể xóa vật tư" })
      }
    },
    [fetchVatTu, toast],
  )

  const handleSaveVatTu = useCallback(
    async (data: VatTu) => {
      try {
        if (data._id) {
          await axios.put(`/api/vattu?id=${data._id}`, data)
          toast({ description: "Cập nhật vật tư thành công" })
        } else {
          await axios.post("/api/vattu", data)
          toast({ description: "Thêm vật tư thành công" })
        }
        setIsModalOpen(false)
        fetchVatTu()
      } catch (error) {
        console.error("Error saving supply:", error)
        toast({ variant: "destructive", description: "Không thể lưu vật tư" })
      }
    },
    [fetchVatTu, toast],
  )

  const handleRefresh = useCallback(() => fetchVatTu(), [fetchVatTu])

  const handleExportData = useCallback(() => {
    // Convert data to CSV
    const headers = [
      "Tên vật tư",
      "Loại",
      "Hữu cơ",
      "Số lượng",
      "Đơn vị",
      "Đơn giá",
      "Nhà cung cấp",
      "Ngày mua",
      "Hạn sử dụng",
    ]
    const csvData = [
      headers.join(","),
      ...vatTuList.map((item) =>
        [
          `"${item.ten}"`,
          item.loai,
          item.huuCo ? "Có" : "Không",
          item.soLuong,
          item.donViTinh,
          item.donGia,
          `"${item.nhaCungCap || ""}"`,
          item.ngayMua || "",
          item.hanSuDung || "",
        ].join(","),
      ),
    ].join("\n")

    // Create download link
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `vattu-export-${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({ description: "Xuất dữ liệu thành công" })
  }, [vatTuList, toast])

  const toggleStats = useCallback(() => {
    setShowStats((prev) => !prev)
  }, [])


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
              <CardTitle className="text-2xl font-bold text-slate-800">Quản lý vật tư</CardTitle>
              <CardDescription className="text-slate-600">
                Theo dõi và quản lý thuốc, phân bón và các vật tư nông nghiệp
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="icon" onClick={handleRefresh} className="h-9 w-9 rounded-full bg-white">
                <RefreshCw className="h-4 w-4 text-lime-700" />
              </Button>

              {isMobile ? (
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-white">
                      <BarChart3 className="h-4 w-4 text-lime-700" />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="p-4 max-h-[90vh] overflow-auto">
                    <VatTuStats data={vatTuList} />
                  </DrawerContent>
                </Drawer>
              ) : (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleStats}
                  className={`h-9 w-9 rounded-full ${showStats ? "bg-lime-200" : "bg-white"}`}
                >
                  <BarChart3 className="h-4 w-4 text-lime-700" />
                </Button>
              )}

              <Button
                variant="outline"
                size="icon"
                onClick={handleExportData}
                className="h-9 w-9 rounded-full bg-white"
              >
                <Download className="h-4 w-4 text-lime-700" />
              </Button>

              <Button
                variant="default"
                size="sm"
                className="bg-lime-500 hover:bg-lime-600 text-white shadow-sm"
                onClick={handleAddVatTu}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Thêm vật tư
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-lime-700" />
                <Input
                  placeholder="Tìm kiếm vật tư..."
                  className="pl-8 border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-[180px] border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500">
                  <Filter className="mr-2 h-4 w-4 text-lime-700" />
                  <SelectValue placeholder="Lọc theo loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="huuCo">Hữu cơ</SelectItem>
                  <SelectItem value="hoaHoc">Hóa học</SelectItem>
                  <SelectItem value="hetHang">Hết hàng</SelectItem>
                  <SelectItem value="hetHan">Hết hạn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={`grid grid-cols-1 ${showStats && !isMobile ? "md:grid-cols-4" : "md:grid-cols-1"} gap-6`}>
              <div className={`${showStats && !isMobile ? "md:col-span-3" : "md:col-span-1"}`}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-4 bg-white border-b border-lime-200">
                    <TabsTrigger
                      value="all"
                      className="py-3 flex items-center justify-center gap-2 data-[state=active]:bg-lime-50 data-[state=active]:text-lime-800 data-[state=active]:border-b-2 data-[state=active]:border-lime-500 hover:bg-lime-50"
                    >
                      Tất cả <Badge className="bg-lime-200 text-lime-800">{tabCounts.all}</Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="thuốc"
                      className="py-3 flex items-center justify-center gap-2 data-[state=active]:bg-lime-50 data-[state=active]:text-lime-800 data-[state=active]:border-b-2 data-[state=active]:border-lime-500 hover:bg-lime-50"
                    >
                      Thuốc <Badge className="bg-lime-200 text-lime-800">{tabCounts.thuốc}</Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="phân"
                      className="py-3 flex items-center justify-center gap-2 data-[state=active]:bg-lime-50 data-[state=active]:text-lime-800 data-[state=active]:border-b-2 data-[state=active]:border-lime-500 hover:bg-lime-50"
                    >
                      Phân bón <Badge className="bg-lime-200 text-lime-800">{tabCounts.phân}</Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="khác"
                      className="py-3 flex items-center justify-center gap-2 data-[state=active]:bg-lime-50 data-[state=active]:text-lime-800 data-[state=active]:border-b-2 data-[state=active]:border-lime-500 hover:bg-lime-50"
                    >
                      Khác <Badge className="bg-lime-200 text-lime-800">{tabCounts.khác}</Badge>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-0">
                    <VatTuTable
                      data={filteredList}
                      onEdit={handleEditVatTu}
                      onDelete={handleDeleteVatTu}
                      currentPage={currentPage}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </TabsContent>
                  <TabsContent value="thuốc" className="mt-0">
                    <VatTuTable
                      data={filteredList}
                      onEdit={handleEditVatTu}
                      onDelete={handleDeleteVatTu}
                      currentPage={currentPage}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </TabsContent>
                  <TabsContent value="phân" className="mt-0">
                    <VatTuTable
                      data={filteredList}
                      onEdit={handleEditVatTu}
                      onDelete={handleDeleteVatTu}
                      currentPage={currentPage}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </TabsContent>
                  <TabsContent value="khác" className="mt-0">
                    <VatTuTable
                      data={filteredList}
                      onEdit={handleEditVatTu}
                      onDelete={handleDeleteVatTu}
                      currentPage={currentPage}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {showStats && !isMobile && (
                <div className="md:col-span-1">
                  <VatTuStats data={vatTuList} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <VatTuModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveVatTu}
          vatTu={editingVatTu}
        />
      </div>
    </motion.div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusCircle, RefreshCw, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-toastify"
import axios from "axios"
import type { VatTu } from "./types"
import VatTuTable from "./components/VatTuTable"
import VatTuModal from "./components/VatTuModal"
import VatTuStats from "./components/VatTuStats"
import LoadingScreen from "../timeline/components/LoadingScreen"

export default function VatTuPage() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [vatTuList, setVatTuList] = useState<VatTu[]>([])
  const [filteredList, setFilteredList] = useState<VatTu[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVatTu, setEditingVatTu] = useState<VatTu | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")

  useEffect(() => {
    if (status === "authenticated") {
      fetchVatTu()
    }
  }, [status])

  const fetchVatTu = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get("/api/vattu")
      setVatTuList(response.data)
      setFilteredList(response.data)
    } catch (error) {
      console.error("Error fetching supplies:", error)
      toast.error("Không thể tải danh sách vật tư")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Apply filters when tab, search term or filter type changes
    let filtered = vatTuList

    // Filter by type based on active tab
    if (activeTab !== "all") {
      filtered = filtered.filter((item) => item.loai === activeTab)
    }

    // Apply additional type filter if selected
    if (filterType !== "all") {
      filtered = filtered.filter((item) => {
        if (filterType === "huuCo") return item.huuCo
        if (filterType === "hoaHoc") return !item.huuCo
        return true
      })
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (item) => item.ten.toLowerCase().includes(term) || item.nhaCungCap?.toLowerCase().includes(term),
      )
    }

    setFilteredList(filtered)
  }, [activeTab, vatTuList, searchTerm, filterType])

  const handleAddVatTu = () => {
    setEditingVatTu(null)
    setIsModalOpen(true)
  }

  const handleEditVatTu = (vatTu: VatTu) => {
    setEditingVatTu(vatTu)
    setIsModalOpen(true)
  }

  const handleDeleteVatTu = async (id: string) => {
    try {
      await axios.delete(`/api/vattu?id=${id}`)
      toast.success("Xóa vật tư thành công")
      fetchVatTu()
    } catch (error) {
      console.error("Error deleting supply:", error)
      toast.error("Không thể xóa vật tư")
    }
  }

  const handleSaveVatTu = async (data: VatTu) => {
    try {
      await axios.post("/api/vattu", data)
      toast.success(data._id ? "Cập nhật vật tư thành công" : "Thêm vật tư thành công")
      setIsModalOpen(false)
      fetchVatTu()
    } catch (error) {
      console.error("Error saving supply:", error)
      toast.error("Không thể lưu vật tư")
    }
  }

  const handleRefresh = () => {
    fetchVatTu()
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
            <CardTitle className="text-2xl font-bold">Quản lý vật tư</CardTitle>
            <CardDescription>Theo dõi và quản lý thuốc, phân bón và các vật tư nông nghiệp</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={handleRefresh} className="h-8 w-8 rounded-full">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-lime-600 hover:bg-lime-700 text-white"
              onClick={handleAddVatTu}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm vật tư
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Tìm kiếm vật tư..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Lọc theo loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="huuCo">Hữu cơ</SelectItem>
                  <SelectItem value="hoaHoc">Hóa học</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-lime-100 data-[state=active]:text-lime-800"
                  >
                    Tất cả
                  </TabsTrigger>
                  <TabsTrigger
                    value="thuốc"
                    className="data-[state=active]:bg-lime-100 data-[state=active]:text-lime-800"
                  >
                    Thuốc
                  </TabsTrigger>
                  <TabsTrigger
                    value="phân"
                    className="data-[state=active]:bg-lime-100 data-[state=active]:text-lime-800"
                  >
                    Phân bón
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-0">
                  <VatTuTable data={filteredList} onEdit={handleEditVatTu} onDelete={handleDeleteVatTu} />
                </TabsContent>

                <TabsContent value="thuốc" className="mt-0">
                  <VatTuTable data={filteredList} onEdit={handleEditVatTu} onDelete={handleDeleteVatTu} />
                </TabsContent>

                <TabsContent value="phân" className="mt-0">
                  <VatTuTable data={filteredList} onEdit={handleEditVatTu} onDelete={handleDeleteVatTu} />
                </TabsContent>
              </Tabs>
            </div>

            <div className="md:col-span-1">
              <VatTuStats data={vatTuList} />
            </div>
          </div>
        </CardContent>
      </Card>

      <VatTuModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVatTu}
        vatTu={editingVatTu}
      />
    </motion.div>
  )
}


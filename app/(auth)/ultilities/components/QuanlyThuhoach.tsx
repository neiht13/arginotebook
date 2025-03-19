"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Calendar, Plus, Trash2, Edit, Save, X, FileSpreadsheet, BarChart3 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

// Định nghĩa kiểu dữ liệu cho mùa vụ
interface HarvestRecord {
  id: string
  cropName: string
  harvestDate: string
  quantity: number
  unit: string
  quality: "good" | "average" | "poor"
  notes: string
}

export default function QuanlyThuhoach() {
  const [records, setRecords] = useState<HarvestRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("list")

  // Form state
  const [formData, setFormData] = useState<Omit<HarvestRecord, "id">>({
    cropName: "",
    harvestDate: format(new Date(), "yyyy-MM-dd"),
    quantity: 0,
    unit: "kg",
    quality: "good",
    notes: "",
  })

  // Mẫu dữ liệu
  const sampleRecords: HarvestRecord[] = [
    {
      id: "1",
      cropName: "Lúa IR50404",
      harvestDate: "2023-06-15",
      quantity: 5000,
      unit: "kg",
      quality: "good",
      notes: "Vụ Đông Xuân, năng suất cao",
    },
    {
      id: "2",
      cropName: "Lúa Jasmine",
      harvestDate: "2023-10-20",
      quantity: 4200,
      unit: "kg",
      quality: "good",
      notes: "Vụ Hè Thu, chất lượng tốt",
    },
    {
      id: "3",
      cropName: "Dưa hấu",
      harvestDate: "2023-04-10",
      quantity: 1500,
      unit: "kg",
      quality: "average",
      notes: "Bị ảnh hưởng bởi thời tiết",
    },
    {
      id: "4",
      cropName: "Ớt",
      harvestDate: "2023-08-05",
      quantity: 300,
      unit: "kg",
      quality: "good",
      notes: "Giá bán cao",
    },
    {
      id: "5",
      cropName: "Cà chua",
      harvestDate: "2023-09-12",
      quantity: 450,
      unit: "kg",
      quality: "poor",
      notes: "Bị sâu bệnh, năng suất thấp",
    },
  ]

  // Lấy dữ liệu từ localStorage hoặc sử dụng dữ liệu mẫu
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Giả lập API call
        setTimeout(() => {
          const savedRecords = localStorage.getItem("harvestRecords")
          if (savedRecords) {
            setRecords(JSON.parse(savedRecords))
          } else {
            setRecords(sampleRecords)
            localStorage.setItem("harvestRecords", JSON.stringify(sampleRecords))
          }
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching harvest records:", error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Lưu dữ liệu vào localStorage khi có thay đổi
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("harvestRecords", JSON.stringify(records))
    }
  }, [records, isLoading])

  // Xử lý thay đổi form
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number.parseFloat(value) : value,
    }))
  }

  // Thêm mới bản ghi
  const handleAddRecord = () => {
    const newRecord: HarvestRecord = {
      id: Date.now().toString(),
      ...formData,
    }

    setRecords((prev) => [...prev, newRecord])
    resetForm()
    setIsAdding(false)
  }

  // Cập nhật bản ghi
  const handleUpdateRecord = () => {
    if (!isEditing) return

    setRecords((prev) => prev.map((record) => (record.id === isEditing ? { ...formData, id: record.id } : record)))

    resetForm()
    setIsEditing(null)
  }

  // Xóa bản ghi
  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((record) => record.id !== id))
  }

  // Bắt đầu chỉnh sửa bản ghi
  const startEditing = (record: HarvestRecord) => {
    setFormData({
      cropName: record.cropName,
      harvestDate: record.harvestDate,
      quantity: record.quantity,
      unit: record.unit,
      quality: record.quality,
      notes: record.notes,
    })
    setIsEditing(record.id)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      cropName: "",
      harvestDate: format(new Date(), "yyyy-MM-dd"),
      quantity: 0,
      unit: "kg",
      quality: "good",
      notes: "",
    })
  }

  // Hủy thêm/sửa
  const handleCancel = () => {
    resetForm()
    setIsAdding(false)
    setIsEditing(null)
  }

  // Chuẩn bị dữ liệu cho biểu đồ cột
  const prepareBarChartData = () => {
    const cropMap = new Map()

    records.forEach((record) => {
      const cropName = record.cropName
      const quantity = record.quantity

      if (cropMap.has(cropName)) {
        cropMap.set(cropName, cropMap.get(cropName) + quantity)
      } else {
        cropMap.set(cropName, quantity)
      }
    })

    return Array.from(cropMap.entries()).map(([name, value]) => ({
      name,
      value,
    }))
  }

  // Chuẩn bị dữ liệu cho biểu đồ tròn
  const preparePieChartData = () => {
    const qualityMap = new Map([
      ["good", { name: "Tốt", value: 0 }],
      ["average", { name: "Trung bình", value: 0 }],
      ["poor", { name: "Kém", value: 0 }],
    ])

    records.forEach((record) => {
      const quality = record.quality
      const current = qualityMap.get(quality)
      if (current) {
        current.value += record.quantity
      }
    })

    return Array.from(qualityMap.values()).filter((item) => item.value > 0)
  }

  // Màu sắc cho biểu đồ tròn
  const COLORS = ["#4ade80", "#facc15", "#f87171"]

  // Định dạng ngày tháng
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: vi })
  }

  // Lấy màu cho chất lượng
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "good":
        return "bg-green-100 text-green-800"
      case "average":
        return "bg-yellow-100 text-yellow-800"
      case "poor":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Lấy tên hiển thị cho chất lượng
  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case "good":
        return "Tốt"
      case "average":
        return "Trung bình"
      case "poor":
        return "Kém"
      default:
        return "Không xác định"
    }
  }

  // Xuất dữ liệu ra CSV
  const exportToCSV = () => {
    const headers = ["Tên cây trồng", "Ngày thu hoạch", "Số lượng", "Đơn vị", "Chất lượng", "Ghi chú"]
    const csvRows = [
      headers.join(","),
      ...records.map((record) =>
        [
          record.cropName,
          formatDate(record.harvestDate),
          record.quantity,
          record.unit,
          getQualityLabel(record.quality),
          `"${record.notes.replace(/"/g, '""')}"`,
        ].join(","),
      ),
    ]

    const csvString = csvRows.join("\n")
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `nhat-ky-thu-hoach-${format(new Date(), "dd-MM-yyyy")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-6 bg-white">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3 space-y-6">
          <Card className="shadow-md border border-lime-100">
            <CardHeader className="bg-lime-50 border-b border-lime-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold text-lime-800 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Nhật ký thu hoạch
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-lime-700 border-lime-200 hover:bg-lime-50"
                  onClick={exportToCSV}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1" />
                  Xuất CSV
                </Button>
                <Button
                  size="sm"
                  className="bg-lime-600 hover:bg-lime-700 text-white"
                  onClick={() => {
                    setIsAdding(true)
                    setIsEditing(null)
                  }}
                  disabled={isAdding || isEditing !== null}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Thêm mới
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger
                    value="list"
                    className="data-[state=active]:bg-lime-100 data-[state=active]:text-lime-800"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Danh sách
                  </TabsTrigger>
                  <TabsTrigger
                    value="chart"
                    className="data-[state=active]:bg-lime-100 data-[state=active]:text-lime-800"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Biểu đồ
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="m-0">
                  {/* Form thêm/sửa */}
                  <AnimatePresence>
                    {(isAdding || isEditing !== null) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 border border-lime-200 rounded-lg bg-lime-50 mb-4">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-medium text-lime-800">
                              {isAdding ? "Thêm mới thu hoạch" : "Cập nhật thu hoạch"}
                            </h3>
                            <Button variant="ghost" size="icon" onClick={handleCancel} className="h-8 w-8">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="cropName">Tên cây trồng</Label>
                              <Input
                                id="cropName"
                                name="cropName"
                                value={formData.cropName}
                                onChange={handleFormChange}
                                placeholder="Nhập tên cây trồng"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="harvestDate">Ngày thu hoạch</Label>
                              <Input
                                id="harvestDate"
                                name="harvestDate"
                                type="date"
                                value={formData.harvestDate}
                                onChange={handleFormChange}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="quantity">Số lượng</Label>
                              <div className="flex">
                                <Input
                                  id="quantity"
                                  name="quantity"
                                  type="number"
                                  value={formData.quantity}
                                  onChange={handleFormChange}
                                  min="0"
                                  step="0.1"
                                  required
                                  className="rounded-r-none"
                                />
                                <select
                                  name="unit"
                                  value={formData.unit}
                                  onChange={handleFormChange}
                                  className="rounded-l-none border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <option value="kg">kg</option>
                                  <option value="tạ">tạ</option>
                                  <option value="tấn">tấn</option>
                                  <option value="cây">cây</option>
                                  <option value="quả">quả</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="quality">Chất lượng</Label>
                              <select
                                id="quality"
                                name="quality"
                                value={formData.quality}
                                onChange={handleFormChange}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <option value="good">Tốt</option>
                                <option value="average">Trung bình</option>
                                <option value="poor">Kém</option>
                              </select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="notes">Ghi chú</Label>
                              <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleFormChange}
                                placeholder="Nhập ghi chú (nếu có)"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={handleCancel}>
                              Hủy
                            </Button>
                            <Button
                              className="bg-lime-600 hover:bg-lime-700 text-white"
                              onClick={isAdding ? handleAddRecord : handleUpdateRecord}
                            >
                              <Save className="w-4 h-4 mr-1" />
                              {isAdding ? "Thêm" : "Cập nhật"}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Danh sách thu hoạch */}
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))}
                    </div>
                  ) : records.length > 0 ? (
                    <div className="space-y-3">
                      {records.map((record) => (
                        <motion.div
                          key={record.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-lg font-medium">{record.cropName}</h3>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {formatDate(record.harvestDate)}
                                </div>
                                <div>
                                  <span className="font-medium">{record.quantity}</span> {record.unit}
                                </div>
                                <div className={`px-2 py-0.5 rounded-full text-xs ${getQualityColor(record.quality)}`}>
                                  {getQualityLabel(record.quality)}
                                </div>
                              </div>
                              {record.notes && <p className="mt-2 text-sm text-gray-600">{record.notes}</p>}
                            </div>
                            <div className="flex items-start gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-500 hover:text-lime-600"
                                onClick={() => startEditing(record)}
                                disabled={isAdding || isEditing !== null}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-500 hover:text-red-600"
                                onClick={() => handleDeleteRecord(record.id)}
                                disabled={isAdding || isEditing !== null}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-lg border-dashed">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <h3 className="text-lg font-medium text-gray-600">Chưa có dữ liệu thu hoạch</h3>
                      <p className="text-gray-500 mb-4">Thêm mới để bắt đầu theo dõi thu hoạch của bạn</p>
                      <Button
                        className="bg-lime-600 hover:bg-lime-700 text-white"
                        onClick={() => {
                          setIsAdding(true)
                          setIsEditing(null)
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm mới
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="chart" className="m-0">
                  {isLoading ? (
                    <div className="space-y-6">
                      <Skeleton className="h-[300px] w-full" />
                      <Skeleton className="h-[300px] w-full" />
                    </div>
                  ) : records.length > 0 ? (
                    <div className="space-y-6">
                      {/* Biểu đồ cột theo loại cây trồng */}
                      <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4">Sản lượng theo loại cây trồng</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <RechartsBarChart
                            data={prepareBarChartData()}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" name="Sản lượng" fill="#84cc16" />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Biểu đồ tròn theo chất lượng */}
                      <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4">Phân bố chất lượng thu hoạch</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={preparePieChartData()}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100)?.toFixed(0)}%`}
                            >
                              {preparePieChartData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} ${records[0]?.unit || "kg"}`, "Sản lượng"]} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-lg border-dashed">
                      <BarChart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <h3 className="text-lg font-medium text-gray-600">Chưa có dữ liệu để hiển thị biểu đồ</h3>
                      <p className="text-gray-500 mb-4">Thêm mới để bắt đầu theo dõi thu hoạch của bạn</p>
                      <Button
                        className="bg-lime-600 hover:bg-lime-700 text-white"
                        onClick={() => {
                          setIsAdding(true)
                          setIsEditing(null)
                          setActiveTab("list")
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm mới
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="lg:w-1/3">
          <Card className="shadow-md border border-lime-100">
            <CardHeader className="bg-lime-50 border-b border-lime-100">
              <CardTitle className="text-xl font-bold text-lime-800 flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Thống kê thu hoạch
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="space-y-4">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
              ) : records.length > 0 ? (
                <div className="space-y-4">
                  {/* Tổng số lượng thu hoạch */}
                  <div className="p-4 bg-lime-50 rounded-lg">
                    <h3 className="text-sm font-medium text-lime-800 mb-1">Tổng sản lượng</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {(() => {
                        const unitMap = new Map()
                        records.forEach((record) => {
                          const unit = record.unit
                          const quantity = record.quantity

                          if (unitMap.has(unit)) {
                            unitMap.set(unit, unitMap.get(unit) + quantity)
                          } else {
                            unitMap.set(unit, quantity)
                          }
                        })

                        return Array.from(unitMap.entries()).map(([unit, quantity]) => (
                          <div key={unit} className="bg-white p-2 rounded border border-lime-100">
                            <p className="text-2xl font-bold text-lime-700">{quantity}</p>
                            <p className="text-sm text-gray-500">{unit}</p>
                          </div>
                        ))
                      })()}
                    </div>
                  </div>

                  {/* Số lượng loại cây trồng */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800 mb-1">Loại cây trồng</h3>
                    <div className="flex items-end gap-2">
                      <p className="text-2xl font-bold text-blue-700">{new Set(records.map((r) => r.cropName)).size}</p>
                      <p className="text-sm text-gray-500">loại</p>
                    </div>
                  </div>

                  {/* Chất lượng */}
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h3 className="text-sm font-medium text-amber-800 mb-1">Phân bố chất lượng</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {["good", "average", "poor"].map((quality) => {
                        const count = records.filter((r) => r.quality === quality).length
                        const percent = records.length > 0 ? Math.round((count / records.length) * 100) : 0

                        return (
                          <div key={quality} className="bg-white p-2 rounded border border-amber-100">
                            <p className="text-lg font-bold text-amber-700">{percent}%</p>
                            <p className="text-xs text-gray-500">{getQualityLabel(quality)}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Thu hoạch gần đây */}
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <h3 className="text-sm font-medium text-emerald-800 mb-2">Thu hoạch gần đây</h3>
                    <div className="space-y-2">
                      {records
                        .sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime())
                        .slice(0, 3)
                        .map((record) => (
                          <div
                            key={record.id}
                            className="bg-white p-2 rounded border border-emerald-100 flex justify-between items-center"
                          >
                            <div>
                              <p className="font-medium">{record.cropName}</p>
                              <p className="text-xs text-gray-500">{formatDate(record.harvestDate)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-emerald-700">
                                {record.quantity} {record.unit}
                              </p>
                              <p className={`text-xs ${getQualityColor(record.quality)}`}>
                                {getQualityLabel(record.quality)}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Chưa có dữ liệu thống kê</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


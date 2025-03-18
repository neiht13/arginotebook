"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { TimelineEntry, Agrochemical } from "./types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, X, Camera, Trash2, Plus, Loader2, AlertCircle, Search, Leaf } from "lucide-react"
import CurrencyInput from "@/components/ui/input-currency"
import axios from "axios"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"

interface Season {
  _id: string
  muavu: string
  nam: string
  ngaybatdau: string
  ngayketthuc: string
}

const stages = [
  { _id: "1", tengiaidoan: "Làm đất - xuống giống", color: "#BB4D00" },
  { _id: "2", tengiaidoan: "Lúa mạ", color: "#31D304" },
  { _id: "3", tengiaidoan: "Đẻ nhánh", color: "#1D8300" },
  { _id: "4", tengiaidoan: "Làm đòng", color: "#B7F305" },
  { _id: "5", tengiaidoan: "Trổ chín", color: "#FFFF00" },
  { _id: "6", tengiaidoan: "Chín, thu hoạch", color: "#FFAD00" },
]

const tasks = [
  { _id: "1", tenCongViec: "Cày đất", giaidoanId: "1" },
  { _id: "2", tenCongViec: "Đánh rãnh", giaidoanId: "1" },
  { _id: "3", tenCongViec: "Trạc đất", giaidoanId: "1" },
  { _id: "4", tenCongViec: "Phun thuốc", giaidoanId: "1" },
  { _id: "5", tenCongViec: "Xuống giống", giaidoanId: "1" },
  { _id: "6", tenCongViec: "Bón phân", giaidoanId: "1" },
  { _id: "7", tenCongViec: "Bơm nước", giaidoanId: "2" },
  { _id: "8", tenCongViec: "Bón phân", giaidoanId: "2" },
  { _id: "9", tenCongViec: "Phun thuốc", giaidoanId: "2" },
  { _id: "10", tenCongViec: "Cấy dặm", giaidoanId: "2" },
  { _id: "11", tenCongViec: "Bơm nước", giaidoanId: "3" },
  { _id: "12", tenCongViec: "Bón phân", giaidoanId: "3" },
  { _id: "13", tenCongViec: "Phun thuốc", giaidoanId: "3" },
  { _id: "14", tenCongViec: "Bơm nước", giaidoanId: "4" },
  { _id: "15", tenCongViec: "Bón phân", giaidoanId: "4" },
  { _id: "16", tenCongViec: "Phun thuốc", giaidoanId: "4" },
  { _id: "17", tenCongViec: "Bơm nước", giaidoanId: "5" },
  { _id: "18", tenCongViec: "Bón phân", giaidoanId: "5" },
  { _id: "19", tenCongViec: "Phun thuốc", giaidoanId: "5" },
  { _id: "20", tenCongViec: "Bơm nước", giaidoanId: "6" },
  { _id: "21", tenCongViec: "Bón phân", giaidoanId: "6" },
  { _id: "22", tenCongViec: "Phun thuốc", giaidoanId: "6" },
  { _id: "23", tenCongViec: "Thu hoạch", giaidoanId: "6" },
  { _id: "24", tenCongViec: "Công việc khác", giaidoanId: "1" },
  { _id: "25", tenCongViec: "Công việc khác", giaidoanId: "2" },
  { _id: "26", tenCongViec: "Công việc khác", giaidoanId: "3" },
  { _id: "27", tenCongViec: "Công việc khác", giaidoanId: "4" },
  { _id: "28", tenCongViec: "Công việc khác", giaidoanId: "5" },
  { _id: "29", tenCongViec: "Công việc khác", giaidoanId: "6" },
]

interface EnhancedAddEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (entry: TimelineEntry) => void
  entry: TimelineEntry | null
}

const EnhancedAddEditModal: React.FC<EnhancedAddEditModalProps> = ({ isOpen, onClose, onSubmit, entry }) => {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<TimelineEntry>>({
    muaVu: "",
    muaVuId: "",
    giaiDoan: "",
    giaiDoanId: "",
    congViec: "",
    congViecId: "",
    ngayThucHien: format(new Date(), "dd-MM-yyyy"),
    chiPhiCong: 0,
    chiPhiVatTu: 0,
    soLuongCong: 0,
    soLuongVatTu: 0,
    chiTietCongViec: "",
    ghiChu: "",
    agrochemicals: [],
    image: [],
  })
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedStageId, setSelectedStageId] = useState("")
  const [newAgrochemical, setNewAgrochemical] = useState<Partial<Agrochemical>>({
    name: "",
    type: "thuốc",
    isOrganic: false,
    lieuLuong: 0,
    donViTinh: "kg",
    donGia: 0,
  })
  const [images, setImages] = useState<File[]>([])
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)

  // State for inventory management
  const [availableSupplies, setAvailableSupplies] = useState<any[]>([])
  const [filteredSupplies, setFilteredSupplies] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loadingSupplies, setLoadingSupplies] = useState(false)
  const [selectedSupply, setSelectedSupply] = useState<any | null>(null)

  // State for seasons
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loadingSeasons, setLoadingSeasons] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null)

  // Initialize form data when entry changes
  useEffect(() => {
    if (entry) {
      // Find the stage ID based on the stage name
      const stageObj = stages.find((s) => s.tengiaidoan === entry.giaiDoan)
      const stageId = stageObj ? stageObj._id : ""

      // Parse the date
      let dateObj = new Date()
      try {
        if (entry.ngayThucHien) {
          const [day, month, year] = entry.ngayThucHien.split("-").map(Number)
          dateObj = new Date(year, month - 1, day)
        }
      } catch (error) {
        console.error("Error parsing date:", error)
      }

      setSelectedDate(dateObj)
      setSelectedStageId(stageId)

      // Set form data
      setFormData({
        ...entry,
        giaiDoanId: stageId,
      })

      // Set preview images if available
      if (entry.image && entry.image.length > 0) {
        const previews = entry.image.map((img) => img.src)
        setPreviewImages(previews)
      } else {
        setPreviewImages([])
      }
    } else {
      // Reset form for new entry
      resetForm()
    }
  }, [entry, isOpen])

  // Fetch available supplies and seasons when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSupplies()
      fetchSeasons()
    }
  }, [isOpen])

  // Filter supplies based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = availableSupplies.filter((supply) => supply.ten.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredSupplies(filtered)
    } else {
      setFilteredSupplies(availableSupplies)
    }
  }, [searchTerm, availableSupplies])

  // Update ngaySauBatDau when selectedDate or selectedSeason changes
  useEffect(() => {
    if (selectedSeason && selectedDate) {
      try {
        const seasonStartDate = parseVietnameseDate(selectedSeason.ngaybatdau)
        const daysDiff = Math.floor((selectedDate.getTime() - seasonStartDate.getTime()) / (1000 * 60 * 60 * 24))

        if (daysDiff >= 0) {
          setFormData((prev) => ({
            ...prev,
            ngaySauBatDau: daysDiff,
          }))
        }
      } catch (error) {
        console.error("Error calculating days difference:", error)
      }
    }
  }, [selectedDate, selectedSeason])

  // Calculate material cost based on agrochemicals
  useEffect(() => {
    if (formData.agrochemicals && formData.agrochemicals.length > 0) {
      const totalCost = formData.agrochemicals.reduce((sum, item) => {
        return sum + (item.donGia || 0) * (item.lieuLuong || 0)
      }, 0)

      setFormData((prev) => ({
        ...prev,
        chiPhiVatTu: totalCost,
      }))
    }
  }, [formData.agrochemicals])

  const parseVietnameseDate = (dateString: string) => {
    try {
      const [day, month, year] = dateString.split("-").map(Number)
      return new Date(year, month - 1, day)
    } catch (error) {
      console.error("Error parsing date:", error)
      return new Date()
    }
  }

  const fetchSupplies = async () => {
    try {
      setLoadingSupplies(true)
      const response = await axios.get("/api/vattu")
      // Filter out supplies with zero quantity
      const availableItems = response.data.filter((item) => item.soLuong > 0)
      setAvailableSupplies(availableItems)
      setFilteredSupplies(availableItems)
    } catch (error) {
      console.error("Error fetching supplies:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách vật tư",
      })
    } finally {
      setLoadingSupplies(false)
    }
  }

  const fetchSeasons = async () => {
    try {
      setLoadingSeasons(true)
      const response = await axios.get("/api/muavu")
      setSeasons(response.data)
    } catch (error) {
      console.error("Error fetching seasons:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách mùa vụ",
      })
    } finally {
      setLoadingSeasons(false)
    }
  }

  const resetForm = () => {
    setFormData({
      muaVu: "",
      muaVuId: "",
      giaiDoan: "",
      giaiDoanId: "",
      congViec: "",
      congViecId: "",
      ngayThucHien: format(new Date(), "dd-MM-yyyy"),
      chiPhiCong: 0,
      chiPhiVatTu: 0,
      soLuongCong: 0,
      soLuongVatTu: 0,
      chiTietCongViec: "",
      ghiChu: "",
      agrochemicals: [],
      image: [],
    })
    setSelectedDate(new Date())
    setSelectedStageId("")
    setImages([])
    setPreviewImages([])
    setSelectedSupply(null)
    setSelectedSeason(null)
    setNewAgrochemical({
      name: "",
      type: "thuốc",
      isOrganic: false,
      lieuLuong: 0,
      donViTinh: "kg",
      donGia: 0,
    })
  }

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
    setFormData((prev) => ({
      ...prev,
      ngayThucHien: format(date, "dd-MM-yyyy"),
    }))
  }

  const handleStageChange = (stageId: string) => {
    setSelectedStageId(stageId)
    const stage = stages.find((s) => s._id === stageId)
    if (stage) {
      setFormData((prev) => ({
        ...prev,
        giaiDoan: stage.tengiaidoan,
        giaiDoanId: stageId,
        // Reset task when stage changes
        congViec: "",
        congViecId: "",
      }))
    }
  }

  const handleTaskChange = (taskId: string) => {
    const task = tasks.find((t) => t._id === taskId)
    if (task) {
      setFormData((prev) => ({
        ...prev,
        congViec: task.tenCongViec,
        congViecId: taskId,
      }))
    }
  }

  const handleSeasonChange = (seasonId: string) => {
    const season = seasons.find((s) => s._id === seasonId)
    if (season) {
      setSelectedSeason(season)
      setFormData((prev) => ({
        ...prev,
        muaVu: season.muavu,
        muaVuId: seasonId,
      }))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCurrencyChange = (data: { name: string; value: number }) => {
    const { name, value } = data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAgrochemicalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      setNewAgrochemical((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }))
    } else if (type === "number") {
      setNewAgrochemical((prev) => ({
        ...prev,
        [name]: Number.parseFloat(value) || 0,
      }))
    } else {
      setNewAgrochemical((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const selectSupply = (supply: any) => {
    setSelectedSupply(supply)
    setNewAgrochemical({
      name: supply.ten,
      type: supply.loai,
      isOrganic: supply.huuCo,
      lieuLuong: 0,
      donViTinh: supply.donViTinh,
      donGia: supply.donGia,
      vattuId: supply._id,
    })
  }

  const addAgrochemical = async () => {
    if (!newAgrochemical.name || !newAgrochemical.lieuLuong) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập tên và liều lượng vật tư",
      })
      return
    }

    // Check if we're using an existing supply and validate quantity
    if (selectedSupply && newAgrochemical.lieuLuong > selectedSupply.soLuong) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: `Số lượng vượt quá tồn kho (${selectedSupply.soLuong} ${selectedSupply.donViTinh})`,
      })
      return
    }

    const newItem: Agrochemical = {
      id: Date.now().toString(),
      name: newAgrochemical.name || "",
      type: newAgrochemical.type as "thuốc" | "phân",
      isOrganic: newAgrochemical.isOrganic || false,
      lieuLuong: newAgrochemical.lieuLuong || 0,
      donViTinh: newAgrochemical.donViTinh || "kg",
      donGia: newAgrochemical.donGia || 0,
      farmingLogId: "",
      vattuId: newAgrochemical.vattuId,
    }

    setFormData((prev) => ({
      ...prev,
      agrochemicals: [...(prev.agrochemicals || []), newItem],
    }))

    // Reset form
    setNewAgrochemical({
      name: "",
      type: "thuốc",
      isOrganic: false,
      lieuLuong: 0,
      donViTinh: "kg",
      donGia: 0,
    })
    setSelectedSupply(null)
  }

  const removeAgrochemical = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      agrochemicals: prev.agrochemicals?.filter((item) => item.id !== id) || [],
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setImages((prev) => [...prev, ...newFiles])

      // Create preview URLs
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
      setPreviewImages((prev) => [...prev, ...newPreviews])
    }
  }

  const removeImage = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(previewImages[index])

    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviewImages((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async () => {
    if (images.length === 0) return []

    setUploadingImage(true)
    const uploadedImages = []

    try {
      for (const file of images) {
        // Create a FormData object
        const formData = new FormData()
        formData.append("image", file)

        // Upload to your image compression API
        const response = await axios.post("/api/compress-image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

        // Add the compressed image data to the array
        if (response.data && response.data.base64) {
          uploadedImages.push({
            src: response.data.base64,
            alt: file.name,
          })
        }
      }

      return uploadedImages
    } catch (error) {
      console.error("Error uploading images:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Lỗi khi tải lên hình ảnh",
      })
      return []
    } finally {
      setUploadingImage(false)
    }
  }

  const updateInventory = async (agrochemicals: Agrochemical[]) => {
    try {
      // Filter only items with vattuId (from inventory)
      const inventoryItems = agrochemicals.filter((item) => item.vattuId)

      // Update inventory for each item
      for (const item of inventoryItems) {
        await axios.patch("/api/vattu", {
          vattuId: item.vattuId,
          soLuongSuDung: item.lieuLuong,
        })
      }

      return true
    } catch (error) {
      console.error("Error updating inventory:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Lỗi khi cập nhật tồn kho",
      })
      return false
    }
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.muaVu || !formData.giaiDoan || !formData.congViec || !formData.ngayThucHien) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Upload images if any
      let imageData = formData.image || []

      if (images.length > 0) {
        const uploadedImages = await uploadImages()
        imageData = [...imageData, ...uploadedImages]
      }

      // Prepare final data
      const finalData: TimelineEntry = {
        ...(formData as TimelineEntry),
        image: imageData,
        uId: session?.user?.uId || "",
        xId: session?.user?.xId || "",
      }

      // Update inventory if needed
      if (finalData.agrochemicals && finalData.agrochemicals.length > 0) {
        const inventoryUpdated = await updateInventory(finalData.agrochemicals)
        if (!inventoryUpdated) {
          setIsSubmitting(false)
          return
        }
      }

      onSubmit(finalData)
      toast({
        title: "Thành công",
        description: entry ? "Cập nhật thành công" : "Thêm mới thành công",
      })
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Có lỗi xảy ra, vui lòng thử lại",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter tasks based on selected stage
  const filteredTasks = tasks.filter((task) => task.giaidoanId === selectedStageId)

  // Check if the current task is related to agrochemicals
  const isAgrochemicalTask = formData.congViec === "Bón phân" || formData.congViec === "Phun thuốc"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 max-h-[90vh] overflow-auto">
        <DialogHeader className="sticky top-0 z-10 bg-white px-6 py-4 border-b">
          <DialogTitle className="text-xl font-bold">
            {entry ? "Chỉnh sửa hoạt động" : "Thêm hoạt động mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Thông tin cơ bản</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Season */}
              <div className="space-y-2">
                <Label htmlFor="season">
                  Mùa vụ <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.muaVuId || ""} onValueChange={handleSeasonChange}>
                  <SelectTrigger id="season">
                    <SelectValue placeholder="Chọn mùa vụ" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((season) => (
                      <SelectItem key={season._id} value={season._id}>
                        {season.muavu} {season.nam}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">
                  Ngày thực hiện <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal" id="date">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && handleDateChange(date)}
                      initialFocus
                      locale={vi}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stage */}
              <div className="space-y-2">
                <Label htmlFor="stage">
                  Giai đoạn <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedStageId} onValueChange={handleStageChange}>
                  <SelectTrigger id="stage">
                    <SelectValue placeholder="Chọn giai đoạn" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage._id} value={stage._id}>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: stage.color }}></div>
                          {stage.tengiaidoan}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Task */}
              <div className="space-y-2">
                <Label htmlFor="task">
                  Công việc <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.congViecId || ""} onValueChange={handleTaskChange} disabled={!selectedStageId}>
                  <SelectTrigger id="task">
                    <SelectValue placeholder={selectedStageId ? "Chọn công việc" : "Vui lòng chọn giai đoạn trước"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTasks.map((task) => (
                      <SelectItem key={task._id} value={task._id}>
                        {task.tenCongViec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Days after start */}
            <div className="space-y-2">
              <Label htmlFor="ngaySauBatDau">Ngày sau bắt đầu</Label>
              <Input
                id="ngaySauBatDau"
                name="ngaySauBatDau"
                type="number"
                value={formData.ngaySauBatDau || ""}
                onChange={handleInputChange}
                placeholder="Số ngày sau khi bắt đầu mùa vụ"
                disabled={selectedSeason !== null}
              />
              {selectedSeason && (
                <p className="text-xs text-slate-500 mt-1">
                  Tự động tính từ ngày bắt đầu mùa vụ: {selectedSeason.ngaybatdau}
                </p>
              )}
            </div>

            {/* Work details */}
            <div className="space-y-2">
              <Label htmlFor="chiTietCongViec">Chi tiết công việc</Label>
              <Textarea
                id="chiTietCongViec"
                name="chiTietCongViec"
                value={formData.chiTietCongViec || ""}
                onChange={handleInputChange}
                placeholder="Mô tả chi tiết công việc"
                className="min-h-[80px]"
              />
            </div>
          </div>

          {/* Cost Information */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium">Chi phí</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Labor cost */}
              <div className="space-y-2">
                <Label htmlFor="chiPhiCong">Chi phí công</Label>
                <CurrencyInput
                  id="chiPhiCong"
                  name="chiPhiCong"
                  value={formData.chiPhiCong || 0}
                  onChange={handleCurrencyChange}
                  placeholder="Nhập chi phí công"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="soLuongCong">Số lượng công</Label>
                <Input
                  id="soLuongCong"
                  name="soLuongCong"
                  type="number"
                  value={formData.soLuongCong || ""}
                  onChange={handleInputChange}
                  placeholder="Số lượng"
                />
              </div>
            </div>

            {/* Material cost */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chiPhiVatTu">Chi phí vật tư</Label>
                <CurrencyInput
                  id="chiPhiVatTu"
                  name="chiPhiVatTu"
                  value={formData.chiPhiVatTu || 0}
                  onChange={handleCurrencyChange}
                  placeholder="Nhập chi phí vật tư"
                  disabled={isAgrochemicalTask && formData.agrochemicals && formData.agrochemicals.length > 0}
                />
                {isAgrochemicalTask && formData.agrochemicals && formData.agrochemicals.length > 0 && (
                  <p className="text-xs text-slate-500 mt-1">Tự động tính từ danh sách vật tư sử dụng</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="soLuongVatTu">Số lượng vật tư</Label>
                <Input
                  id="soLuongVatTu"
                  name="soLuongVatTu"
                  type="number"
                  value={formData.soLuongVatTu || ""}
                  onChange={handleInputChange}
                  placeholder="Số lượng"
                />
              </div>
            </div>
          </div>

          {/* Agrochemicals section */}
          {isAgrochemicalTask && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Thông tin vật tư sử dụng</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column: Available supplies */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Vật tư có sẵn</Label>
                    <div className="relative w-full max-w-[200px]">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Tìm vật tư..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="border rounded-md h-[200px] overflow-hidden">
                    {loadingSupplies ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                      </div>
                    ) : filteredSupplies.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                        <AlertCircle className="h-6 w-6 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500">
                          {searchTerm ? "Không tìm thấy vật tư" : "Không có vật tư nào trong kho"}
                        </p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[200px]">
                        <div className="p-2 space-y-2">
                          {filteredSupplies.map((supply) => (
                            <div
                              key={supply._id}
                              className={`p-2 rounded-md cursor-pointer transition-colors ${
                                selectedSupply?._id === supply._id
                                  ? "bg-lime-100 border border-lime-300"
                                  : "hover:bg-slate-50 border border-transparent"
                              }`}
                              onClick={() => selectSupply(supply)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-sm">{supply.ten}</p>
                                  <div className="flex items-center mt-1">
                                    <Badge
                                      variant={supply.loai === "thuốc" ? "destructive" : "secondary"}
                                      className={`text-xs ${supply.huuCo ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}`}
                                    >
                                      {supply.loai}
                                    </Badge>
                                    {supply.huuCo && (
                                      <span className="ml-1 text-xs text-green-600 flex items-center">
                                        <Leaf className="h-3 w-3 mr-0.5" />
                                        Hữu cơ
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">
                                    {supply.soLuong} {supply.donViTinh}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {new Intl.NumberFormat("vi-VN").format(supply.donGia)} đ
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </div>

                {/* Right column: Add agrochemical form */}
                <div className="space-y-3">
                  <Label>Thêm vật tư sử dụng</Label>

                  <div className="space-y-3 border rounded-md p-3">
                    {selectedSupply ? (
                      <>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{selectedSupply.ten}</p>
                            <p className="text-xs text-slate-500">
                              Tồn kho: {selectedSupply.soLuong} {selectedSupply.donViTinh}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSupply(null)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="lieuLuong" className="text-xs">
                              Liều lượng sử dụng
                            </Label>
                            <Input
                              id="lieuLuong"
                              name="lieuLuong"
                              type="number"
                              value={newAgrochemical.lieuLuong || ""}
                              onChange={handleAgrochemicalChange}
                              placeholder={`Tối đa ${selectedSupply.soLuong}`}
                              className="h-8"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="donViTinh" className="text-xs">
                              Đơn vị
                            </Label>
                            <Input
                              id="donViTinh"
                              value={selectedSupply.donViTinh}
                              disabled
                              className="h-8 bg-slate-50"
                            />
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={addAgrochemical}
                          className="w-full h-8 mt-2"
                          disabled={!newAgrochemical.lieuLuong || newAgrochemical.lieuLuong <= 0}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Thêm vào danh sách
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-center">
                        <p className="text-sm text-slate-500 mb-2">Chọn vật tư từ danh sách bên trái</p>
                        <p className="text-xs text-slate-400">hoặc</p>
                        <div className="mt-2 space-y-2 w-full">
                          <Input
                            name="name"
                            value={newAgrochemical.name || ""}
                            onChange={handleAgrochemicalChange}
                            placeholder="Nhập tên vật tư thủ công"
                            className="h-8"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              name="lieuLuong"
                              type="number"
                              value={newAgrochemical.lieuLuong || ""}
                              onChange={handleAgrochemicalChange}
                              placeholder="Liều lượng"
                              className="h-8"
                            />
                            <Select
                              value={newAgrochemical.donViTinh || "kg"}
                              onValueChange={(value) => setNewAgrochemical((prev) => ({ ...prev, donViTinh: value }))}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Đơn vị" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="g">g</SelectItem>
                                <SelectItem value="lít">lít</SelectItem>
                                <SelectItem value="ml">ml</SelectItem>
                                <SelectItem value="chai">chai</SelectItem>
                                <SelectItem value="gói">gói</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            type="button"
                            onClick={addAgrochemical}
                            className="w-full h-8"
                            disabled={!newAgrochemical.name || !newAgrochemical.lieuLuong}
                            variant="outline"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm thủ công
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Agrochemical list */}
              {formData.agrochemicals && formData.agrochemicals.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h4 className="font-medium text-sm">Danh sách vật tư sử dụng:</h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {formData.agrochemicals.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-slate-500">
                            {item.lieuLuong} {item.donViTinh} - {item.type}
                            {item.isOrganic && " (Hữu cơ)"}
                            {item.donGia && ` - ${item.donGia.toLocaleString()} VND/${item.donViTinh}`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAgrochemical(item.id || "")}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="ghiChu">Ghi chú</Label>
            <Textarea
              id="ghiChu"
              name="ghiChu"
              value={formData.ghiChu || ""}
              onChange={handleInputChange}
              placeholder="Ghi chú thêm"
            />
          </div>

          {/* Images */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium">Hình ảnh</h3>

            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              <label htmlFor="images" className="flex flex-col items-center justify-center cursor-pointer">
                <Camera className="h-10 w-10 text-slate-400 mb-2" />
                <span className="text-sm text-slate-500">Nhấp để chọn hoặc kéo thả hình ảnh vào đây</span>
                <span className="text-xs text-slate-400 mt-1">Hỗ trợ JPG, PNG, GIF (tối đa 5MB)</span>
              </label>
            </div>

            {/* Image previews */}
            {previewImages.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-slate-200"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 p-6 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-lime-600 hover:bg-lime-700 text-white">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : entry ? (
              "Cập nhật"
            ) : (
              "Thêm mới"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EnhancedAddEditModal


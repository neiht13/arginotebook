"use client"
import type React from "react"
import { useState, useEffect } from "react"
import type { TimelineEntry, Agrochemical } from "../types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addDays } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, X, Camera, Trash2, Plus, Loader2, AlertCircle, Search, Leaf, Info, WifiOff } from "lucide-react"
import CurrencyInput from "@/components/ui/input-currency"
import axios from "axios"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useNetworkStore } from "@/lib/network-status"
import { useReferenceDataStore } from "@/lib/stores/reference-data-store"

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [formData, setFormData] = useState<Partial<TimelineEntry>>({
    muaVu: "",
    muaVuId: "",
    giaiDoan: "",
    giaiDoanId: "",
    congViec: "",
    congViecId: "",
    ngayThucHien: format(new Date(), "dd-MM-yyyy"),
    ngaySauBatDau: 0,
    chiPhiCong: 0,
    chiPhiVatTu: 0,
    soLuongCong: 0,
    soLuongVatTu: 0,
    chiTietCongViec: "",
    ghiChu: "",
    agrochemicals: [],
    image: [],
  })
  const [selectedStageId, setSelectedStageId] = useState("")
  const [selectedSeason, setSelectedSeason] = useState<any | null>(null)
  const [newAgrochemical, setNewAgrochemical] = useState<Partial<Agrochemical>>({
    name: "",
    type: "thuốc",
    isOrganic: false,
    lieuLuong: 0,
    donViTinh: "kg",
    donGia: 0,
  })
  const [images, setImages] = useState<File[]>([]) // Ảnh mới (File)
  const [previewImages, setPreviewImages] = useState<string[]>([]) // URL preview (cũ + mới)
  const [existingImages, setExistingImages] = useState<{ src: string; alt: string }[]>([]) // Ảnh cũ từ entry
  const [uploadingImage, setUploadingImage] = useState(false)
  const [filteredTasks, setFilteredTasks] = useState<any[]>([])
  const isOnline = useNetworkStore((state) => state.isOnline)

  const [availableSupplies, setAvailableSupplies] = useState<any[]>([])
  const [filteredSupplies, setFilteredSupplies] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loadingSupplies, setLoadingSupplies] = useState(false)
  const [selectedSupply, setSelectedSupply] = useState<any | null>(null)

  const {
    seasons,
    stages,
    tasks,
    isLoadingSeasons,
    isLoadingStages,
    isLoadingTasks,
    fetchSeasons,
    fetchStages,
    fetchTasks,
    getFilteredTasks,
    getStageById,
    getSeasonById,
  } = useReferenceDataStore()

  // Initialize form data and images when modal opens or entry changes
  useEffect(() => {
    if (!isOpen) return
    if (entry) {
      const dateObj = entry.ngayThucHien ? parseVietnameseDate(entry.ngayThucHien) : new Date()
      const stageObj = stages.find((s) => s.tengiaidoan === entry.giaiDoan)
      const seasonObj = getSeasonById(entry.muaVuId)
      setSelectedDate(dateObj)
      setSelectedStageId(stageObj?._id || "")
      setSelectedSeason(seasonObj || null)
      setFormData({
        ...entry,
        ngayThucHien: format(dateObj, "dd-MM-yyyy"),
        giaiDoanId: stageObj?._id || "",
      })
      // Đồng bộ ảnh cũ từ entry
      const existing = entry.image?.map((img) => ({ src: img.src, alt: img.alt })) || []
      setExistingImages(existing)
      setPreviewImages(existing.map((img) => img.src))
      setImages([]) // Reset ảnh mới
    } else {
      resetForm()
    }
  }, [entry, isOpen, stages, getSeasonById])

  // Fetch reference data and supplies when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSupplies()
      if (seasons.length === 0) fetchSeasons()
      if (stages.length === 0) fetchStages()
      if (tasks.length === 0) fetchTasks()
    }
  }, [isOpen, fetchSeasons, fetchStages, fetchTasks, seasons.length, stages.length, tasks.length])

  // Filter tasks based on selected stage
  useEffect(() => {
    if (selectedStageId) {
      setFilteredTasks(getFilteredTasks(selectedStageId))
    } else {
      setFilteredTasks([])
    }
  }, [selectedStageId, getFilteredTasks])

  // Filter supplies based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = availableSupplies.filter((supply) => supply.ten.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredSupplies(filtered)
    } else {
      setFilteredSupplies(availableSupplies)
    }
  }, [searchTerm, availableSupplies])

  // Calculate material cost based on agrochemicals
  useEffect(() => {
    if (!formData.agrochemicals || formData.agrochemicals.length === 0) return
    const totalCost = formData.agrochemicals.reduce((sum, item) => {
      return sum + (item.donGia || 0) * (item.lieuLuong || 0)
    }, 0)
    setFormData((prev) => ({ ...prev, chiPhiVatTu: totalCost }))
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
      if (!isOnline) {
        toast({
          title: "Chế độ ngoại tuyến",
          description: "Không thể tải danh sách vật tư khi ngoại tuyến",
          variant: "warning",
        })
        setAvailableSupplies([])
        setFilteredSupplies([])
        return
      }
      const response = await axios.get("/api/vattu")
      const availableItems = response.data.filter((item: any) => item.soLuong > 0)
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

  const resetForm = () => {
    setFormData({
      muaVu: "",
      muaVuId: "",
      giaiDoan: "",
      giaiDoanId: "",
      congViec: "",
      congViecId: "",
      ngayThucHien: format(new Date(), "dd-MM-yyyy"),
      ngaySauBatDau: 0,
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
    setSelectedSeason(null)
    setImages([])
    setPreviewImages([])
    setExistingImages([])
    setSelectedSupply(null)
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
    if (!selectedSeason) {
      setSelectedDate(date)
      setFormData((prev) => ({
        ...prev,
        ngayThucHien: format(date, "dd-MM-yyyy"),
        ngaySauBatDau: 0,
      }))
      return
    }
    const seasonStartDate = parseVietnameseDate(selectedSeason.ngaybatdau)
    const daysDiff = Math.floor((date.getTime() - seasonStartDate.getTime()) / (1000 * 60 * 60 * 24))
    setSelectedDate(date)
    setFormData((prev) => ({
      ...prev,
      ngayThucHien: format(date, "dd-MM-yyyy"),
      ngaySauBatDau: daysDiff >= 0 ? daysDiff : 0,
    }))
  }

  const handleStageChange = (stageId: string) => {
    if (stageId === selectedStageId) return
    setSelectedStageId(stageId)
    const stage = getStageById(stageId)
    if (stage) {
      setFormData((prev) => ({
        ...prev,
        giaiDoan: stage.tengiaidoan,
        giaiDoanId: stageId,
        congViec: "",
        congViecId: "",
      }))
    }
  }

  const handleTaskChange = (taskId: string) => {
    if (taskId === formData.congViecId) return
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
    if (seasonId === formData.muaVuId) return
    const season = getSeasonById(seasonId)
    if (season) {
      setSelectedSeason(season)
      const seasonStartDate = parseVietnameseDate(season.ngaybatdau)
      const daysDiff = Math.floor((selectedDate.getTime() - seasonStartDate.getTime()) / (1000 * 60 * 60 * 24))
      setFormData((prev) => ({
        ...prev,
        muaVu: season.tenmuavu,
        muaVuId: seasonId,
        ngaySauBatDau: daysDiff >= 0 ? daysDiff : 0,
      }))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value) || 0) : value,
    }))
  }

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 0
    if (e.target.name === "ngaySauBatDau" && selectedSeason) {
      const seasonStartDate = parseVietnameseDate(selectedSeason.ngaybatdau)
      const newDate = addDays(seasonStartDate, value)
      setSelectedDate(newDate)
      setFormData((prev) => ({
        ...prev,
        ngaySauBatDau: value,
        ngayThucHien: format(newDate, "dd-MM-yyyy"),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: value,
      }))
    }
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
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
      setPreviewImages((prev) => [...prev, ...newPreviews])
    }
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewImages[index])
    if (index < existingImages.length) {
      // Xóa ảnh cũ
      setExistingImages((prev) => prev.filter((_, i) => i !== index))
    } else {
      // Xóa ảnh mới
      const newImageIndex = index - existingImages.length
      setImages((prev) => prev.filter((_, i) => i !== newImageIndex))
    }
    setPreviewImages((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async () => {
    if (images.length === 0) return []
    setUploadingImage(true)
    const uploadedImages = []
    try {
      for (const file of images) {
        const formData = new FormData()
        formData.append("image", file)
        const response = await axios.post("/api/compress-image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
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
      const inventoryItems = agrochemicals.filter((item) => item.vattuId)
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
      let finalImages = [...existingImages] // Bắt đầu với ảnh cũ
      if (images.length > 0) {
        if (isOnline) {
          const uploadedImages = await uploadImages()
          finalImages = [...finalImages, ...uploadedImages]
        } else {
          toast({
            variant: "warning",
            title: "Chế độ ngoại tuyến",
            description: "Không thể tải lên hình ảnh khi ngoại tuyến. Hình ảnh sẽ được tải lên khi có kết nối.",
          })
          const offlineImages = images.map((file, index) => ({
            src: URL.createObjectURL(file),
            alt: `Offline image ${index + 1}`,
            _pendingUpload: true,
          }))
          finalImages = [...finalImages, ...offlineImages]
        }
      }

      const finalData: TimelineEntry = {
        ...(formData as TimelineEntry),
        image: finalImages,
        uId: session?.user?.uId || "",
        xId: session?.user?.xId || "",
      }

      if (isOnline && finalData.agrochemicals && finalData.agrochemicals.length > 0) {
        const inventoryUpdated = await updateInventory(finalData.agrochemicals)
        if (!inventoryUpdated) {
          setIsSubmitting(false)
          return
        }
      }

      // Gửi dữ liệu lên server qua onSubmit
      onSubmit(finalData)

      toast({
        title: "Thành công",
        description: entry
          ? isOnline
            ? "Cập nhật thành công"
            : "Đã lưu thay đổi (chế độ ngoại tuyến)"
          : isOnline
            ? "Thêm mới thành công"
            : "Đã lưu mới (chế độ ngoại tuyến)",
      })

      // Reset form sau khi submit thành công
      resetForm()
      onClose()
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

  const isAgrochemicalTask = formData.congViec === "Bón phân" || formData.congViec === "Phun thuốc"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 max-h-[90vh] overflow-auto">
        <DialogHeader className="sticky top-0 z-10 bg-white px-6 py-4 border-b">
          <DialogTitle className="text-xl font-bold">
            {entry ? "Chỉnh sửa hoạt động" : "Thêm hoạt động mới"}
          </DialogTitle>
        </DialogHeader>
        {!isOnline && (
          <div className="px-6 py-2 bg-amber-50 border-b border-amber-100 flex items-center">
            <WifiOff className="h-4 w-4 text-amber-600 mr-2" />
            <p className="text-sm text-amber-800">
              Bạn đang ở chế độ ngoại tuyến. Dữ liệu sẽ được lưu cục bộ và đồng bộ khi có kết nối.
            </p>
          </div>
        )}
        <div className="px-6 py-4 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="season">
                  Mùa vụ <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.muaVuId || ""} onValueChange={handleSeasonChange}>
                  <SelectTrigger id="season">
                    <SelectValue placeholder="Chọn mùa vụ" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingSeasons ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Đang tải...</span>
                      </div>
                    ) : seasons.length === 0 ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">Không có mùa vụ nào</div>
                    ) : (
                      seasons.map((season) => (
                        <SelectItem key={season._id} value={season._id}>
                          {season.tenmuavu} {season.nam}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="stage">
                  Giai đoạn <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedStageId} onValueChange={handleStageChange}>
                  <SelectTrigger id="stage">
                    <SelectValue placeholder="Chọn giai đoạn" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingStages ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Đang tải...</span>
                      </div>
                    ) : stages.length === 0 ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">Không có giai đoạn nào</div>
                    ) : (
                      stages.map((stage) => (
                        <SelectItem key={stage._id} value={stage._id}>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: stage.color }}></div>
                            {stage.tengiaidoan}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task">
                  Công việc <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.congViecId || ""} onValueChange={handleTaskChange} disabled={!selectedStageId}>
                  <SelectTrigger id="task">
                    <SelectValue placeholder={selectedStageId ? "Chọn công việc" : "Vui lòng chọn giai đoạn trước"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingTasks ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Đang tải...</span>
                      </div>
                    ) : filteredTasks.length === 0 ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        Không có công việc nào cho giai đoạn này
                      </div>
                    ) : (
                      filteredTasks.map((task) => (
                        <SelectItem key={task._id} value={task._id}>
                          {task.tenCongViec}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="ngaySauBatDau">Ngày sau bắt đầu</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                        <Info className="h-4 w-4 text-slate-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Số ngày tính từ ngày bắt đầu mùa vụ. Thay đổi giá trị này sẽ tự động cập nhật ngày thực hiện.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="ngaySauBatDau"
                name="ngaySauBatDau"
                type="number"
                value={formData.ngaySauBatDau || "0"}
                onChange={handleNumberInputChange}
                placeholder="Số ngày sau khi bắt đầu mùa vụ"
                disabled={!selectedSeason}
              />
              {selectedSeason && (
                <p className="text-xs text-slate-500 mt-1">
                  Tự động tính từ ngày bắt đầu mùa vụ: {selectedSeason.ngaybatdau}
                </p>
              )}
            </div>
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
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium">Chi phí</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  value={formData.soLuongCong === "" ? "" : formData.soLuongCong || 0} // Đảm bảo hiển thị rỗng nếu cần
  onChange={handleInputChange}
  placeholder="Số lượng"
/>
              </div>
            </div>
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
  value={formData.soLuongVatTu === "" ? "" : formData.soLuongVatTu || 0} // Đảm bảo hiển thị rỗng nếu cần
  onChange={handleInputChange}
  placeholder="Số lượng"
/>
              </div>
            </div>
          </div>
          {isAgrochemicalTask && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Thông tin vật tư sử dụng</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
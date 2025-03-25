"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, Loader2, Info, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import CurrencyInput from "@/components/ui/input-currency"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import type { VatTu, VatTuFormData } from "../types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { useMediaQuery } from "../use-media-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface VatTuModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: VatTu) => void
  vatTu: VatTu | null
}

export default function VatTuModal({ isOpen, onClose, onSave, vatTu }: VatTuModalProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [formData, setFormData] = useState<VatTuFormData>({
    ten: "",
    loai: "thuốc",
    huuCo: false,
    soLuong: 0,
    donViTinh: "kg",
    donGia: 0,
    nhaCungCap: "",
    ngayMua: "",
    hanSuDung: "",
    ghiChu: "",
    lichSuSuDung: [],
    viTriLuuTru: "",
    thanhPhan: "",
    huongDanSuDung: "",
  })
  const [ngayMuaDate, setNgayMuaDate] = useState<Date | undefined>(undefined)
  const [hanSuDungDate, setHanSuDungDate] = useState<Date | undefined>(undefined)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (vatTu) {
      setFormData({
        _id: vatTu._id,
        ten: vatTu.ten || "",
        loai: vatTu.loai || "thuốc",
        huuCo: vatTu.huuCo || false,
        soLuong: vatTu.soLuong || 0,
        donViTinh: vatTu.donViTinh || "kg",
        donGia: vatTu.donGia || 0,
        nhaCungCap: vatTu.nhaCungCap || "",
        ngayMua: vatTu.ngayMua || "",
        hanSuDung: vatTu.hanSuDung || "",
        ghiChu: vatTu.ghiChu || "",
        lichSuSuDung: vatTu.lichSuSuDung || [],
        viTriLuuTru: vatTu.viTriLuuTru || "",
        thanhPhan: vatTu.thanhPhan || "",
        huongDanSuDung: vatTu.huongDanSuDung || "",
      })
      setNgayMuaDate(vatTu.ngayMua ? new Date(vatTu.ngayMua) : undefined)
      setHanSuDungDate(vatTu.hanSuDung ? new Date(vatTu.hanSuDung) : undefined)
    } else {
      resetForm()
    }
  }, [vatTu, isOpen])

  const resetForm = useCallback(() => {
    setFormData({
      ten: "",
      loai: "thuốc",
      huuCo: false,
      soLuong: 0,
      donViTinh: "kg",
      donGia: 0,
      nhaCungCap: "",
      ngayMua: "",
      hanSuDung: "",
      ghiChu: "",
      lichSuSuDung: [],
      viTriLuuTru: "",
      thanhPhan: "",
      huongDanSuDung: "",
    })
    setNgayMuaDate(undefined)
    setHanSuDungDate(undefined)
    setFormErrors({})
    setActiveTab("basic")
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : type === "number" ? Number(value) : value,
      }))

      // Clear error when field is edited
      if (formErrors[name]) {
        setFormErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[name]
          return newErrors
        })
      }
    },
    [formErrors],
  )

  const handleCurrencyChange = useCallback(
    (data: { name: string; value: number }) => {
      setFormData((prev) => ({ ...prev, [data.name]: data.value }))

      // Clear error when field is edited
      if (formErrors[data.name]) {
        setFormErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[data.name]
          return newErrors
        })
      }
    },
    [formErrors],
  )

  const handleNgayMuaChange = useCallback(
    (date: Date | undefined) => {
      setNgayMuaDate(date)
      setFormData((prev) => ({ ...prev, ngayMua: date ? date.toISOString() : "" }))

      // Clear error when field is edited
      if (formErrors.ngayMua) {
        setFormErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.ngayMua
          return newErrors
        })
      }
    },
    [formErrors],
  )

  const handleHanSuDungChange = useCallback(
    (date: Date | undefined) => {
      setHanSuDungDate(date)
      setFormData((prev) => ({ ...prev, hanSuDung: date ? date.toISOString() : "" }))

      // Clear error when field is edited
      if (formErrors.hanSuDung) {
        setFormErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.hanSuDung
          return newErrors
        })
      }
    },
    [formErrors],
  )

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.ten.trim()) {
      errors.ten = "Tên vật tư không được để trống"
    }

    if (formData.soLuong < 0) {
      errors.soLuong = "Số lượng không được âm"
    }

    if (formData.donGia < 0) {
      errors.donGia = "Đơn giá không được âm"
    }

    if (formData.ngayMua && formData.hanSuDung && new Date(formData.ngayMua) > new Date(formData.hanSuDung)) {
      errors.hanSuDung = "Hạn sử dụng phải sau ngày mua"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      // Show first tab with error
      if (formErrors.ten || formErrors.soLuong || formErrors.donGia) {
        setActiveTab("basic")
      } else if (formErrors.hanSuDung) {
        setActiveTab("additional")
      }

      toast({
        variant: "destructive",
        description: "Vui lòng kiểm tra lại thông tin nhập vào",
        title: "Lỗi",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const finalData: VatTu = {
        ...formData,
        uId: session?.user?.uId || "",
        xId: session?.user?.xId || "",
      }
      onSave(finalData)
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({ variant: "destructive", description: "Không thể lưu vật tư" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  }

  const ModalContent = (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="basic" className="data-[state=active]:bg-lime-50 data-[state=active]:text-lime-800">
            Thông tin cơ bản
          </TabsTrigger>
          <TabsTrigger value="additional" className="data-[state=active]:bg-lime-50 data-[state=active]:text-lime-800">
            Thông tin bổ sung
          </TabsTrigger>
          <TabsTrigger value="advanced" className="data-[state=active]:bg-lime-50 data-[state=active]:text-lime-800">
            Nâng cao
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <motion.div className="space-y-4" variants={formVariants} initial="hidden" animate="visible">
            <motion.div className="space-y-2" variants={itemVariants}>
              <div className="flex items-center justify-between">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="ten" className="flex items-center">
                        Tên vật tư <span className="text-red-500 ml-1">*</span>
                        <Info className="h-3.5 w-3.5 ml-1 text-slate-400" />
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent>Tên đầy đủ của vật tư</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {formErrors.ten && (
                  <span className="text-xs text-red-500 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {formErrors.ten}
                  </span>
                )}
              </div>
              <Input
                id="ten"
                name="ten"
                value={formData.ten}
                onChange={handleInputChange}
                placeholder="Nhập tên vật tư"
                className={`border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500 ${formErrors.ten ? "border-red-300" : ""}`}
              />
            </motion.div>

            <motion.div className="grid grid-cols-2 gap-4" variants={itemVariants}>
              <div className="space-y-2">
                <Label htmlFor="loai">
                  Loại <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.loai}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, loai: value as "thuốc" | "phân" | "khác" }))
                  }
                >
                  <SelectTrigger
                    id="loai"
                    className="border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500"
                  >
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thuốc">Thuốc</SelectItem>
                    <SelectItem value="phân">Phân bón</SelectItem>
                    <SelectItem value="khác">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="donViTinh">
                  Đơn vị tính <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.donViTinh}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, donViTinh: value }))}
                >
                  <SelectTrigger
                    id="donViTinh"
                    className="border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500"
                  >
                    <SelectValue placeholder="Chọn đơn vị" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="lít">lít</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="chai">chai</SelectItem>
                    <SelectItem value="gói">gói</SelectItem>
                    <SelectItem value="bao">bao</SelectItem>
                    <SelectItem value="thùng">thùng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            <motion.div className="grid grid-cols-2 gap-4" variants={itemVariants}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="soLuong">
                    Số lượng <span className="text-red-500">*</span>
                  </Label>
                  {formErrors.soLuong && (
                    <span className="text-xs text-red-500 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {formErrors.soLuong}
                    </span>
                  )}
                </div>
                <Input
                  id="soLuong"
                  name="soLuong"
                  type="number"
                  value={formData.soLuong}
                  onChange={handleInputChange}
                  placeholder="Nhập số lượng"
                  className={`border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500 ${formErrors.soLuong ? "border-red-300" : ""}`}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="donGia">
                    Đơn giá <span className="text-red-500">*</span>
                  </Label>
                  {formErrors.donGia && (
                    <span className="text-xs text-red-500 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {formErrors.donGia}
                    </span>
                  )}
                </div>
                <CurrencyInput
                  id="donGia"
                  name="donGia"
                  value={formData.donGia}
                  onChange={handleCurrencyChange}
                  placeholder="Nhập đơn giá"
                  className={`border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500 ${formErrors.donGia ? "border-red-300" : ""}`}
                />
              </div>
            </motion.div>

            <motion.div className="flex items-center gap-2" variants={itemVariants}>
              <input
                type="checkbox"
                id="huuCo"
                name="huuCo"
                checked={formData.huuCo}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-lime-300 text-lime-700 focus:ring-lime-500"
              />
              <Label htmlFor="huuCo" className="text-sm font-medium text-slate-700">
                Hữu cơ
              </Label>
            </motion.div>
          </motion.div>
        </TabsContent>

        <TabsContent value="additional">
          <motion.div className="space-y-4" variants={formVariants} initial="hidden" animate="visible">
            <motion.div className="space-y-2" variants={itemVariants}>
              <Label htmlFor="nhaCungCap">Nhà cung cấp</Label>
              <Input
                id="nhaCungCap"
                name="nhaCungCap"
                value={formData.nhaCungCap}
                onChange={handleInputChange}
                placeholder="Nhập tên nhà cung cấp"
                className="border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500"
              />
            </motion.div>

            <motion.div className="grid grid-cols-2 gap-4" variants={itemVariants}>
              <div className="space-y-2">
                <Label htmlFor="ngayMua">Ngày mua</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-lime-200 hover:bg-lime-50 focus-visible:ring-lime-500"
                      id="ngayMua"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-lime-700" />
                      {ngayMuaDate ? format(ngayMuaDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={ngayMuaDate}
                      onSelect={handleNgayMuaChange}
                      initialFocus
                      locale={vi}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="hanSuDung">Hạn sử dụng</Label>
                  {formErrors.hanSuDung && (
                    <span className="text-xs text-red-500 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {formErrors.hanSuDung}
                    </span>
                  )}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal border-lime-200 hover:bg-lime-50 focus-visible:ring-lime-500 ${formErrors.hanSuDung ? "border-red-300" : ""}`}
                      id="hanSuDung"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-lime-700" />
                      {hanSuDungDate ? format(hanSuDungDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={hanSuDungDate}
                      onSelect={handleHanSuDungChange}
                      initialFocus
                      locale={vi}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <Label htmlFor="viTriLuuTru">Vị trí lưu trữ</Label>
              <Input
                id="viTriLuuTru"
                name="viTriLuuTru"
                value={formData.viTriLuuTru}
                onChange={handleInputChange}
                placeholder="Nhập vị trí lưu trữ"
                className="border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500"
              />
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <Label htmlFor="ghiChu">Ghi chú</Label>
              <Textarea
                id="ghiChu"
                name="ghiChu"
                value={formData.ghiChu}
                onChange={handleInputChange}
                placeholder="Nhập ghi chú"
                className="border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500 min-h-[80px]"
              />
            </motion.div>
          </motion.div>
        </TabsContent>

        <TabsContent value="advanced">
          <motion.div className="space-y-4" variants={formVariants} initial="hidden" animate="visible">
            <motion.div className="space-y-2" variants={itemVariants}>
              <Label htmlFor="thanhPhan">Thành phần</Label>
              <Textarea
                id="thanhPhan"
                name="thanhPhan"
                value={formData.thanhPhan}
                onChange={handleInputChange}
                placeholder="Nhập thành phần của vật tư"
                className="border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500 min-h-[80px]"
              />
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <Label htmlFor="huongDanSuDung">Hướng dẫn sử dụng</Label>
              <Textarea
                id="huongDanSuDung"
                name="huongDanSuDung"
                value={formData.huongDanSuDung}
                onChange={handleInputChange}
                placeholder="Nhập hướng dẫn sử dụng"
                className="border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500 min-h-[80px]"
              />
            </motion.div>
          </motion.div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-6 border-t mt-6">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="border-lime-200">
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-lime-500 hover:bg-lime-600 text-white">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : vatTu ? (
            "Cập nhật"
          ) : (
            "Thêm mới"
          )}
        </Button>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="px-4 pb-6 pt-4 max-h-[90vh]">
          <DrawerHeader className="px-0 pb-4">
            <DrawerTitle className="text-xl font-bold text-slate-800">
              {vatTu ? "Chỉnh sửa vật tư" : "Thêm vật tư mới"}
            </DrawerTitle>
            <DrawerDescription className="text-slate-500">Điền thông tin vật tư bên dưới</DrawerDescription>
          </DrawerHeader>
          {ModalContent}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-6 max-h-[90vh] overflow-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold text-slate-800">
            {vatTu ? "Chỉnh sửa vật tư" : "Thêm vật tư mới"}
          </DialogTitle>
        </DialogHeader>

        {ModalContent}
      </DialogContent>
    </Dialog>
  )
}


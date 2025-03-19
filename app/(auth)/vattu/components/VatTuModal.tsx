"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { CalendarIcon, Loader2 } from "lucide-react"
import CurrencyInput from "@/components/ui/input-currency"
import type { VatTu, VatTuFormData } from "../types"

interface VatTuModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: VatTu) => void
  vatTu: VatTu | null
}

export default function VatTuModal({ isOpen, onClose, onSave, vatTu }: VatTuModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
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
  })

  const [ngayMuaDate, setNgayMuaDate] = useState<Date | undefined>(undefined)
  const [hanSuDungDate, setHanSuDungDate] = useState<Date | undefined>(undefined)

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
      })

      // Parse dates if they exist
      if (vatTu.ngayMua) {
        try {
          setNgayMuaDate(new Date(vatTu.ngayMua))
        } catch (error) {
          console.error("Error parsing ngayMua:", error)
        }
      }

      if (vatTu.hanSuDung) {
        try {
          setHanSuDungDate(new Date(vatTu.hanSuDung))
        } catch (error) {
          console.error("Error parsing hanSuDung:", error)
        }
      }
    } else {
      resetForm()
    }
  }, [vatTu, isOpen])

  const resetForm = () => {
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
    })
    setNgayMuaDate(undefined)
    setHanSuDungDate(undefined)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }))
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: Number(value),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
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

  const handleNgayMuaChange = (date: Date | undefined) => {
    setNgayMuaDate(date)
    if (date) {
      setFormData((prev) => ({
        ...prev,
        ngayMua: date.toISOString(),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        ngayMua: "",
      }))
    }
  }

  const handleHanSuDungChange = (date: Date | undefined) => {
    setHanSuDungDate(date)
    if (date) {
      setFormData((prev) => ({
        ...prev,
        hanSuDung: date.toISOString(),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        hanSuDung: "",
      }))
    }
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.ten || formData.soLuong === undefined || formData.donGia === undefined) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare data for API
      const finalData: VatTu = {
        ...formData,
        uId: "", // Will be set by the API
      }

      onSave(finalData)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 max-h-[90vh] overflow-auto">
        <DialogHeader className="sticky top-0 z-10 bg-white px-6 py-4 border-b">
          <DialogTitle className="text-xl font-bold">{vatTu ? "Chỉnh sửa vật tư" : "Thêm vật tư mới"}</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ten">
                Tên vật tư <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ten"
                name="ten"
                value={formData.ten}
                onChange={handleInputChange}
                placeholder="Nhập tên vật tư"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  <SelectTrigger id="loai">
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
                  <SelectTrigger id="donViTinh">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="soLuong">
                  Số lượng <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="soLuong"
                  name="soLuong"
                  type="number"
                  value={formData.soLuong}
                  onChange={handleInputChange}
                  placeholder="Nhập số lượng"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="donGia">
                  Đơn giá <span className="text-red-500">*</span>
                </Label>
                <CurrencyInput
                  id="donGia"
                  name="donGia"
                  value={formData.donGia}
                  onChange={handleCurrencyChange}
                  placeholder="Nhập đơn giá"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="huuCo"
                name="huuCo"
                checked={formData.huuCo}
                onChange={(e) => setFormData((prev) => ({ ...prev, huuCo: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
              />
              <Label htmlFor="huuCo" className="text-sm font-medium text-gray-700">
                Hữu cơ
              </Label>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="nhaCungCap">Nhà cung cấp</Label>
              <Input
                id="nhaCungCap"
                name="nhaCungCap"
                value={formData.nhaCungCap}
                onChange={handleInputChange}
                placeholder="Nhập tên nhà cung cấp"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ngayMua">Ngày mua</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal" id="ngayMua">
                      <CalendarIcon className="mr-2 h-4 w-4" />
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
                <Label htmlFor="hanSuDung">Hạn sử dụng</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal" id="hanSuDung">
                      <CalendarIcon className="mr-2 h-4 w-4" />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="ghiChu">Ghi chú</Label>
              <Textarea
                id="ghiChu"
                name="ghiChu"
                value={formData.ghiChu}
                onChange={handleInputChange}
                placeholder="Nhập ghi chú"
                className="min-h-[100px]"
              />
            </div>
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
            ) : vatTu ? (
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


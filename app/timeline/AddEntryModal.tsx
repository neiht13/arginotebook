// AddEditEntryModal.jsx
"use client"

import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TimelineEntry, Agrochemical } from "./types"
import { PlusCircle, Edit, PlusCircleIcon } from "lucide-react"
import { toast } from "react-toastify"

interface AddEditEntryModalProps {
  onAddEntry: (entry: TimelineEntry) => void
  onEditEntry?: (entry: TimelineEntry) => void
}

export interface AddEditEntryModalHandle {
  open: (entry?: TimelineEntry) => void
  close: () => void
}

const AddEditEntryModal = forwardRef<AddEditEntryModalHandle, AddEditEntryModalProps>(
  ({ onAddEntry, onEditEntry }, ref) => {
    const [open, setOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [currentEntry, setCurrentEntry] = useState<Partial<TimelineEntry>>({
      agrochemicals: [],
    })
    const [agrochemical, setAgrochemical] = useState<Partial<Agrochemical>>({})

    useImperativeHandle(ref, () => ({
      open: (entry?: TimelineEntry) => {
        if (entry) {
          setIsEditMode(true)
          setCurrentEntry(entry)
        } else {
          setIsEditMode(false)
          setCurrentEntry({ agrochemicals: [] })
        }
        setOpen(true)
      },
      close: () => setOpen(false),
    }))

    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target
      setCurrentEntry((prev) => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
      setCurrentEntry((prev) => ({ ...prev, [name]: value }))
    }

    const handleAgrochemicalChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target
      setAgrochemical((prev) => ({ ...prev, [name]: value }))
    }

    const addAgrochemical = () => {
      if (agrochemical.name && agrochemical.type && agrochemical.lieuLuong && agrochemical.donViTinh) {
        setCurrentEntry((prev) => ({
          ...prev,
          agrochemicals: [
            ...(prev.agrochemicals || []),
            { ...agrochemical, id: Date.now().toString() } as Agrochemical,
          ],
        }))
        setAgrochemical({})
      } else {
        toast.error("Vui lòng điền đầy đủ thông tin vật tư.")
      }
    }

    const handleSubmit = () => {
      // Các trường bắt buộc
      if (currentEntry.congViec && currentEntry.giaiDoan && currentEntry.ngayThucHien) {
        if (isEditMode && onEditEntry) {
          onEditEntry(currentEntry as TimelineEntry)
          toast.success("Chỉnh sửa công việc thành công!")
        } else {
          onAddEntry(currentEntry as TimelineEntry)
          toast.success("Thêm mới công việc thành công!")
        }
        setCurrentEntry({ agrochemicals: [] })
        setOpen(false)
      } else {
        toast.error("Vui lòng điền đầy đủ các trường bắt buộc.")
      }
    }

    useEffect(() => {
      if (!open) {
        setCurrentEntry({ agrochemicals: [] })
        setAgrochemical({})
        setIsEditMode(false)
      }
    }, [open])

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <Button className="w-full bg-gradient-to-r from-green-500 to-green-800  text-white"><PlusCircleIcon/> Thêm mới</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-lg shadow-lg border-0">
          {/* Header */}
          <DialogHeader className="bg-gradient-to-r from-green-500 to-green-800 px-4 py-3">
            <DialogTitle className="text-white text-lg font-bold">
              {isEditMode ? "Chỉnh sửa công việc" : "Thêm mới công việc"}
            </DialogTitle>
          </DialogHeader>

          {/* Body */}
          <div className="px-6 py-4 space-y-4 bg-white">
            {/* Trường Công việc */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="congViec" className="text-right text-sm font-medium">
                Công việc
              </Label>
              <Input
                id="congViec"
                name="congViec"
                placeholder="VD: Cấy dặm, Phun thuốc..."
                value={currentEntry.congViec || ""}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>

            {/* Trường Giai đoạn */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="giaiDoan" className="text-right text-sm font-medium">
                Giai đoạn
              </Label>
              <Input
                id="giaiDoan"
                name="giaiDoan"
                placeholder="VD: Lúa mạ, Đẻ nhánh..."
                value={currentEntry.giaiDoan || ""}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>

            {/* Trường Ngày thực hiện */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="ngayThucHien"
                className="text-right text-sm font-medium"
              >
                Ngày thực hiện
              </Label>
              <Input
                id="ngayThucHien"
                name="ngayThucHien"
                type="date"
                value={currentEntry.ngayThucHien || ""}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>

            {/* Trường Chi phí công */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="chiPhiCong" className="text-right text-sm font-medium">
                Chi phí công
              </Label>
              <Input
                id="chiPhiCong"
                name="chiPhiCong"
                type="number"
                placeholder="0"
                value={currentEntry.chiPhiCong || ""}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>

            {/* Trường Chi phí vật tư */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="chiPhiVatTu"
                className="text-right text-sm font-medium"
              >
                Chi phí vật tư
              </Label>
              <Input
                id="chiPhiVatTu"
                name="chiPhiVatTu"
                type="number"
                placeholder="0"
                value={currentEntry.chiPhiVatTu || ""}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>

            {/* Trường Mùa vụ (Select) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="muaVu" className="text-right text-sm font-medium">
                Mùa vụ
              </Label>
              <Select
                name="muaVu"
                onValueChange={(value) => handleSelectChange("muaVu", value)}
                value={currentEntry.muaVu || ""}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn mùa vụ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Xuân Hè">Xuân Hè</SelectItem>
                  <SelectItem value="Hè Thu">Hè Thu</SelectItem>
                  <SelectItem value="Thu Đông">Thu Đông</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Trường Số lượng công */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="soLuongCong"
                className="text-right text-sm font-medium"
              >
                Số lượng công
              </Label>
              <Input
                id="soLuongCong"
                name="soLuongCong"
                type="number"
                placeholder="0"
                value={currentEntry.soLuongCong || ""}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>

            {/* Trường Số lượng vật tư */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="soLuongVatTu"
                className="text-right text-sm font-medium"
              >
                Số lượng vật tư
              </Label>
              <Input
                id="soLuongVatTu"
                name="soLuongVatTu"
                type="number"
                placeholder="0"
                value={currentEntry.soLuongVatTu || ""}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>

            {/* Thêm Vật tư sử dụng */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right text-sm font-medium pt-1">
                Vật tư sử dụng
              </Label>
              <div className="col-span-3 space-y-2">
                <Input
                  placeholder="Tên vật tư (vd: Ure, Thuốc trừ sâu...)"
                  name="name"
                  value={agrochemical.name || ""}
                  onChange={handleAgrochemicalChange}
                />
                <Select
                  name="type"
                  onValueChange={(value) => setAgrochemical((prev) => ({ ...prev, type: value }))}
                  value={agrochemical.type || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Loại vật tư" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thuốc">Thuốc</SelectItem>
                    <SelectItem value="phân">Phân</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Liều lượng (vd: 20)"
                  name="lieuLuong"
                  type="number"
                  value={agrochemical.lieuLuong || ""}
                  onChange={handleAgrochemicalChange}
                />
                <Input
                  placeholder="Đơn vị tính (vd: kg, l...)"
                  name="donViTinh"
                  value={agrochemical.donViTinh || ""}
                  onChange={handleAgrochemicalChange}
                />
                <Button
                  variant="secondary"
                  onClick={addAgrochemical}
                  type="button"
                  className="w-full sm:w-auto"
                >
                  Thêm vật tư
                </Button>
              </div>
            </div>

            {/* Danh sách vật tư đã thêm */}
            {currentEntry.agrochemicals && currentEntry.agrochemicals.length > 0 && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right text-sm font-medium pt-1">Đã thêm:</Label>
                <ul className="col-span-3 list-disc pl-5 space-y-1">
                  {currentEntry.agrochemicals.map((item, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      {item.name} - {item.type} - {item.lieuLuong} {item.donViTinh}
                      {item.donGia && ` (${formatCurrency(item.donGia)}/${item.donViTinh})`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Nút submit */}
            <Button
              onClick={handleSubmit}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isEditMode ? "Chỉnh sửa công việc" : "Thêm mới công việc"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
)
AddEditEntryModal.displayName = "AddEditEntryModal"

export default AddEditEntryModal

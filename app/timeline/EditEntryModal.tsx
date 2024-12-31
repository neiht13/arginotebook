// components/EditEntryModal.tsx

"use client"

import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TimelineEntry, Agrochemical } from "./types"
import { CalendarIcon, EditIcon } from "lucide-react"
import { toast } from "react-toastify"

import AgrochemicalForm from "./AgrochemicalForm" // Import AgrochemicalForm component

import { format, parse } from 'date-fns' // Import các hàm từ date-fns
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { vi } from "date-fns/locale"

interface EditEntryModalProps {
  onEdit: (entry: TimelineEntry) => void
}

export interface EditEntryModalHandle {
  open: (entry: TimelineEntry) => void
  close: () => void
}

const EditEntryModal = forwardRef<EditEntryModalHandle, EditEntryModalProps>(
  ({ onEdit }, ref) => {
    const [open, setOpen] = useState(false)
    const [currentEntry, setCurrentEntry] = useState<Partial<TimelineEntry>>({})
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined) // State cho ngày được chọn

    useImperativeHandle(ref, () => ({
      open: (entry: TimelineEntry) => {
        setCurrentEntry(entry)
        if (entry.ngayThucHien) {
          const parsedDate = parse(entry.ngayThucHien, 'dd-MM-yyyy', new Date(), { locale: vi })
          setSelectedDate(parsedDate)
        } else {
          setSelectedDate(undefined)
        }
        setOpen(true)
      },
      close: () => setOpen(false),
    }))

    // Hàm xử lý thay đổi ngày
    const handleDateChange = (date: Date | undefined) => {
      setSelectedDate(date)
      if (date) {
        const formattedDate = format(date, 'dd-MM-yyyy', { locale: vi })
        setCurrentEntry((prev) => ({ ...prev, ngayThucHien: formattedDate }))
      } else {
        setCurrentEntry((prev) => ({ ...prev, ngayThucHien: undefined }))
      }
    }

    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target
      setCurrentEntry((prev) => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
      setCurrentEntry((prev) => ({ ...prev, [name]: value }))
    }

    const addAgrochemical = (agrochemical: Agrochemical) => {
      setCurrentEntry((prev) => ({
        ...prev,
        agrochemicals: [
          ...(prev.agrochemicals || []),
          agrochemical,
        ],
      }))
    }

    const handleSubmit = () => {
      // Các trường bắt buộc
      if (currentEntry.congViec && currentEntry.giaiDoan && currentEntry.ngayThucHien) {
        onEdit(currentEntry as TimelineEntry)
        toast.success("Chỉnh sửa công việc thành công!")
        setCurrentEntry({})
        setSelectedDate(undefined)
        setOpen(false)
      } else {
        toast.error("Vui lòng điền đầy đủ các trường bắt buộc.")
      }
    }

    useEffect(() => {
      if (!open) {
        setCurrentEntry({})
        setSelectedDate(undefined)
      }
    }, [open])

    // Hàm định dạng tiền tệ (nếu cần)
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
    }

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <Button variant="outline">
            <EditIcon className="mr-2 h-4 w-4" /> Chỉnh sửa
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-lg shadow-lg border-0">
          {/* Header */}
          <DialogHeader className="bg-gradient-to-r from-lime-500 to-lime-800 px-4 py-3">
            <DialogTitle className="text-white text-lg font-bold">
              Chỉnh sửa công việc
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate
                      ? format(selectedDate, 'dd-MM-yyyy', { locale: vi })
                      : <span>Chọn ngày</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
              <div className="col-span-3">
                <AgrochemicalForm onAdd={addAgrochemical} />
              </div>
            </div>

            {/* Danh sách vật tư đã thêm */}
            {currentEntry.agrochemicals && currentEntry.agrochemicals.length > 0 && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right text-sm font-medium pt-1">Đã thêm:</Label>
                <ul className="col-span-3 list-disc pl-5 space-y-1">
                  {currentEntry.agrochemicals.map((item, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      {item.name} - {item.type} - {item.isOrganic ? 'Hữu cơ' : 'Không hữu cơ'} - {item.lieuLuong} {item.donViTinh.join(', ')}
                      {item.donGia && ` (${formatCurrency(item.donGia)}/${item.donViTinh.join(', ')})`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Nút submit */}
            <Button
              onClick={handleSubmit}
              className="w-full bg-lime-600 hover:bg-lime-700 text-white"
            >
              Chỉnh sửa công việc
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
)
EditEntryModal.displayName = "EditEntryModal"

export default EditEntryModal

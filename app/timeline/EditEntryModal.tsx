"use client"

import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

interface EditEntryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: TimelineEntry
  onUpdate: (updatedEntry: TimelineEntry) => void
}

const EditEntryModal: React.FC<EditEntryModalProps> = ({
  open,
  onOpenChange,
  entry,
  onUpdate,
}) => {
  const [editedEntry, setEditedEntry] = useState<Partial<TimelineEntry>>({})
  const [tempAgrochemical, setTempAgrochemical] = useState<Partial<Agrochemical>>({})

  // Copy dữ liệu entry vào state local khi modal mở
  useEffect(() => {
    if (open && entry) {
      setEditedEntry({ ...entry })
    }
  }, [open, entry])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedEntry((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (field: keyof TimelineEntry, value: string) => {
    setEditedEntry((prev) => ({ ...prev, [field]: value }))
  }

  // Thêm agrochemical mới
  const addAgrochemical = () => {
    if (tempAgrochemical.name && tempAgrochemical.type) {
      setEditedEntry((prev) => ({
        ...prev,
        agrochemicals: [
          ...(prev.agrochemicals || []),
          { ...tempAgrochemical, id: Date.now().toString() },
        ],
      }))
      setTempAgrochemical({})
    }
  }

  const handleUpdate = () => {
    const updated: TimelineEntry = {
      ...entry, // Giữ nguyên _id
      ...editedEntry,
      chiPhiCong: Number(editedEntry.chiPhiCong) || 0,
      chiPhiVatTu: Number(editedEntry.chiPhiVatTu) || 0,
    }
    onUpdate(updated)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Không có DialogTrigger ở đây, 
          ta điều khiển open/close từ ngoài */}
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-lg shadow-lg border-0">
        <DialogHeader className="bg-gradient-to-r from-green-500 to-lime-500 px-4 py-3">
          <DialogTitle className="text-white text-lg font-bold">
            Chỉnh sửa công việc
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4 space-y-4 bg-white">
          {/* Công việc */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="congViec" className="text-right text-sm font-medium">
              Công việc
            </Label>
            <Input
              id="congViec"
              name="congViec"
              value={editedEntry.congViec || ""}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          {/* Giai đoạn */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="giaiDoan" className="text-right text-sm font-medium">
              Giai đoạn
            </Label>
            <Input
              id="giaiDoan"
              name="giaiDoan"
              value={editedEntry.giaiDoan || ""}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          {/* Ngày thực hiện */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ngayThucHien" className="text-right text-sm font-medium">
              Ngày thực hiện
            </Label>
            <Input
              id="ngayThucHien"
              name="ngayThucHien"
              type="date"
              value={editedEntry.ngayThucHien || ""}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          {/* Chi phí công */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="chiPhiCong" className="text-right text-sm font-medium">
              Chi phí công
            </Label>
            <Input
              id="chiPhiCong"
              name="chiPhiCong"
              type="number"
              value={editedEntry.chiPhiCong || ""}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          {/* Chi phí vật tư */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="chiPhiVatTu" className="text-right text-sm font-medium">
              Chi phí vật tư
            </Label>
            <Input
              id="chiPhiVatTu"
              name="chiPhiVatTu"
              type="number"
              value={editedEntry.chiPhiVatTu || ""}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          {/* Mùa vụ */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="muaVu" className="text-right text-sm font-medium">
              Mùa vụ
            </Label>
            <Select
              value={editedEntry.muaVu || ""}
              onValueChange={(val) => handleSelectChange("muaVu", val)}
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
          {/* Số lượng công */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="soLuongCong" className="text-right text-sm font-medium">
              Số lượng công
            </Label>
            <Input
              id="soLuongCong"
              name="soLuongCong"
              type="number"
              value={editedEntry.soLuongCong || ""}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          {/* Số lượng vật tư */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="soLuongVatTu" className="text-right text-sm font-medium">
              Số lượng vật tư
            </Label>
            <Input
              id="soLuongVatTu"
              name="soLuongVatTu"
              type="number"
              value={editedEntry.soLuongVatTu || ""}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          {/* Thêm mới Agrochemical */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right text-sm font-medium pt-1">
              Vật tư mới
            </Label>
            <div className="col-span-3 space-y-2">
              <Input
                placeholder="Tên vật tư"
                name="name"
                value={tempAgrochemical.name || ""}
                onChange={(e) =>
                  setTempAgrochemical((prev) => ({
                    ...prev,
                    [e.target.name]: e.target.value,
                  }))
                }
              />
              <Select
                onValueChange={(val) =>
                  setTempAgrochemical((prev) => ({ ...prev, type: val }))
                }
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
                placeholder="Liều lượng"
                name="lieuLuong"
                value={tempAgrochemical.lieuLuong || ""}
                onChange={(e) =>
                  setTempAgrochemical((prev) => ({
                    ...prev,
                    [e.target.name]: e.target.value,
                  }))
                }
              />
              <Input
                placeholder="Đơn vị tính"
                name="donViTinh"
                value={tempAgrochemical.donViTinh || ""}
                onChange={(e) =>
                  setTempAgrochemical((prev) => ({
                    ...prev,
                    [e.target.name]: e.target.value,
                  }))
                }
              />
              <Button variant="secondary" onClick={addAgrochemical} type="button">
                Thêm vật tư
              </Button>
            </div>
          </div>
          {/* Danh sách Agrochemicals hiện có */}
          {editedEntry.agrochemicals && editedEntry.agrochemicals.length > 0 && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right text-sm font-medium pt-1">Đã thêm:</Label>
              <ul className="col-span-3 list-disc pl-5 space-y-1">
                {editedEntry.agrochemicals.map((item, index) => (
                  <li key={index} className="text-sm text-gray-700 flex gap-2">
                    <span>{item.name}</span>
                    <span className="text-gray-400">- {item.type}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Nút lưu */}
          <Button onClick={handleUpdate} className="w-full bg-green-600 hover:bg-green-700 text-white">
            Lưu thay đổi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditEntryModal

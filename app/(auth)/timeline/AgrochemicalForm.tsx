// components/AgrochemicalForm.tsx

"use client"

import React, { useState } from 'react'
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
import { toast } from 'react-toastify'
import { PlusCircle } from 'lucide-react'

interface AgrochemicalFormProps {
  onAdd: (agrochemical: Agrochemical) => void
}

interface Agrochemical {
  id: string
  name: string
  type: 'thuốc' | 'phân'
  isOrganic: boolean
  lieuLuong: number
  donViTinh: string
  donGia?: number
}

const AgrochemicalForm: React.FC<AgrochemicalFormProps> = ({ onAdd }) => {
  const [agrochemical, setAgrochemical] = useState<Partial<Agrochemical>>({
    name: '',
    type: 'thuốc',
    isOrganic: false,
    lieuLuong: 0,
    donViTinh: "",
  })

  // Danh sách các đơn vị tính có thể chọn
  const unitOptions = ['kg', 'g', 'l', 'ml', 'ton', 'cm³']

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target
    if (name === 'isOrganic') {
      setAgrochemical((prev) => ({ ...prev, isOrganic: checked }))
    } else if (type === 'number') {
      setAgrochemical((prev) => ({ ...prev, [name]: Number(value) }))
    } else {
      setAgrochemical((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (value: string) => {
    setAgrochemical((prev) => ({ ...prev, donViTinh: value }))
  }

  const handleAdd = () => {
    if (
      agrochemical.name &&
      agrochemical.type &&
      agrochemical.lieuLuong &&
      agrochemical.donViTinh
    ) {
      onAdd({
        id: Date.now().toString(),
        name: agrochemical.name,
        type: agrochemical.type,
        isOrganic: agrochemical.isOrganic || false,
        lieuLuong: agrochemical.lieuLuong,
        donViTinh: agrochemical.donViTinh,
        donGia: agrochemical.donGia,
      })
      setAgrochemical({
        name: '',
        type: 'thuốc',
        isOrganic: false,
        lieuLuong: 0,
        donViTinh: '',
      })
      toast.success("Thêm vật tư thành công!")
    } else {
      // Thông báo lỗi nếu thiếu thông tin
      toast.error("Vui lòng điền đầy đủ thông tin vật tư.")
    }
  }

  return (
    <form className="space-y-4">
      {/* Tên Vật tư */}
      <div className="flex flex-col">
        <Label htmlFor="name" className="mb-1">Tên Vật tư<span className="text-red-500">*</span></Label>
        <Input
          id="name"
          name="name"
          placeholder="VD: Ure, Thuốc trừ sâu..."
          value={agrochemical.name}
          onChange={handleChange}
          required
        />
      </div>

      {/* Loại Vật tư */}
      <div className="grid grid-cols-3 gap-4">
      <div className="flex flex-col col-span-2">
        <Label htmlFor="type" className="mb-1">Loại Vật tư<span className="text-red-500">*</span></Label>
        <Select
          name="type"
          value={agrochemical.type}
          onValueChange={(value) => setAgrochemical((prev) => ({ ...prev, type: value as 'thuốc' | 'phân' }))}
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn loại vật tư" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="thuốc">Thuốc</SelectItem>
            <SelectItem value="phân">Phân</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Organic */}
      <div className="flex flex-col items-center align-middle">
        <Label htmlFor="isOrganic" className="mr-2 mb-2">Hữu cơ:</Label>
        <input
          type="checkbox"
          name="isOrganic"
          id="isOrganic"
          checked={agrochemical.isOrganic}
          onChange={handleChange}
          className="h-4 w-4 text-lime-600 hover:border-lime-600 border-slate-300 rounded"
        />
      </div>
      </div>

      {/* Liều Lượng */}

      <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col">
        <Label htmlFor="lieuLuong" className="mb-1">Liều lượng<span className="text-red-500">*</span></Label>
        <Input
          id="lieuLuong"
          name="lieuLuong"
          placeholder="VD: 20"
          type="number"
          min="0"
          value={agrochemical.lieuLuong}
          onChange={handleChange}
          required
        />
      </div>

      {/* Đơn Vị Tính */}
      <div className="flex flex-col">
        <Label htmlFor="donViTinh" className="mb-1">Đơn vị tính<span className="text-red-500">*</span></Label>
        <Select
          name="donViTinh"
          value={agrochemical.donViTinh}
          onValueChange={handleSelectChange}
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn đơn vị tính" />
          </SelectTrigger>
          <SelectContent>
            {unitOptions.map((unit) => (
              <SelectItem key={unit} value={unit}>{unit}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      </div>

      {/* Đơn Giá (Tùy chọn) */}
      <div className="flex flex-col">
        <Label htmlFor="donGia" className="mb-1">Đơn giá (VND)</Label>
        <Input
          id="donGia"
          name="donGia"
          placeholder="VD: 100000"
          type="number"
          min="0"
          value={agrochemical.donGia}
          onChange={handleChange}
        />
      </div>

      {/* Nút Thêm Vật tư */}
      <Button type='submit' onClick={handleAdd} variant='outline' className="w-32 mx-auto bg-lime-600 hover:bg-lime-700 text-white">
        <PlusCircle/> Thêm vật tư
      </Button>
    </form>
  )
}

export default AgrochemicalForm

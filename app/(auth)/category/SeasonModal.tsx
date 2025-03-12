// SeasonModal.jsx
"use client"

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'

export default function SeasonModal({ isOpen, onClose, item }) {
  const [formData, setFormData] = useState({
    _id:  '',
    muavu: '',
    nam: '',
    ngaybatdau: '',
    phuongphap: '',
    giong: '',
    dientich: '',
    soluong: '',
    giagiong: '',
    sothua: '',
    chiphikhac: '',
  })

  useEffect(() => {
    if (item) {
      setFormData({
        _id: item._id || '',
        muavu: item.muavu || '',
        nam: item.nam || '',
        ngaybatdau: item.ngaybatdau || '',
        phuongphap: item.phuongphap || '',
        giong: item.giong || '',
        dientich: item.dientich || '',
        soluong: item.soluong || '',
        giagiong: item.giagiong || '',
        sothua: item.sothua || '',
        chiphikhac: item.chiphikhac || '',
      })
    } else {
      setFormData({
        _id: '',
        muavu: '',
        nam: '',
        ngaybatdau: '',
        phuongphap: '',
        giong: '',
        dientich: '',
        soluong: '',
        giagiong: '',
        sothua: '',
        chiphikhac: '',
      })
    }
  }, [item])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    axios.post('/api/muavu', formData)
    e.preventDefault()
    // Xử lý thêm mới hoặc cập nhật dữ liệu
    console.log('Submitting:', formData)
    onClose()
  }
  const handleDelete = async () => {
    if (!formData._id) return; // Đảm bảo có ID trước khi xóa
  
    try {
      await axios.delete(`/api/muavu?id=${formData._id}`);
      console.log("Deleted successfully");
      onClose();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent as={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all"
      >
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-lg font-semibold text-slate-900">
            {item ? 'Sửa Mùa Vụ' : 'Thêm Mùa Vụ Mới'}
          </DialogTitle>
          <Button onClick={onClose} variant="ghost" className="p-1">
            <X className="w-5 h-5 text-slate-500" />
          </Button>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid gap-4">
            {/* Mùa vụ */}
            <div className="flex flex-col">
              <Label htmlFor="muavu" className="mb-1 font-medium text-slate-700">
                Mùa Vụ
              </Label>
              <Input
                id="muavu"
                name="muavu"
                value={formData.muavu}
                onChange={handleChange}
                required
                placeholder="Nhập mùa vụ"
                className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
            {/* Năm */}
            <div className="flex flex-col">
              <Label htmlFor="nam" className="mb-1 font-medium text-slate-700">
                Năm
              </Label>
              <Input
                id="nam"
                name="nam"
                type="number"
                value={formData.nam}
                onChange={handleChange}
                required
                placeholder="Nhập năm"
                className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
            {/* Ngày bắt đầu */}
            <div className="flex flex-col">
              <Label htmlFor="ngaybatdau" className="mb-1 font-medium text-slate-700">
                Ngày Bắt Đầu
              </Label>
              <Input
                id="ngaybatdau"
                name="ngaybatdau"
                type="date"
                value={formData.ngaybatdau}
                onChange={handleChange}
                required
                className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
            {/* Phương pháp */}
            <div className="flex flex-col">
              <Label htmlFor="phuongphap" className="mb-1 font-medium text-slate-700">
                Phương Pháp
              </Label>
              <Input
                id="phuongphap"
                name="phuongphap"
                value={formData.phuongphap}
                onChange={handleChange}
                required
                placeholder="Nhập phương pháp"
                className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
            {/* Giống */}
            <div className="flex flex-col">
              <Label htmlFor="giong" className="mb-1 font-medium text-slate-700">
                Giống
              </Label>
              <Input
                id="giong"
                name="giong"
                value={formData.giong}
                onChange={handleChange}
                required
                placeholder="Nhập giống"
                className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
            {/* Diện tích */}
            <div className="flex flex-col">
              <Label htmlFor="dientich" className="mb-1 font-medium text-slate-700">
                Diện Tích (ha)
              </Label>
              <Input
                id="dientich"
                name="dientich"
                type="number"
                value={formData.dientich}
                onChange={handleChange}
                required
                placeholder="Nhập diện tích"
                className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
            {/* Số lượng */}
            <div className="flex flex-col">
              <Label htmlFor="soluong" className="mb-1 font-medium text-slate-700">
                Số Lượng
              </Label>
              <Input
                id="soluong"
                name="soluong"
                type="number"
                value={formData.soluong}
                onChange={handleChange}
                required
                placeholder="Nhập số lượng"
                className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
            {/* Giá giống */}
            <div className="flex flex-col">
              <Label htmlFor="giagiong" className="mb-1 font-medium text-slate-700">
                Giá Giống (VNĐ)
              </Label>
              <Input
                id="giagiong"
                name="giagiong"
                type="number"
                value={formData.giagiong}
                onChange={handleChange}
                required
                placeholder="Nhập giá giống"
                className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
            {/* Số thửa */}
            <div className="flex flex-col">
              <Label htmlFor="sothua" className="mb-1 font-medium text-slate-700">
                Số Thửa
              </Label>
              <Input
                id="sothua"
                name="sothua"
                type="number"
                value={formData.sothua}
                onChange={handleChange}
                required
                placeholder="Nhập số thửa"
                className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
            {/* Chi phí khác */}
            <div className="flex flex-col">
              <Label htmlFor="chiphikhac" className="mb-1 font-medium text-slate-700">
                Chi Phí Khác (VNĐ)
              </Label>
              <Input
                id="chiphikhac"
                name="chiphikhac"
                type="number"
                value={formData.chiphikhac}
                onChange={handleChange}
                placeholder="Nhập chi phí khác"
                className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end mt-4 space-x-2">
          {item && (
    <Button
      type="button"
      onClick={handleDelete}
      variant="destructive"
      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white"
    >
      Xóa
    </Button>
  )}
            <Button type="button" onClick={onClose} variant="ghost" className="px-4 py-2">
              Hủy
            </Button>
            <Button type="submit" className="px-4 py-2 bg-lime-500 hover:bg-lime-600 text-white">
              Lưu
            </Button>
            
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

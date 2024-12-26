// StageModal.jsx
"use client"

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from 'lucide-react'
import { motion } from 'framer-motion'

export default function StageModal({ isOpen, onClose, item }) {
  const [formData, setFormData] = useState({
    giaidoan: '',
    tengiaidoan: '',
    color: '#000000',
    ghichu: '',
  })

  useEffect(() => {
    if (item) {
      setFormData({
        giaidoan: item.giaidoan || '',
        tengiaidoan: item.tengiaidoan || '',
        color: item.color || '#000000',
        ghichu: item.ghichu || '',
      })
    } else {
      setFormData({
        giaidoan: '',
        tengiaidoan: '',
        color: '#000000',
        ghichu: '',
      })
    }
  }, [item])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Xử lý thêm mới hoặc cập nhật dữ liệu
    console.log('Submitting:', formData)
    onClose()
  }

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
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {item ? 'Sửa Giai Đoạn' : 'Thêm Giai Đoạn Mới'}
          </DialogTitle>
          <Button onClick={onClose} variant="ghost" className="p-1">
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid gap-4">
            {/* Giai Đoạn */}
            <div className="flex flex-col">
              <Label htmlFor="giaidoan" className="mb-1 font-medium text-gray-700">
                Giai Đoạn
              </Label>
              <Input
                id="giaidoan"
                name="giaidoan"
                type="number"
                value={formData.giaidoan}
                onChange={handleChange}
                required
                placeholder="Nhập giai đoạn"
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Tên Giai Đoạn */}
            <div className="flex flex-col">
              <Label htmlFor="tengiaidoan" className="mb-1 font-medium text-gray-700">
                Tên Giai Đoạn
              </Label>
              <Input
                id="tengiaidoan"
                name="tengiaidoan"
                value={formData.tengiaidoan}
                onChange={handleChange}
                required
                placeholder="Nhập tên giai đoạn"
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Màu sắc */}
            <div className="flex flex-col">
              <Label htmlFor="color" className="mb-1 font-medium text-gray-700">
                Màu Sắc
              </Label>
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-10 h-10 p-0 border-0 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Ghi chú */}
            <div className="flex flex-col">
              <Label htmlFor="ghichu" className="mb-1 font-medium text-gray-700">
                Ghi Chú
              </Label>
              <Input
                id="ghichu"
                name="ghichu"
                value={formData.ghichu}
                onChange={handleChange}
                placeholder="Nhập ghi chú"
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end mt-4 space-x-2">
            <Button type="button" onClick={onClose} variant="ghost" className="px-4 py-2">
              Hủy
            </Button>
            <Button type="submit" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white">
              Lưu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

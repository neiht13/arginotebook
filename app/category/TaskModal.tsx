// TaskModal.jsx
"use client"

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TaskModal({ isOpen, onClose, item }) {
  const [formData, setFormData] = useState({
    stt: '',
    tenCongViec: '',
    tenGiaiDoan: '',
    chitietcongviec: '',
    ghichu: '',
    chiphidvt: '',
  })

  useEffect(() => {
    if (item) {
      setFormData({
        stt: item.stt || '',
        tenCongViec: item.tenCongViec || '',
        tenGiaiDoan: item.tenGiaiDoan || '',
        chitietcongviec: item.chitietcongviec || '',
        ghichu: item.ghichu || '',
        chiphidvt: item.chiphidvt || '',
      })
    } else {
      setFormData({
        stt: '',
        tenCongViec: '',
        tenGiaiDoan: '',
        chitietcongviec: '',
        ghichu: '',
        chiphidvt: '',
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
        className="w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all"
      >
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-lg font-semibold text-slate-900">
            {item ? 'Sửa Công Việc' : 'Thêm Công Việc Mới'}
          </DialogTitle>
          <Button onClick={onClose} variant="ghost" className="p-1">
            <X className="w-5 h-5 text-slate-500" />
          </Button>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid gap-4">
            {/* STT */}
            <div className="flex flex-col">
              <Label htmlFor="stt" className="mb-1 font-medium text-slate-700">
                STT
              </Label>
              <Input
                id="stt"
                name="stt"
                type="number"
                value={formData.stt}
                onChange={handleChange}
                required
                placeholder="Nhập STT"
                className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
            {/* Tên công việc */}
            <div className="flex flex-col">
              <Label htmlFor="tenCongViec" className="mb-1 font-medium text-slate-700">
                Tên Công Việc
              </Label>
              <Input
                id="tenCongViec"
                name="tenCongViec"
                value={formData.tenCongViec}
                onChange={handleChange}
                required
                placeholder="Nhập tên công việc"
                className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
            {/* Tên giai đoạn */}
            <div className="flex flex-col">
              <Label htmlFor="tenGiaiDoan" className="mb-1 font-medium text-slate-700">
                Tên Giai Đoạn
              </Label>
              <Input
                id="tenGiaiDoan"
                name="tenGiaiDoan"
                value={formData.tenGiaiDoan}
                onChange={handleChange}
                required
                placeholder="Nhập tên giai đoạn"
                className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
            {/* Chi tiết công việc */}
            <div className="flex flex-col">
              <Label htmlFor="chitietcongviec" className="mb-1 font-medium text-slate-700">
                Chi Tiết Công Việc
              </Label>
              <Textarea
                id="chitietcongviec"
                name="chitietcongviec"
                value={formData.chitietcongviec}
                onChange={handleChange}
                placeholder="Nhập chi tiết công việc"
                className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
            {/* Ghi chú */}
            <div className="flex flex-col">
              <Label htmlFor="ghichu" className="mb-1 font-medium text-slate-700">
                Ghi Chú
              </Label>
              <Input
                id="ghichu"
                name="ghichu"
                value={formData.ghichu}
                onChange={handleChange}
                placeholder="Nhập ghi chú"
                className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
            {/* Chi phí DVT */}
            <div className="flex flex-col">
              <Label htmlFor="chiphidvt" className="mb-1 font-medium text-slate-700">
                Chi Phí DVT (VNĐ)
              </Label>
              <Input
                id="chiphidvt"
                name="chiphidvt"
                type="number"
                value={formData.chiphidvt}
                onChange={handleChange}
                required
                placeholder="Nhập chi phí DVT"
                className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end mt-4 space-x-2">
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

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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
      setFormData(item)
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
    // Here you would typically send the data to your backend
    console.log('Submitting:', formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? 'Sửa công việc' : 'Thêm công việc mới'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stt" className="text-right">
                STT
              </Label>
              <Input
                id="stt"
                name="stt"
                type="number"
                value={formData.stt}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tenCongViec" className="text-right">
                Tên công việc
              </Label>
              <Input
                id="tenCongViec"
                name="tenCongViec"
                value={formData.tenCongViec}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tenGiaiDoan" className="text-right">
                Tên giai đoạn
              </Label>
              <Input
                id="tenGiaiDoan"
                name="tenGiaiDoan"
                value={formData.tenGiaiDoan}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="chitietcongviec" className="text-right">
                Chi tiết công việc
              </Label>
              <Textarea
                id="chitietcongviec"
                name="chitietcongviec"
                value={formData.chitietcongviec}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ghichu" className="text-right">
                Ghi chú
              </Label>
              <Input
                id="ghichu"
                name="ghichu"
                value={formData.ghichu}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="chiphidvt" className="text-right">
                Chi phí DVT
              </Label>
              <Input
                id="chiphidvt"
                name="chiphidvt"
                value={formData.chiphidvt}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Lưu</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


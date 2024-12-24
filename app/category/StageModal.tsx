import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function StageModal({ isOpen, onClose, item }) {
  const [formData, setFormData] = useState({
    giaidoan: '',
    tengiaidoan: '',
    color: '',
    ghichu: '',
  })

  useEffect(() => {
    if (item) {
      setFormData(item)
    } else {
      setFormData({
        giaidoan: '',
        tengiaidoan: '',
        color: '',
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
    // Here you would typically send the data to your backend
    console.log('Submitting:', formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? 'Sửa giai đoạn' : 'Thêm giai đoạn mới'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="giaidoan" className="text-right">
                Giai đoạn
              </Label>
              <Input
                id="giaidoan"
                name="giaidoan"
                type="number"
                value={formData.giaidoan}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tengiaidoan" className="text-right">
                Tên giai đoạn
              </Label>
              <Input
                id="tengiaidoan"
                name="tengiaidoan"
                value={formData.tengiaidoan}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Màu sắc
              </Label>
              <Input
                id="color"
                name="color"
                type="color"
                value={formData.color}
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
          </div>
          <DialogFooter>
            <Button type="submit">Lưu</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


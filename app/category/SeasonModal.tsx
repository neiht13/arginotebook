import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SeasonModal({ isOpen, onClose, item }) {
  const [formData, setFormData] = useState({
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
      setFormData(item)
    } else {
      setFormData({
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
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log('Submitting:', formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? 'Sửa mùa vụ' : 'Thêm mùa vụ mới'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="muavu" className="text-right">
                Mùa vụ
              </Label>
              <Input
                id="muavu"
                name="muavu"
                value={formData.muavu}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nam" className="text-right">
                Năm
              </Label>
              <Input
                id="nam"
                name="nam"
                value={formData.nam}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ngaybatdau" className="text-right">
                Ngày bắt đầu
              </Label>
              <Input
                id="ngaybatdau"
                name="ngaybatdau"
                type="date"
                value={formData.ngaybatdau}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phuongphap" className="text-right">
                Phương pháp
              </Label>
              <Input
                id="phuongphap"
                name="phuongphap"
                value={formData.phuongphap}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="giong" className="text-right">
                Giống
              </Label>
              <Input
                id="giong"
                name="giong"
                value={formData.giong}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dientich" className="text-right">
                Diện tích
              </Label>
              <Input
                id="dientich"
                name="dientich"
                type="number"
                value={formData.dientich}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="soluong" className="text-right">
                Số lượng
              </Label>
              <Input
                id="soluong"
                name="soluong"
                type="number"
                value={formData.soluong}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="giagiong" className="text-right">
                Giá giống
              </Label>
              <Input
                id="giagiong"
                name="giagiong"
                type="number"
                value={formData.giagiong}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sothua" className="text-right">
                Số thửa
              </Label>
              <Input
                id="sothua"
                name="sothua"
                type="number"
                value={formData.sothua}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="chiphikhac" className="text-right">
                Chi phí khác
              </Label>
              <Input
                id="chiphikhac"
                name="chiphikhac"
                type="number"
                value={formData.chiphikhac}
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


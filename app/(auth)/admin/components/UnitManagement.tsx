"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import Spinner from "@/components/ui/spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { useToast } from "@/components/ui/use-toast"
import axios from "axios"

interface Unit {
  _id: string
  tendonvi: string
  mota: string
  diachi: string
  sodienthoai: string
  email: string
  dientich: number
  createdAt: string
  updatedAt: string
}

export default function UnitManagement() {
  const [units, setUnits] = useState<Unit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    tendonvi: "",
    mota: "",
    diachi: "",
    sodienthoai: "",
    email: "",
    dientich: 0,
  })

  // Lấy danh sách đơn vị
  const fetchUnits = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get("/api/donvi")
      setUnits(response.data)
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn vị:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách đơn vị"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUnits()
  }, [])

  // Lọc đơn vị theo từ khóa tìm kiếm
  const filteredUnits = units.filter((unit) =>
    unit.tendonvi.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Xử lý thay đổi dữ liệu form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "dientich" ? parseFloat(value) || 0 : value,
    }))
  }

  // Xử lý thêm đơn vị mới
  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.post("/api/donvi", formData)
      setUnits([...units, response.data])
      setIsAddDialogOpen(false)
      setFormData({
        tendonvi: "",
        mota: "",
        diachi: "",
        sodienthoai: "",
        email: "",
        dientich: 0,
      })
      toast({
        title: "Thành công",
        description: "Thêm đơn vị thành công"
      })
    } catch (error) {
      console.error("Lỗi khi thêm đơn vị:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thêm đơn vị"
      })
    }
  }

  // Xử lý cập nhật đơn vị
  const handleEditUnit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUnit) return

    try {
      const response = await axios.put(`/api/donvi/${currentUnit._id}`, formData)
      setUnits(units.map((unit) => (unit._id === currentUnit._id ? response.data : unit)))
      setIsEditDialogOpen(false)
      toast({
        title: "Thành công",
        description: "Cập nhật đơn vị thành công"
      })
    } catch (error) {
      console.error("Lỗi khi cập nhật đơn vị:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật đơn vị"
      })
    }
  }

  // Xử lý xóa đơn vị
  const handleDeleteUnit = async () => {
    if (!currentUnit) return

    try {
      await axios.delete(`/api/donvi/${currentUnit._id}`)
      setUnits(units.filter((unit) => unit._id !== currentUnit._id))
      setIsDeleteDialogOpen(false)
      toast({
        title: "Thành công",
        description: "Xóa đơn vị thành công"
      })
    } catch (error) {
      console.error("Lỗi khi xóa đơn vị:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa đơn vị"
      })
    }
  }

  // Mở dialog chỉnh sửa và điền dữ liệu
  const openEditDialog = (unit: Unit) => {
    setCurrentUnit(unit)
    setFormData({
      tendonvi: unit.tendonvi,
      mota: unit.mota,
      diachi: unit.diachi,
      sodienthoai: unit.sodienthoai,
      email: unit.email,
      dientich: unit.dientich,
    })
    setIsEditDialogOpen(true)
  }

  // Mở dialog xóa
  const openDeleteDialog = (unit: Unit) => {
    setCurrentUnit(unit)
    setIsDeleteDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Quản lý đơn vị</CardTitle>
          <CardDescription>Thêm, sửa, xóa các đơn vị trong hệ thống</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-lime-600 hover:bg-lime-700">
              <Plus className="mr-2 h-4 w-4" /> Thêm đơn vị
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm đơn vị mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddUnit} className="space-y-4">
              <div>
                <Label htmlFor="tendonvi">Tên đơn vị</Label>
                <Input
                  id="tendonvi"
                  name="tendonvi"
                  value={formData.tendonvi}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="mota">Mô tả</Label>
                <Textarea
                  id="mota"
                  name="mota"
                  value={formData.mota}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="diachi">Địa chỉ</Label>
                  <Input
                    id="diachi"
                    name="diachi"
                    value={formData.diachi}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="sodienthoai">Số điện thoại</Label>
                  <Input
                    id="sodienthoai"
                    name="sodienthoai"
                    value={formData.sodienthoai}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="dientich">Diện tích (ha)</Label>
                  <Input
                    id="dientich"
                    name="dientich"
                    type="number"
                    step="0.01"
                    value={formData.dientich}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" className="bg-lime-600 hover:bg-lime-700">
                  Thêm
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <Search className="mr-2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Tìm kiếm đơn vị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : filteredUnits.length === 0 ? (
          <EmptyState
            title="Không có đơn vị nào"
            description="Bạn chưa thêm đơn vị nào vào hệ thống."
            icon={<Plus className="h-10 w-10" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên đơn vị</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Diện tích (ha)</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map((unit) => (
                  <TableRow key={unit._id}>
                    <TableCell className="font-medium">{unit.tendonvi}</TableCell>
                    <TableCell>{unit.diachi}</TableCell>
                    <TableCell>{unit.sodienthoai}</TableCell>
                    <TableCell>{unit.email}</TableCell>
                    <TableCell>{unit.dientich?.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(unit)}
                        className="text-slate-500 hover:text-lime-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(unit)}
                        className="text-slate-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Dialog chỉnh sửa đơn vị */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa đơn vị</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditUnit} className="space-y-4">
              <div>
                <Label htmlFor="edit-tendonvi">Tên đơn vị</Label>
                <Input
                  id="edit-tendonvi"
                  name="tendonvi"
                  value={formData.tendonvi}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-mota">Mô tả</Label>
                <Textarea
                  id="edit-mota"
                  name="mota"
                  value={formData.mota}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-diachi">Địa chỉ</Label>
                  <Input
                    id="edit-diachi"
                    name="diachi"
                    value={formData.diachi}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-sodienthoai">Số điện thoại</Label>
                  <Input
                    id="edit-sodienthoai"
                    name="sodienthoai"
                    value={formData.sodienthoai}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-dientich">Diện tích (ha)</Label>
                  <Input
                    id="edit-dientich"
                    name="dientich"
                    type="number"
                    step="0.01"
                    value={formData.dientich}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" className="bg-lime-600 hover:bg-lime-700">
                  Cập nhật
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog xác nhận xóa đơn vị */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Bạn có chắc chắn muốn xóa đơn vị{" "}
                <span className="font-semibold">{currentUnit?.tendonvi}</span> không?
              </p>
              <p className="text-sm text-red-500 mt-2">
                Lưu ý: Tất cả dữ liệu liên quan đến đơn vị này sẽ bị xóa và không thể khôi phục.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteUnit}
              >
                Xóa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

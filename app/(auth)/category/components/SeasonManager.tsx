"use client"

import type React from "react"
import { useState } from "react"
import type { Season } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PlusCircle, Pencil, Trash2, Loader2, Calendar, CalendarIcon } from "lucide-react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession } from "next-auth/react"
import CurrencyInput from "@/components/ui/input-currency"

interface SeasonManagerProps {
  seasons: Season[]
  isLoading: boolean
  onAdd: (season: Partial<Season>) => Promise<void>
  onUpdate: (season: Season) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const SEASON_TYPES = ["Đông Xuân", "Hè Thu", "Thu Đông"]

const SeasonManager: React.FC<SeasonManagerProps> = ({ seasons, isLoading, onAdd, onUpdate, onDelete }) => {
  const { data: session } = useSession()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<Season>>({
    tenmuavu: SEASON_TYPES[0],
    nam: new Date().getFullYear().toString(),
    ngaybatdau: format(new Date(), "dd-MM-yyyy"),
    phuongphap: "",
    giong: "",
    dientich: 0,
    soluong: 0,
    giagiong: 0,
    ghichu: "",
  })
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null)
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(new Date())

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCurrencyChange = (data: { name: string; value: number }) => {
    const { name, value } = data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddSeason = async () => {
    if (!formData.tenmuavu || !formData.nam) return

    setIsSubmitting(true)
    try {
      await onAdd(formData)
      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error adding season:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSeason = async () => {
    if (!selectedSeason || !selectedSeason.tenmuavu || !selectedSeason.nam) return

    setIsSubmitting(true)
    try {
      await onUpdate(selectedSeason)
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating season:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSeason = async () => {
    if (!selectedSeason) return

    setIsSubmitting(true)
    try {
      await onDelete(selectedSeason._id)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting season:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (season: Season) => {
    setSelectedSeason({ ...season })
    if (season.ngaybatdau) {
      try {
        const [day, month, year] = season.ngaybatdau.split("-").map(Number)
        setSelectedStartDate(new Date(year, month - 1, day))
      } catch (error) {
        console.error("Error parsing date:", error)
        setSelectedStartDate(undefined)
      }
    } else {
      setSelectedStartDate(undefined)
    }
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (season: Season) => {
    setSelectedSeason(season)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      tenmuavu: SEASON_TYPES[0],
      nam: new Date().getFullYear().toString(),
      ngaybatdau: format(new Date(), "dd-MM-yyyy"),
      phuongphap: "",
      giong: "",
      dientich: 0,
      soluong: 0,
      giagiong: 0,
      ghichu: "",
    })
    setSelectedStartDate(new Date())
  }

  const handleSelectedSeasonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSelectedSeason((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleSelectedSeasonCurrencyChange = (data: { name: string; value: number }) => {
    const { name, value } = data
    setSelectedSeason((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedStartDate(date)
      setFormData((prev) => ({
        ...prev,
        ngaybatdau: format(date, "dd-MM-yyyy"),
      }))
    }
  }

  const handleSelectedStartDateChange = (date: Date | undefined) => {
    if (date && selectedSeason) {
      setSelectedStartDate(date)
      setSelectedSeason({
        ...selectedSeason,
        ngaybatdau: format(date, "dd-MM-yyyy"),
      })
    }
  }

  const handleSeasonTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tenmuavu: value }))
  }

  const handleSelectedSeasonTypeChange = (value: string) => {
    setSelectedSeason((prev) => (prev ? { ...prev, tenmuavu: value } : null))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Danh sách mùa vụ</h2>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-lime-600 hover:bg-lime-700 text-white">
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm mùa vụ
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
        </div>
      ) : seasons.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <Calendar className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-1">Chưa có mùa vụ nào</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Bạn chưa có mùa vụ nào. Hãy thêm mùa vụ đầu tiên để bắt đầu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {seasons.map((season) => (
            <motion.div
              key={season._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-slate-800">{season.tenmuavu}</h3>
                  <p className="text-sm text-slate-500">Năm: {season.nam}</p>
                  {season.ngaybatdau && <p className="text-sm text-slate-500">Bắt đầu: {season.ngaybatdau}</p>}
                  {season.giong && <p className="text-sm text-slate-500">Giống: {season.giong}</p>}
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(season)}
                    className="h-8 w-8 text-slate-500 hover:text-lime-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteDialog(season)}
                    className="h-8 w-8 text-slate-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Season Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm mùa vụ mới</DialogTitle>
            <DialogDescription>Nhập thông tin mùa vụ mới. Nhấn Lưu khi hoàn tất.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tenmuavu">Tên mùa vụ</Label>
                <Select value={formData.tenmuavu} onValueChange={handleSeasonTypeChange}>
                  <SelectTrigger id="tenmuavu">
                    <SelectValue placeholder="Chọn mùa vụ" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEASON_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nam">Năm</Label>
                <Input
                  id="nam"
                  name="nam"
                  type="number"
                  placeholder="Ví dụ: 2025"
                  value={formData.nam}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ngaybatdau">Ngày bắt đầu</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal" id="ngaybatdau">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedStartDate ? format(selectedStartDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedStartDate}
                    onSelect={handleStartDateChange}
                    initialFocus
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phuongphap">Phương pháp canh tác</Label>
              <Input
                id="phuongphap"
                name="phuongphap"
                placeholder="Ví dụ: Sạ hàng"
                value={formData.phuongphap}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="giong">Giống</Label>
              <Input
                id="giong"
                name="giong"
                placeholder="Ví dụ: Gạo Tân Hồng"
                value={formData.giong}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dientich">Diện tích (ha)</Label>
                <Input
                  id="dientich"
                  name="dientich"
                  type="number"
                  placeholder="0"
                  value={formData.dientich?.toString() || "0"}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="soluong">Số lượng (kg)</Label>
                <Input
                  id="soluong"
                  name="soluong"
                  type="number"
                  placeholder="0"
                  value={formData.soluong?.toString() || "0"}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="giagiong">Giá giống</Label>
                <CurrencyInput
                  id="giagiong"
                  name="giagiong"
                  value={formData.giagiong || 0}
                  onChange={handleCurrencyChange}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ghichu">Ghi chú</Label>
              <Textarea
                id="ghichu"
                name="ghichu"
                placeholder="Ghi chú thêm về mùa vụ"
                value={formData.ghichu}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleAddSeason}
              disabled={isSubmitting || !formData.tenmuavu || !formData.nam}
              className="bg-lime-600 hover:bg-lime-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Lưu"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Season Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa mùa vụ</DialogTitle>
            <DialogDescription>Chỉnh sửa thông tin mùa vụ. Nhấn Lưu khi hoàn tất.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-tenmuavu">Tên mùa vụ</Label>
                <Select
                  value={selectedSeason?.tenmuavu || SEASON_TYPES[0]}
                  onValueChange={handleSelectedSeasonTypeChange}
                >
                  <SelectTrigger id="edit-tenmuavu">
                    <SelectValue placeholder="Chọn mùa vụ" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEASON_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-nam">Năm</Label>
                <Input
                  id="edit-nam"
                  name="nam"
                  type="number"
                  placeholder="Ví dụ: 2025"
                  value={selectedSeason?.nam || ""}
                  onChange={handleSelectedSeasonChange}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-ngaybatdau">Ngày bắt đầu</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal" id="edit-ngaybatdau">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedStartDate ? format(selectedStartDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedStartDate}
                    onSelect={handleSelectedStartDateChange}
                    initialFocus
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-phuongphap">Phương pháp canh tác</Label>
              <Input
                id="edit-phuongphap"
                name="phuongphap"
                placeholder="Ví dụ: Sạ hàng"
                value={selectedSeason?.phuongphap || ""}
                onChange={handleSelectedSeasonChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-giong">Giống</Label>
              <Input
                id="edit-giong"
                name="giong"
                placeholder="Ví dụ: Gạo Tân Hồng"
                value={selectedSeason?.giong || ""}
                onChange={handleSelectedSeasonChange}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-dientich">Diện tích (ha)</Label>
                <Input
                  id="edit-dientich"
                  name="dientich"
                  type="number"
                  placeholder="0"
                  value={selectedSeason?.dientich?.toString() || "0"}
                  onChange={handleSelectedSeasonChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-soluong">Số lượng (kg)</Label>
                <Input
                  id="edit-soluong"
                  name="soluong"
                  type="number"
                  placeholder="0"
                  value={selectedSeason?.soluong?.toString() || "0"}
                  onChange={handleSelectedSeasonChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-giagiong">Giá giống</Label>
                <CurrencyInput
                  id="edit-giagiong"
                  name="giagiong"
                  value={selectedSeason?.giagiong || 0}
                  onChange={handleSelectedSeasonCurrencyChange}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-ghichu">Ghi chú</Label>
              <Textarea
                id="edit-ghichu"
                name="ghichu"
                placeholder="Ghi chú thêm về mùa vụ"
                value={selectedSeason?.ghichu || ""}
                onChange={handleSelectedSeasonChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleEditSeason}
              disabled={isSubmitting || !selectedSeason?.tenmuavu || !selectedSeason?.nam}
              className="bg-lime-600 hover:bg-lime-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Lưu"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa mùa vụ "{selectedSeason?.tenmuavu}"? Hành động này không thể hoàn tác và có thể
              ảnh hưởng đến dữ liệu nhật ký canh tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSeason}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default SeasonManager


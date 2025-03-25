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
import { PlusCircle, Pencil, Trash2, Loader2, Calendar, CalendarIcon, Search, X } from "lucide-react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession } from "next-auth/react"
import CurrencyInput from "@/components/ui/input-currency"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"

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
  const [searchTerm, setSearchTerm] = useState("")
  const isMobile = useMediaQuery("(max-width: 768px)")

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

  const filteredSeasons = seasons.filter(
    (season) =>
      season.tenmuavu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      season.nam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (season.giong && season.giong.toLowerCase().includes(searchTerm.toLowerCase())),
  )

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

  const ModalContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tenmuavu">Tên mùa vụ</Label>
          <Select
            value={isEditDialogOpen ? selectedSeason?.tenmuavu || SEASON_TYPES[0] : formData.tenmuavu}
            onValueChange={isEditDialogOpen ? handleSelectedSeasonTypeChange : handleSeasonTypeChange}
          >
            <SelectTrigger id="tenmuavu" className="border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500">
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
        <div className="space-y-2">
          <Label htmlFor="nam">Năm</Label>
          <Input
            id="nam"
            name="nam"
            type="number"
            placeholder="Ví dụ: 2025"
            value={isEditDialogOpen ? selectedSeason?.nam || "" : formData.nam}
            onChange={isEditDialogOpen ? handleSelectedSeasonChange : handleInputChange}
            className="border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ngaybatdau">Ngày bắt đầu</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal border-lime-200 hover:bg-lime-50 focus-visible:ring-lime-500"
              id="ngaybatdau"
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-lime-600" />
              {selectedStartDate ? format(selectedStartDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={selectedStartDate}
              onSelect={isEditDialogOpen ? handleSelectedStartDateChange : handleStartDateChange}
              initialFocus
              locale={vi}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phuongphap">Phương pháp canh tác</Label>
        <Input
          id="phuongphap"
          name="phuongphap"
          placeholder="Ví dụ: Sạ hàng"
          value={isEditDialogOpen ? selectedSeason?.phuongphap || "" : formData.phuongphap}
          onChange={isEditDialogOpen ? handleSelectedSeasonChange : handleInputChange}
          className="border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="giong">Giống</Label>
        <Input
          id="giong"
          name="giong"
          placeholder="Ví dụ: Gạo Tân Hồng"
          value={isEditDialogOpen ? selectedSeason?.giong || "" : formData.giong}
          onChange={isEditDialogOpen ? handleSelectedSeasonChange : handleInputChange}
          className="border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dientich">Diện tích (ha)</Label>
          <Input
            id="dientich"
            name="dientich"
            type="number"
            placeholder="0"
            value={
              isEditDialogOpen ? selectedSeason?.dientich?.toString() || "0" : formData.dientich?.toString() || "0"
            }
            onChange={isEditDialogOpen ? handleSelectedSeasonChange : handleInputChange}
            className="border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="soluong">Số lượng (kg)</Label>
          <Input
            id="soluong"
            name="soluong"
            type="number"
            placeholder="0"
            value={isEditDialogOpen ? selectedSeason?.soluong?.toString() || "0" : formData.soluong?.toString() || "0"}
            onChange={isEditDialogOpen ? handleSelectedSeasonChange : handleInputChange}
            className="border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="giagiong">Giá giống</Label>
          <CurrencyInput
            id="giagiong"
            name="giagiong"
            value={isEditDialogOpen ? selectedSeason?.giagiong || 0 : formData.giagiong || 0}
            onChange={isEditDialogOpen ? handleSelectedSeasonCurrencyChange : handleCurrencyChange}
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ghichu">Ghi chú</Label>
        <Textarea
          id="ghichu"
          name="ghichu"
          placeholder="Ghi chú thêm về mùa vụ"
          value={isEditDialogOpen ? selectedSeason?.ghichu || "" : formData.ghichu}
          onChange={isEditDialogOpen ? handleSelectedSeasonChange : handleInputChange}
          className="min-h-[80px] border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500"
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-lime-600" />
          <Input
            placeholder="Tìm kiếm mùa vụ..."
            className="pl-8 border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-8 w-8 text-slate-500 hover:bg-lime-50"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-lime-600 hover:bg-lime-700 text-white">
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm mùa vụ
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
        </div>
      ) : filteredSeasons.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <Calendar className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-1">
            {searchTerm ? "Không tìm thấy mùa vụ phù hợp" : "Chưa có mùa vụ nào"}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {searchTerm
              ? "Không tìm thấy mùa vụ nào phù hợp với tìm kiếm của bạn."
              : "Bạn chưa có mùa vụ nào. Hãy thêm mùa vụ đầu tiên để bắt đầu."}
          </p>
          {searchTerm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="mt-4 border-lime-200 hover:bg-lime-50 text-lime-700"
            >
              <X className="mr-2 h-4 w-4" />
              Xóa tìm kiếm
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSeasons.map((season) => (
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

      {/* Add/Edit Season Dialog - Mobile */}
      {isMobile ? (
        <>
          <Drawer open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DrawerContent className="px-4 pb-6 pt-4">
              <DrawerHeader className="px-0 pb-4">
                <DrawerTitle className="text-xl font-bold text-slate-800">Thêm mùa vụ mới</DrawerTitle>
                <DrawerDescription className="text-slate-500">
                  Nhập thông tin mùa vụ mới. Nhấn Lưu khi hoàn tất.
                </DrawerDescription>
              </DrawerHeader>
              <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
                {ModalContent}
              </div>
              <div className="sticky bottom-0 left-0 right-0 bg-white border-t pt-4 mt-4">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isSubmitting}
                    className="border-lime-200 hover:bg-lime-50 text-lime-700"
                  >
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
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          <Drawer open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DrawerContent className="px-4 pb-6 pt-4">
              <DrawerHeader className="px-0 pb-4">
                <DrawerTitle className="text-xl font-bold text-slate-800">Chỉnh sửa mùa vụ</DrawerTitle>
                <DrawerDescription className="text-slate-500">
                  Chỉnh sửa thông tin mùa vụ. Nhấn Lưu khi hoàn tất.
                </DrawerDescription>
              </DrawerHeader>
              <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
                {ModalContent}
              </div>
              <div className="sticky bottom-0 left-0 right-0 bg-white border-t pt-4 mt-4">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    disabled={isSubmitting}
                    className="border-lime-200 hover:bg-lime-50 text-lime-700"
                  >
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
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <>
          {/* Add Season Dialog - Desktop */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Thêm mùa vụ mới</DialogTitle>
                <DialogDescription>Nhập thông tin mùa vụ mới. Nhấn Lưu khi hoàn tất.</DialogDescription>
              </DialogHeader>
              {ModalContent}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-lime-200">
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

          {/* Edit Season Dialog - Desktop */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa mùa vụ</DialogTitle>
                <DialogDescription>Chỉnh sửa thông tin mùa vụ. Nhấn Lưu khi hoàn tất.</DialogDescription>
              </DialogHeader>
              {ModalContent}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-lime-200">
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
        </>
      )}

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


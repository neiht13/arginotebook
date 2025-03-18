"use client"

import type React from "react"
import { useState } from "react"
import type { Season } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { PlusCircle, Pencil, Trash2, Loader2, Calendar } from "lucide-react"
import { motion } from "framer-motion"

interface SeasonManagerProps {
  seasons: Season[]
  isLoading: boolean
  onAdd: (season: Partial<Season>) => Promise<void>
  onUpdate: (season: Season) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const SeasonManager: React.FC<SeasonManagerProps> = ({ seasons, isLoading, onAdd, onUpdate, onDelete }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<Season>>({
    muavu: "",
    nam: new Date().getFullYear().toString(),
  })
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddSeason = async () => {
    if (!formData.muavu || !formData.nam) return

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
    if (!selectedSeason || !selectedSeason.muavu || !selectedSeason.nam) return

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
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (season: Season) => {
    setSelectedSeason(season)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      muavu: "",
      nam: new Date().getFullYear().toString(),
    })
  }

  const handleSelectedSeasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSelectedSeason((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  // Generate years for dropdown (current year - 5 to current year + 5)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => (currentYear - 5 + i).toString())

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
                  <h3 className="font-semibold text-lg text-slate-800">{season.muavu}</h3>
                  <p className="text-sm text-slate-500">Năm: {season.nam}</p>
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm mùa vụ mới</DialogTitle>
            <DialogDescription>Nhập thông tin mùa vụ mới. Nhấn Lưu khi hoàn tất.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="muavu">Tên mùa vụ</Label>
              <Input
                id="muavu"
                name="muavu"
                placeholder="Ví dụ: Đông Xuân"
                value={formData.muavu}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nam">Năm</Label>
              <Input
                id="nam"
                name="nam"
                type="number"
                placeholder="Ví dụ: 2024"
                value={formData.nam}
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
              disabled={isSubmitting || !formData.muavu || !formData.nam}
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa mùa vụ</DialogTitle>
            <DialogDescription>Chỉnh sửa thông tin mùa vụ. Nhấn Lưu khi hoàn tất.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-muavu">Tên mùa vụ</Label>
              <Input
                id="edit-muavu"
                name="muavu"
                placeholder="Ví dụ: Đông Xuân"
                value={selectedSeason?.muavu || ""}
                onChange={handleSelectedSeasonChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-nam">Năm</Label>
              <Input
                id="edit-nam"
                name="nam"
                type="number"
                placeholder="Ví dụ: 2024"
                value={selectedSeason?.nam || ""}
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
              disabled={isSubmitting || !selectedSeason?.muavu || !selectedSeason?.nam}
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
              Bạn có chắc chắn muốn xóa mùa vụ "{selectedSeason?.muavu}"? Hành động này không thể hoàn tác và có thể ảnh
              hưởng đến dữ liệu nhật ký canh tác.
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


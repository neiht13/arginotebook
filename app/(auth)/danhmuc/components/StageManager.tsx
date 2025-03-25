"use client"

import type React from "react"
import { useState } from "react"
import type { Stage } from "../types"
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
import { PlusCircle, Pencil, Trash2, Loader2, Layers, Search, X } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { IconPicker } from "./IconPicker"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"

interface StageManagerProps {
  stages: Stage[]
  isLoading: boolean
  onAdd: (stage: Partial<Stage>) => Promise<void>
  onUpdate: (stage: Stage) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

// Predefined colors for stages
const stageColors = [
  "#BB4D00", // Dark Orange
  "#31D304", // Bright Green
  "#1D8300", // Dark Green
  "#B7F305", // Lime Green
  "#FFFF00", // Yellow
  "#FFAD00", // Orange
  "#FF5733", // Coral
  "#C70039", // Crimson
  "#900C3F", // Maroon
  "#581845", // Purple
]

const StageManager: React.FC<StageManagerProps> = ({ stages, isLoading, onAdd, onUpdate, onDelete }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const isMobile = useMediaQuery("(max-width: 768px)")

  const [formData, setFormData] = useState<Partial<Stage>>({
    tengiaidoan: "",
    color: stageColors[0],
    icon: "Layers",
  })
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null)

  const filteredStages = stages.filter((stage) => stage.tengiaidoan.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleColorChange = (color: string) => {
    setFormData((prev) => ({ ...prev, color }))
  }

  const handleIconChange = (icon: string) => {
    setFormData((prev) => ({ ...prev, icon }))
  }

  const handleSelectedStageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSelectedStage((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleSelectedStageColorChange = (color: string) => {
    setSelectedStage((prev) => (prev ? { ...prev, color } : null))
  }

  const handleSelectedStageIconChange = (icon: string) => {
    setSelectedStage((prev) => (prev ? { ...prev, icon } : null))
  }

  const handleAddStage = async () => {
    if (!formData.tengiaidoan || !formData.color) return

    setIsSubmitting(true)
    try {
      await onAdd(formData)
      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error adding stage:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditStage = async () => {
    if (!selectedStage || !selectedStage.tengiaidoan || !selectedStage.color) return

    setIsSubmitting(true)
    try {
      await onUpdate(selectedStage)
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating stage:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteStage = async () => {
    if (!selectedStage) return

    setIsSubmitting(true)
    try {
      await onDelete(selectedStage._id)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting stage:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (stage: Stage) => {
    setSelectedStage({ ...stage })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (stage: Stage) => {
    setSelectedStage(stage)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      tengiaidoan: "",
      color: stageColors[0],
      icon: "Layers",
    })
  }

  const ModalContent = (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="tengiaidoan">Tên giai đoạn</Label>
        <Input
          id="tengiaidoan"
          name="tengiaidoan"
          placeholder="Ví dụ: Làm đất - xuống giống"
          value={isEditDialogOpen ? selectedStage?.tengiaidoan || "" : formData.tengiaidoan}
          onChange={isEditDialogOpen ? handleSelectedStageInputChange : handleInputChange}
          className="border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500"
        />
      </div>

      <div className="grid gap-2">
        <Label>Màu sắc</Label>
        <div className="flex flex-wrap gap-2">
          {stageColors.map((color) => (
            <div
              key={color}
              className={cn(
                "w-8 h-8 rounded-full cursor-pointer border-2",
                (isEditDialogOpen ? selectedStage?.color === color : formData.color === color)
                  ? "border-black"
                  : "border-transparent",
              )}
              style={{ backgroundColor: color }}
              onClick={() => (isEditDialogOpen ? handleSelectedStageColorChange(color) : handleColorChange(color))}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Biểu tượng</Label>
        <IconPicker
          value={isEditDialogOpen ? selectedStage?.icon : formData.icon}
          onChange={isEditDialogOpen ? handleSelectedStageIconChange : handleIconChange}
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-lime-700" />
          <Input
            placeholder="Tìm kiếm giai đoạn..."
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
          Thêm giai đoạn
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-lime-700" />
        </div>
      ) : filteredStages.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <Layers className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-1">
            {searchTerm ? "Không tìm thấy giai đoạn phù hợp" : "Chưa có giai đoạn nào"}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {searchTerm
              ? "Không tìm thấy giai đoạn nào phù hợp với tìm kiếm của bạn."
              : "Bạn chưa có giai đoạn nào. Hãy thêm giai đoạn đầu tiên để bắt đầu."}
          </p>
          {searchTerm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="mt-4 border-lime-200 hover:bg-lime-50 text-lime-800"
            >
              <X className="mr-2 h-4 w-4" />
              Xóa tìm kiếm
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStages.map((stage) => (
            <motion.div
              key={stage._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div
                    className="w-10 h-10 rounded-full mr-3 flex items-center justify-center text-white"
                    style={{ backgroundColor: stage.color }}
                  >
                    <IconPicker.Icon name={stage.icon || "Layers"} className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800">{stage.tengiaidoan}</h3>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(stage)}
                    className="h-8 w-8 text-slate-500 hover:text-lime-700"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteDialog(stage)}
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

      {/* Add/Edit Stage Dialog - Mobile */}
      {isMobile ? (
        <>
          <Drawer open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DrawerContent className="px-4 pb-6 pt-4">
              <DrawerHeader className="px-0 pb-4">
                <DrawerTitle className="text-xl font-bold text-slate-800">Thêm giai đoạn mới</DrawerTitle>
                <DrawerDescription className="text-slate-500">
                  Nhập thông tin giai đoạn mới. Nhấn Lưu khi hoàn tất.
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
                    className="border-lime-200 hover:bg-lime-50 text-lime-800"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleAddStage}
                    disabled={isSubmitting || !formData.tengiaidoan}
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
                <DrawerTitle className="text-xl font-bold text-slate-800">Chỉnh sửa giai đoạn</DrawerTitle>
                <DrawerDescription className="text-slate-500">
                  Chỉnh sửa thông tin giai đoạn. Nhấn Lưu khi hoàn tất.
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
                    className="border-lime-200 hover:bg-lime-50 text-lime-800"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleEditStage}
                    disabled={isSubmitting || !selectedStage?.tengiaidoan}
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
          {/* Add Stage Dialog - Desktop */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Thêm giai đoạn mới</DialogTitle>
                <DialogDescription>Nhập thông tin giai đoạn mới. Nhấn Lưu khi hoàn tất.</DialogDescription>
              </DialogHeader>
              {ModalContent}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-lime-200">
                  Hủy
                </Button>
                <Button
                  onClick={handleAddStage}
                  disabled={isSubmitting || !formData.tengiaidoan}
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

          {/* Edit Stage Dialog - Desktop */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa giai đoạn</DialogTitle>
                <DialogDescription>Chỉnh sửa thông tin giai đoạn. Nhấn Lưu khi hoàn tất.</DialogDescription>
              </DialogHeader>
              {ModalContent}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-lime-200">
                  Hủy
                </Button>
                <Button
                  onClick={handleEditStage}
                  disabled={isSubmitting || !selectedStage?.tengiaidoan}
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
              Bạn có chắc chắn muốn xóa giai đoạn "{selectedStage?.tengiaidoan}"? Hành động này không thể hoàn tác và có
              thể ảnh hưởng đến dữ liệu nhật ký canh tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStage}
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

export default StageManager


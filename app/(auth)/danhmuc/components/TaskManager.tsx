"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Task, Stage } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { PlusCircle, Pencil, Trash2, Loader2, FileText, Search, X } from "lucide-react"
import { motion } from "framer-motion"
import { IconPicker } from "./IconPicker"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"

interface TaskManagerProps {
  tasks: Task[]
  stages: Stage[]
  isLoading: boolean
  onAdd: (task: Partial<Task>) => Promise<void>
  onUpdate: (task: Task) => Promise<void>
  onDelete: (id: string) => Promise<void>
  setActiveTab: (tab: string) => void
}

const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  stages,
  isLoading,
  onAdd,
  onUpdate,
  onDelete,
  setActiveTab,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>("")
  const isMobile = useMediaQuery("(max-width: 768px)")

  const [formData, setFormData] = useState<Partial<Task>>({
    tenCongViec: "",
    giaidoanId: "",
    icon: "FileText",
  })
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks)

  // Update filtered tasks when tasks, search term, or stage filter changes
  useEffect(() => {
    let filtered = [...tasks]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((task) => task.tenCongViec.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Apply stage filter
    if (selectedStageFilter && selectedStageFilter !== "all") {
      filtered = filtered.filter((task) => task.giaidoanId === selectedStageFilter)
    }

    setFilteredTasks(filtered)
  }, [tasks, searchTerm, selectedStageFilter])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStageChange = (stageId: string) => {
    setFormData((prev) => ({ ...prev, giaidoanId: stageId }))
  }

  const handleIconChange = (icon: string) => {
    setFormData((prev) => ({ ...prev, icon }))
  }

  const handleSelectedTaskInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSelectedTask((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleSelectedTaskStageChange = (stageId: string) => {
    setSelectedTask((prev) => (prev ? { ...prev, giaidoanId: stageId } : null))
  }

  const handleSelectedTaskIconChange = (icon: string) => {
    setSelectedTask((prev) => (prev ? { ...prev, icon } : null))
  }

  const handleAddTask = async () => {
    if (!formData.tenCongViec || !formData.giaidoanId) return

    setIsSubmitting(true)
    try {
      await onAdd(formData)
      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error adding task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditTask = async () => {
    if (!selectedTask || !selectedTask.tenCongViec || !selectedTask.giaidoanId) return

    setIsSubmitting(true)
    try {
      await onUpdate(selectedTask)
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTask = async () => {
    if (!selectedTask) return

    setIsSubmitting(true)
    try {
      await onDelete(selectedTask._id)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (task: Task) => {
    setSelectedTask({ ...task })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (task: Task) => {
    setSelectedTask(task)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      tenCongViec: "",
      giaidoanId: "",
      icon: "FileText",
    })
  }

  const getStageById = (stageId: string) => {
    return stages.find((stage) => stage._id === stageId)
  }

  const ModalContent = (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="tenCongViec">Tên công việc</Label>
        <Input
          id="tenCongViec"
          name="tenCongViec"
          placeholder="Ví dụ: Cày đất"
          value={isEditDialogOpen ? selectedTask?.tenCongViec || "" : formData.tenCongViec}
          onChange={isEditDialogOpen ? handleSelectedTaskInputChange : handleInputChange}
          className="border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="giaidoanId">Giai đoạn</Label>
        <Select
          value={isEditDialogOpen ? selectedTask?.giaidoanId || "" : formData.giaidoanId}
          onValueChange={isEditDialogOpen ? handleSelectedTaskStageChange : handleStageChange}
        >
          <SelectTrigger id="giaidoanId" className="border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500">
            <SelectValue placeholder="Chọn giai đoạn" />
          </SelectTrigger>
          <SelectContent>
            {stages.map((stage) => (
              <SelectItem key={stage._id} value={stage._id}>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: stage.color }}></div>
                  {stage.tengiaidoan}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Biểu tượng</Label>
        <IconPicker
          value={isEditDialogOpen ? selectedTask?.icon : formData.icon}
          onChange={isEditDialogOpen ? handleSelectedTaskIconChange : handleIconChange}
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-lime-600" />
            <Input
              placeholder="Tìm kiếm công việc..."
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
          <Select value={selectedStageFilter} onValueChange={setSelectedStageFilter}>
            <SelectTrigger className="w-full md:w-[200px] border-lime-200 focus:border-lime-500 focus-visible:ring-lime-500">
              <SelectValue placeholder="Tất cả giai đoạn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả giai đoạn</SelectItem>
              {stages.map((stage) => (
                <SelectItem key={stage._id} value={stage._id}>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: stage.color }}></div>
                    {stage.tengiaidoan}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-lime-600 hover:bg-lime-700 text-white"
          disabled={stages.length === 0}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm công việc
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
        </div>
      ) : stages.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-1">Cần thêm giai đoạn trước</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Bạn cần thêm ít nhất một giai đoạn trước khi có thể thêm công việc.
          </p>
          <Button
            onClick={() => setActiveTab("stages")}
            variant="outline"
            className="mt-4 border-lime-200 hover:bg-lime-50 text-lime-700"
          >
            Quản lý giai đoạn
          </Button>
        </div>
      ) : filteredTasks.length === 0 && tasks.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-1">Chưa có công việc nào</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Bạn chưa có công việc nào. Hãy thêm công việc đầu tiên để bắt đầu.
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <Search className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-1">Không tìm thấy kết quả</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Không tìm thấy công việc nào phù hợp với tìm kiếm của bạn.
          </p>
          <Button
            onClick={() => {
              setSearchTerm("")
              setSelectedStageFilter("")
            }}
            variant="outline"
            className="mt-4 border-lime-200 hover:bg-lime-50 text-lime-700"
          >
            <X className="mr-2 h-4 w-4" />
            Xóa bộ lọc
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => {
            const stage = getStageById(task.giaidoanId)
            return (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div
                      className="w-10 h-10 rounded-full mr-3 flex items-center justify-center text-white"
                      style={{ backgroundColor: stage?.color || "#888888" }}
                    >
                      <IconPicker.Icon name={task.icon || "FileText"} className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800">{task.tenCongViec}</h3>
                      <p className="text-sm text-slate-500">{stage?.tengiaidoan || "Không có giai đoạn"}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(task)}
                      className="h-8 w-8 text-slate-500 hover:text-lime-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(task)}
                      className="h-8 w-8 text-slate-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Task Dialog - Mobile */}
      {isMobile ? (
        <>
          <Drawer open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DrawerContent className="px-4 pb-6 pt-4">
              <DrawerHeader className="px-0 pb-4">
                <DrawerTitle className="text-xl font-bold text-slate-800">Thêm công việc mới</DrawerTitle>
                <DrawerDescription className="text-slate-500">
                  Nhập thông tin công việc mới. Nhấn Lưu khi hoàn tất.
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
                    onClick={handleAddTask}
                    disabled={isSubmitting || !formData.tenCongViec || !formData.giaidoanId}
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
                <DrawerTitle className="text-xl font-bold text-slate-800">Chỉnh sửa công việc</DrawerTitle>
                <DrawerDescription className="text-slate-500">
                  Chỉnh sửa thông tin công việc. Nhấn Lưu khi hoàn tất.
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
                    onClick={handleEditTask}
                    disabled={isSubmitting || !selectedTask?.tenCongViec || !selectedTask?.giaidoanId}
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
          {/* Add Task Dialog - Desktop */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Thêm công việc mới</DialogTitle>
                <DialogDescription>Nhập thông tin công việc mới. Nhấn Lưu khi hoàn tất.</DialogDescription>
              </DialogHeader>
              {ModalContent}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-lime-200">
                  Hủy
                </Button>
                <Button
                  onClick={handleAddTask}
                  disabled={isSubmitting || !formData.tenCongViec || !formData.giaidoanId}
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

          {/* Edit Task Dialog - Desktop */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa công việc</DialogTitle>
                <DialogDescription>Chỉnh sửa thông tin công việc. Nhấn Lưu khi hoàn tất.</DialogDescription>
              </DialogHeader>
              {ModalContent}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-lime-200">
                  Hủy
                </Button>
                <Button
                  onClick={handleEditTask}
                  disabled={isSubmitting || !selectedTask?.tenCongViec || !selectedTask?.giaidoanId}
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
              Bạn có chắc chắn muốn xóa công việc "{selectedTask?.tenCongViec}"? Hành động này không thể hoàn tác và có
              thể ảnh hưởng đến dữ liệu nhật ký canh tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
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

export default TaskManager


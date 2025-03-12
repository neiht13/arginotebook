"use client"

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon } from 'lucide-react'
import { toast } from "react-toastify"
import { format, parse } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import ButtonX from "../../components/Button"
import { Button } from "@/components/ui/button"




// ==========================================
// Phần types và AgrochemicalForm giữ nguyên
// ==========================================
interface Agrochemical {
  name: string
  type: string
  isOrganic: boolean
  lieuLuong: number
  donViTinh: string
  donGia?: number
}

interface TimelineEntry {
  _id?: string
  congViec?: string
  giaiDoan?: string
  ngayThucHien?: string
  chiPhiCong?: number
  chiPhiVatTu?: number
  muaVu?: string
  soLuongCong?: number
  soLuongVatTu?: number
  agrochemicals?: Agrochemical[]
  images?: File[]
}

interface AddEditEntryModalProps {
  onAddEntry: (entry: TimelineEntry) => void
  onEditEntry: (entry: TimelineEntry) => void
  seasons: { _id: string; muavu: string; nam: number }[]
  stages: { _id: string; tengiaidoan: string }[]
  tasks: { _id: string; tenCongViec: string; giaidoanId: string }[]
}

export interface AddEditEntryModalHandle {
  open: (entry?: TimelineEntry) => void
  close: () => void
}

import AgrochemicalForm from "./AgrochemicalForm"
import CurrencyInput from "@/components/ui/input-currency"

const AddEditEntryModal = forwardRef<AddEditEntryModalHandle, AddEditEntryModalProps>(
  ({ onAddEntry, onEditEntry, seasons, stages, tasks }, ref) => {
    const [open, setOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [currentEntry, setCurrentEntry] = useState<Partial<TimelineEntry>>({
      agrochemicals: [],
      images: []
    })

    // Quản lý ngày chọn
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

    // Quản lý stageId để lọc tasks
    const [selectedStageId, setSelectedStageId] = useState<string>("")

    useImperativeHandle(ref, () => ({
      open: (entry?: TimelineEntry) => {
        if (entry) {
          setIsEditMode(true)
          setCurrentEntry(entry)
          // parse ngày
          if (entry.ngayThucHien) {
            const parsedDate = parse(entry.ngayThucHien, "dd-MM-yyyy", new Date(), {
              locale: vi,
            })
            setSelectedDate(parsedDate)
          } else {
            setSelectedDate(undefined)
          }

          // Nếu entry đã có "giaiDoan" dạng tên, ta cần map ngược về stageId (nếu cần).
          // Hoặc nếu entry đã lưu "stageId" thì setSelectedStageId(entry.stageId).
          // Ở đây demo giả sử ta chỉ lưu "giaiDoan" = stage.tengiaidoan.
          // => Bạn cần tùy biến theo logic thực tế:
          // Tìm stage có tên = entry.giaiDoan
          const foundStage = stages.find(
            (s) => s.tengiaidoan === entry.giaiDoan
          )
          setSelectedStageId(foundStage?._id || "")

        } else {
          setIsEditMode(false)
          setCurrentEntry({ agrochemicals: [], images: [] })
          setSelectedDate(undefined)
          setSelectedStageId("")
        }
        setOpen(true)
      },
      close: () => setOpen(false),
    }))

    // Hàm xử lý thay đổi ngày
    const handleDateChange = (date: Date | undefined) => {
      setSelectedDate(date)
      if (date) {
        const formattedDate = format(date, "dd-MM-yyyy", { locale: vi })
        setCurrentEntry((prev) => ({ ...prev, ngayThucHien: formattedDate }))
      } else {
        setCurrentEntry((prev) => ({ ...prev, ngayThucHien: undefined }))
      }
    }

    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target
      setCurrentEntry((prev) => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: keyof TimelineEntry, value: string) => {
      setCurrentEntry((prev) => ({ ...prev, [name]: value }))
    }

    // Thay vì handleSelectChange cho stage, ta tách riêng để setSelectedStageId và set giaiDoan
    const handleStageSelect = (stageId: string) => {
      setSelectedStageId(stageId)
      // Lấy stage ra
      const stage = stages.find((s) => s._id === stageId)
      if (stage) {
        // Lưu tên giai đoạn vào currentEntry
        setCurrentEntry((prev) => ({
          ...prev,
          giaiDoan: stage.tengiaidoan,
        }))
      } else {
        setCurrentEntry((prev) => ({
          ...prev,
          giaiDoan: "",
        }))
      }
    }

    // Lọc danh sách công việc theo stage đã chọn
    const filteredTasks = tasks.filter((t) => t.giaidoanId === selectedStageId)

    const addAgrochemical = (agrochemical: Agrochemical) => {
      setCurrentEntry((prev) => ({
        ...prev,
        agrochemicals: [...(prev.agrochemicals || []), agrochemical],
      }))
    }

    const handleSubmit = () => {
        console.log(currentEntry)
      // Các trường bắt buộc
      if (currentEntry.congViec && currentEntry.giaiDoan && currentEntry.ngayThucHien) {
        if (isEditMode) {
          onEditEntry(currentEntry as TimelineEntry)
          toast.success("Chỉnh sửa công việc thành công!")
        } else {
          onAddEntry(currentEntry as TimelineEntry)
          toast.success("Thêm mới công việc thành công!")
        }
        setCurrentEntry({ agrochemicals: [], images: [] })
        setSelectedDate(undefined)
        setSelectedStageId("")
        setOpen(false)
      } else {
        toast.error("Vui lòng điền đầy đủ các trường bắt buộc (Công việc, Giai đoạn, Ngày thực hiện).")
      }
    }

    useEffect(() => {
      if (!open) {
        setCurrentEntry({ agrochemicals: [], images: [] })
        setIsEditMode(false)
        setSelectedDate(undefined)
        setSelectedStageId("")
      }
    }, [open])


    // Hàm định dạng tiền tệ (nếu cần)
    const formatCurrency = (amount: any) => {
      if (!amount) return '';
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(Number(amount))
    }
    
    const handleCurrencyChange = (e) => {
      const { name, value } = e;
      setCurrentEntry((prev) => ({ ...prev, [name]: value }));
    };


    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 rounded-lg shadow-lg border-0 max-h-[90vh] overflow-scroll custom-scrollbar">
          {/* Header */}
          <DialogHeader className="bg-gradient-to-r from-lime-500 to-lime-800 px-4 py-3">
            <DialogTitle className="text-white text-lg font-bold">
              {isEditMode ? "Chỉnh sửa công việc" : "Thêm mới công việc"}
            </DialogTitle>
          </DialogHeader>

          {/* Body */}
          <div className="px-6 py-4 space-y-4 bg-white">
            {/* Trường Mùa vụ (Select) */}
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="muaVu" className="text-right text-sm font-medium">
                Mùa vụ
              </Label>
              <Select
                value={currentEntry.muaVu || ""}
                onValueChange={(value) => handleSelectChange("muaVu", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn mùa vụ" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map((season) => (
                    <SelectItem key={season._id} value={season.muavu}>
                      {season.muavu} - {season.nam}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Trường Giai đoạn (Select) */}
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="giaiDoan" className="text-right text-sm font-medium">
                Giai đoạn
              </Label>
              <Select
                value={selectedStageId}
                onValueChange={handleStageSelect}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn giai đoạn" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage._id} value={stage._id}>
                      {stage.tengiaidoan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Trường Công việc (Select) - dựa trên stage đã chọn */}
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="congViec" className="text-right text-sm font-medium">
                Công việc
              </Label>
              <Select
                value={currentEntry.congViec || ""}
                onValueChange={(value) => handleSelectChange("congViec", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn công việc" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTasks.map((task) => (
                    <SelectItem key={task._id} value={task.tenCongViec}>
                      {task.tenCongViec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Trường Ngày thực hiện */}
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="ngayThucHien" className="text-right text-sm font-medium">
                Ngày thực hiện
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate
                      ? format(selectedDate, "dd-MM-yyyy", { locale: vi })
                      : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

              <div className={"grid grid-cols-4 items-center gap-2"}>
                  <Label htmlFor="chiPhiCong" className="text-right text-sm font-medium">
                      Chi phí công
                  </Label>
                  <div className="grid grid-cols-4 col-span-3 items-center gap-2">
                      <CurrencyInput
                          id="chiPhiCong"
                          name="chiPhiCong"
                          placeholder="0"
                          value={currentEntry.chiPhiCong || 0}
                          onChange={handleCurrencyChange}
                          className={"col-span-2 gap-0"}
                      />
                      <Label htmlFor="soLuongCong" className="text-right text-sm font-medium">
                          Số lượng
                      </Label>
                      <Input
                          id="soLuongCong"
                          name="soLuongCong"
                          type="number"
                          placeholder="0"
                          value={currentEntry.soLuongCong || "0"}
                          onChange={handleInputChange}
                      />
                  </div>
              </div>



              <div className={"grid grid-cols-4 items-center gap-2"}>
                  <Label htmlFor="chiPhiVatTu" className="text-right text-sm font-medium">
                      Chi phí vật tư
                  </Label>
                  <div className="grid grid-cols-4 col-span-3 items-center gap-2">
                      <Input
                          id="chiPhiVatTu"
                          name="chiPhiVatTu"
                      type="text"
                      placeholder="0"
                      value={formatCurrency(currentEntry.chiPhiVatTu || "0")}
                      onChange={handleCurrencyChange}
                      className="col-span-2"
                  />
                  <Label htmlFor="soLuongVatTu" className="text-right text-sm font-medium">
                      Số lượng
                  </Label>
                  <Input
                      id="soLuongVatTu"
                      name="soLuongVatTu"
                      type="number"
                      placeholder="0"
                      value={currentEntry.soLuongVatTu || ""}
                      onChange={handleInputChange}
                      className=""
                  />
                  </div>
              </div>



              { (currentEntry.congViec === "Bón phân" || currentEntry.congViec === "Phun thuốc") &&
                  <div>
                      <div className="grid grid-cols-4 items-start gap-2">
                          <Label className="text-right text-sm font-medium pt-1">
                              Vật tư sử dụng
                          </Label>
                          <div className="col-span-3">
                              <AgrochemicalForm onAdd={addAgrochemical} />
                          </div>
                      </div>

                      {currentEntry.agrochemicals && currentEntry.agrochemicals.length > 0 && (
                          <div className="grid grid-cols-4 items-start gap-2">
                              <Label className="text-right text-sm font-medium pt-1">
                                  Đã thêm:
                              </Label>
                              <ul className="col-span-3 list-disc pl-5 space-y-1">
                                  {currentEntry.agrochemicals.map((item, index) => (
                                      <li key={index} className="text-sm text-slate-700">
                                          {item.name} - {item.type} - {item.isOrganic ? "Hữu cơ" : "Không hữu cơ"} -{" "}
                                          {item.lieuLuong} {item.donViTinh}
                                          {item.donGia && ` (${formatCurrency(item.donGia)}/${item.donViTinh})`}
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      )}
                  </div>
              }


            {/* Nút submit */}
            <div className="flex justify-center">
              <ButtonX onClick={handleSubmit}>
                {isEditMode ? "Chỉnh sửa công việc" : "Thêm mới công việc"}
              </ButtonX>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
)
AddEditEntryModal.displayName = "AddEditEntryModal"

export default AddEditEntryModal
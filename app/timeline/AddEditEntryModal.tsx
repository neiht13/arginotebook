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
import { CalendarIcon } from "lucide-react"
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
import ButtonX from "../components/Button"
import { Button } from "@/components/ui/button"


const seasons = [
  {
    "_id": "673c2dd01f8b41e75f4d39e8",
    "muavu": "Thu Đông",
    "nam": "2024",
    "ngaybatdau": "01-09-2024",
    "phuongphap": "Máy bay",
    "giong": "OM 18",
    "dientich": 10,
    "soluong": 100,
    "giagiong": 17000,
    "stt": null,
    "ghichu": "",
    "uId": "673c02b70df7665d45340b11",
    "sothua": 5,
    "chiphikhac": 30000
  }
]

const stages = [
  {
      "_id": "6583a87a45e4c89f207aed1c",
      "color": "#BB4D00",
      "ghichu": "Trước sạ",
      "giaidoan": 1,
      "tengiaidoan": "Làm đất - xuống giống",
      "xId": "tng"
  },
  {
      "_id": "6583aadf45e4c89f207aed1f",
      "color": "#1D8300",
      "ghichu": "Từ ngày 21 đến 40 ngày sau sạ",
      "giaidoan": 3,
      "tengiaidoan": "Đẻ nhánh",
      "xId": "tng"
  },
  {
      "_id": "6583aadf45e4c89f207aed21",
      "color": "#FFFF00",
      "ghichu": "Từ ngày 61 đến 80 ngày sau sạ",
      "giaidoan": 5,
      "tengiaidoan": "Trổ chín",
      "xId": "tng"
  },
  {
      "_id": "6583aadf45e4c89f207aed1e",
      "color": "#31D304",
      "ghichu": "Từ ngày 1 đến 20  ngày sau sạ",
      "giaidoan": 2,
      "tengiaidoan": "Lúa mạ",
      "xId": "tng"
  },
  {
      "_id": "6583aadf45e4c89f207aed20",
      "color": "#B7F305",
      "ghichu": "Từ ngày 41 đến 60 ngày sau sạ",
      "giaidoan": 4,
      "tengiaidoan": "Làm đòng",
      "xId": "tng"
  },
  {
      "_id": "6583aadf45e4c89f207aed22",
      "color": "#FFAD00",
      "ghichu": "Trên 80 ngày",
      "giaidoan": 6,
      "tengiaidoan": "Chín, thu hoạch",
      "xId": "tng"
  },
]

const tasks = [
  {
      "_id": "66e8ef9053bd51ade39bcf52",
      "id": "6583b94045e4c89f207aed46",
      "stt": 3,
      "tenCongViec": "Đánh rãnh",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,3",
      "giaidoanId": "6583a87a45e4c89f207aed1c",
      "tenGiaiDoan": "Làm đất - xuống giống",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf53",
      "id": "6583b94045e4c89f207aed48",
      "stt": 5,
      "tenCongViec": "Trạc đất",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2",
      "giaidoanId": "6583a87a45e4c89f207aed1c",
      "tenGiaiDoan": "Làm đất - xuống giống",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf54",
      "id": "6583b94045e4c89f207aed45",
      "stt": 2,
      "tenCongViec": "Cày đất",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2",
      "giaidoanId": "6583a87a45e4c89f207aed1c",
      "tenGiaiDoan": "Làm đất - xuống giống",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf55",
      "id": "6583b94045e4c89f207aed4e",
      "stt": 11,
      "tenCongViec": "Phun thuốc",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,5,6,7,8",
      "giaidoanId": "6583aadf45e4c89f207aed1e",
      "tenGiaiDoan": "Lúa mạ",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf56",
      "id": "6583b94045e4c89f207aed57",
      "stt": 20,
      "tenCongViec": "Phun thuốc",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4",
      "giaidoanId": "6583aadf45e4c89f207aed20",
      "tenGiaiDoan": "Trổ đồng",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf57",
      "id": "6583b94045e4c89f207aed5c",
      "stt": 25,
      "tenCongViec": "Công việc khác",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4,5,6,7,8,9,10,11",
      "giaidoanId": "6583aadf45e4c89f207aed21",
      "tenGiaiDoan": "Lúa chín",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf58",
      "id": "6583b94045e4c89f207aed50",
      "stt": 13,
      "tenCongViec": "Công việc khác",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4,5,6,7,8,9,10,11",
      "giaidoanId": "6583aadf45e4c89f207aed1e",
      "tenGiaiDoan": "Lúa mạ",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf59",
      "id": "6583b94045e4c89f207aed4d",
      "stt": 10,
      "tenCongViec": "Bón phân",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4",
      "giaidoanId": "6583aadf45e4c89f207aed1e",
      "tenGiaiDoan": "Lúa mạ",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf5a",
      "id": "6583b94045e4c89f207aed51",
      "stt": 14,
      "tenCongViec": "Bơm nước",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,12",
      "giaidoanId": "6583aadf45e4c89f207aed1f",
      "tenGiaiDoan": "Đẻ nhánh",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf5b",
      "id": "6583b94045e4c89f207aed54",
      "stt": 17,
      "tenCongViec": "Phun thuốc",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4,5,6,7,8,9,10,11",
      "giaidoanId": "6583aadf45e4c89f207aed1f",
      "tenGiaiDoan": "Đẻ nhánh",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf5c",
      "id": "6583b94045e4c89f207aed52",
      "stt": 15,
      "tenCongViec": "Bón phân",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4",
      "giaidoanId": "6583aadf45e4c89f207aed1f",
      "tenGiaiDoan": "Đẻ nhánh",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf5d",
      "id": "6583b94045e4c89f207aed5e",
      "stt": 27,
      "tenCongViec": "Bón phân",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4",
      "giaidoanId": "6583aadf45e4c89f207aed22",
      "tenGiaiDoan": "Chín, thu hoạch",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf5e",
      "id": "6583b94045e4c89f207aed59",
      "stt": 22,
      "tenCongViec": "Bơm nước",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,12",
      "giaidoanId": "6583aadf45e4c89f207aed21",
      "tenGiaiDoan": "Lúa chín",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf5f",
      "id": "6583b94045e4c89f207aed5b",
      "stt": 23,
      "tenCongViec": "Phun thuốc",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,5,6,7,8",
      "giaidoanId": "6583aadf45e4c89f207aed21",
      "tenGiaiDoan": "Lúa chín",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf60",
      "id": "6583b94045e4c89f207aed4a",
      "stt": 7,
      "tenCongViec": "Xuống giống",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3",
      "giaidoanId": "6583a87a45e4c89f207aed1c",
      "tenGiaiDoan": "Làm đất - xuống giống",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf61",
      "id": "6583b94045e4c89f207aed4c",
      "stt": 9,
      "tenCongViec": "Bơm nước",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,12",
      "giaidoanId": "6583aadf45e4c89f207aed1e",
      "tenGiaiDoan": "Lúa mạ",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf62",
      "id": "6583b94045e4c89f207aed5f",
      "stt": 28,
      "tenCongViec": "Phun thuốc",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,5,6,7,8",
      "giaidoanId": "6583aadf45e4c89f207aed22",
      "tenGiaiDoan": "Chín, thu hoạch",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf63",
      "id": "6583b94045e4c89f207aed60",
      "stt": 29,
      "tenCongViec": "Thu hoạch",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,12",
      "giaidoanId": "6583aadf45e4c89f207aed22",
      "tenGiaiDoan": "Chín, thu hoạch",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf64",
      "id": "6583b94045e4c89f207aed4b",
      "stt": 8,
      "tenCongViec": "Công việc khác",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4,5,6,7,8,9,10,11",
      "giaidoanId": "6583a87a45e4c89f207aed1c",
      "tenGiaiDoan": "Làm đất - xuống giống",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf65",
      "id": "6583b94045e4c89f207aed49",
      "stt": 6,
      "tenCongViec": "Xới đất",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2",
      "giaidoanId": "6583a87a45e4c89f207aed1c",
      "tenGiaiDoan": "Làm đất - xuống giống",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf66",
      "id": "6583b94045e4c89f207aed53",
      "stt": 16,
      "tenCongViec": "Phun thuốc",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,5,6,7,8",
      "giaidoanId": "6583aadf45e4c89f207aed1f",
      "tenGiaiDoan": "Đẻ nhánh",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf67",
      "id": "6583b94045e4c89f207aed44",
      "stt": 1,
      "tenCongViec": "Bón phân",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4",
      "giaidoanId": "6583a87a45e4c89f207aed1c",
      "tenGiaiDoan": "Làm đất - xuống giống",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf68",
      "id": "6583b94045e4c89f207aed47",
      "stt": 4,
      "tenCongViec": "Phun thuốc",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,5",
      "giaidoanId": "6583a87a45e4c89f207aed1c",
      "tenGiaiDoan": "Làm đất - xuống giống",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf69",
      "id": "6583b94045e4c89f207aed56",
      "stt": 19,
      "tenCongViec": "Bón phân",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4",
      "giaidoanId": "6583aadf45e4c89f207aed20",
      "tenGiaiDoan": "Trổ đồng",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf6a",
      "id": "6583b94045e4c89f207aed55",
      "stt": 18,
      "tenCongViec": "Bơm nước",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,12",
      "giaidoanId": "6583aadf45e4c89f207aed20",
      "tenGiaiDoan": "Trổ đồng",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf6b",
      "id": "6583b94045e4c89f207aed58",
      "stt": 21,
      "tenCongViec": "Công việc khác",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4,5,6,7,8,9,10,11",
      "giaidoanId": "6583aadf45e4c89f207aed20",
      "tenGiaiDoan": "Trổ đồng",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf6c",
      "id": "6583b94045e4c89f207aed5a",
      "stt": 23,
      "tenCongViec": "Bón phân",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4",
      "giaidoanId": "6583aadf45e4c89f207aed21",
      "tenGiaiDoan": "Lúa chín",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf6d",
      "id": "6583b94045e4c89f207aed61",
      "stt": 30,
      "tenCongViec": "Công việc khác",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4,5,6,7,8,9,10,11",
      "giaidoanId": "6583aadf45e4c89f207aed22",
      "tenGiaiDoan": "Chín, thu hoạch",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf6e",
      "id": "6583b94045e4c89f207aed5d",
      "stt": 26,
      "tenCongViec": "Bơm nước",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,12",
      "giaidoanId": "6583aadf45e4c89f207aed22",
      "tenGiaiDoan": "Chín, thu hoạch",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf6f",
      "id": "6583b94045e4c89f207aed4f",
      "stt": 12,
      "tenCongViec": "Cấy dặm",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,10,11",
      "giaidoanId": "6583aadf45e4c89f207aed1e",
      "tenGiaiDoan": "Lúa mạ",
      "xId": "tng"
  },
]

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
}

interface AddEditEntryModalProps {
  onAddEntry: (entry: TimelineEntry) => void
  onEditEntry: (entry: TimelineEntry) => void
}

export interface AddEditEntryModalHandle {
  open: (entry?: TimelineEntry) => void
  close: () => void
}

import AgrochemicalForm from "./AgrochemicalForm"

const AddEditEntryModal = forwardRef<AddEditEntryModalHandle, AddEditEntryModalProps>(
  ({ onAddEntry, onEditEntry }, ref) => {
    const [open, setOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [currentEntry, setCurrentEntry] = useState<Partial<TimelineEntry>>({
      agrochemicals: [],
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
          setCurrentEntry({ agrochemicals: [] })
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
        setCurrentEntry({ agrochemicals: [] })
        setSelectedDate(undefined)
        setSelectedStageId("")
        setOpen(false)
      } else {
        toast.error("Vui lòng điền đầy đủ các trường bắt buộc (Công việc, Giai đoạn, Ngày thực hiện).")
      }
    }

    useEffect(() => {
      if (!open) {
        setCurrentEntry({ agrochemicals: [] })
        setIsEditMode(false)
        setSelectedDate(undefined)
        setSelectedStageId("")
      }
    }, [open])

    // Hàm định dạng tiền tệ (nếu cần)
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount)
    }

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
                      <Input
                          id="chiPhiCong"
                          name="chiPhiCong"
                          type="number"
                          placeholder="0"
                          value={currentEntry.chiPhiCong || ""}
                          onChange={handleInputChange}
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
                          value={currentEntry.soLuongCong || ""}
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
                      type="number"
                      placeholder="0"
                      value={currentEntry.chiPhiVatTu || ""}
                      onChange={handleInputChange}
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
// components/EnhancedAgriculturalTimeline.tsx

"use client"

import React, { useState, useRef, useEffect } from "react"
import { TimelineEntry } from "./types"
import AddEditEntryModal, { AddEditEntryModalHandle } from "./AddEditEntryModal"
import TimelineEntryComponent from "./TimelineEntryComponent"
import { PlusCircleIcon, CalendarIcon } from "lucide-react"
import Spinner from "@/components/ui/spinner"
import ButtonX from "../../components/Button"
import {Button} from "@/components/ui/button"

// ShadCN (hoặc lib UI khác của bạn)
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parse } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import axios from "axios"

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

interface EnhancedAgriculturalTimelineProps {
  data: TimelineEntry[]
  onAddEntry: (entry: TimelineEntry) => void
  isLoading: boolean
}

function getAllSeasonsFromData(data: TimelineEntry[]): string[] {
  const allSeasons = data && data.length > 0
      && data
      .map((entry) => entry.muaVu || "")
      .filter((s) => s !== "") || []
  return Array.from(new Set(allSeasons))
}

// Kiểu dateRange cho mode="range"
interface DateRange {
  from?: Date
  to?: Date
}

const EnhancedAgriculturalTimeline: React.FC<EnhancedAgriculturalTimelineProps> = ({
                                                                                     data: initialData,
                                                                                     isLoading,
                                                                                     onAddEntry,
                                                                                   }) => {
  const [data, setData] = useState<TimelineEntry[]>([])
  const [filteredData, setFilteredData] = useState<TimelineEntry[]>([])

  // Lọc theo mùa vụ
  const [seasonFilter, setSeasonFilter] = useState<string>("")

  // Lọc theo khoảng thời gian (từ ngày - đến ngày) bằng 1 dateRange
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined })

  // Ref cho modal
  const modalRef = useRef<AddEditEntryModalHandle>(null)

  console.log("initialData", initialData);
  
  useEffect(() => {
    setData(initialData)
  }, [initialData])

  useEffect(() => {
    filterData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, seasonFilter, dateRange])

  // Hàm lọc data
  const filterData = () => {
    if (!seasonFilter && !dateRange.from && !dateRange.to) {
      setFilteredData(data)
      return
    }

    const newFiltered = data.filter((item) => {
      let seasonCondition = true
      let dateCondition = true

      // Lọc theo mùa vụ
      if (seasonFilter) {
        seasonCondition = item.muaVu === seasonFilter
      }

      // Lọc theo khoảng thời gian
      if (dateRange.from || dateRange.to) {
        if (item.ngayThucHien) {
          // item.ngayThucHien: "dd-MM-yyyy"
          const itemDate = parse(
              item.ngayThucHien,
              "dd-MM-yyyy",
              new Date(),
              { locale: vi }
          )

          // Nếu có dateRange.from
          if (dateRange.from && itemDate < dateRange.from) {
            dateCondition = false
          }
          // Nếu có dateRange.to
          if (dateRange.to && itemDate > dateRange.to) {
            dateCondition = false
          }
        }
      }

      return seasonCondition && dateCondition
    })

    setFilteredData(newFiltered)
  }

  // Thêm mới
  const handleAddEntry = (newEntry: TimelineEntry) => {
    setData((prev) => [...prev, newEntry])
    onAddEntry(newEntry)
  }

  // Chỉnh sửa
  const handleEditEntry = (updatedEntry: TimelineEntry) => {

    axios.post(`/api/nhatky`, updatedEntry)
    setData((prev) =>
        prev.map((item) => (item._id === updatedEntry._id ? updatedEntry : item))
    )
  }

  const openAddModal = () => {
    modalRef.current?.open()
  }

  const openEditModal = (entry: TimelineEntry) => {
    modalRef.current?.open(entry)
  }

  // Danh sách mùa vụ
  const allSeasons = getAllSeasonsFromData(data)

  // Hiển thị text cho khoảng ngày
  const displayRangeText = () => {
    const { from, to } = dateRange
    if (!from && !to) return "Chọn khoảng ngày"
    const fromText = from ? format(from, "dd-MM-yyyy", { locale: vi }) : "???"
    const toText = to ? format(to, "dd-MM-yyyy", { locale: vi }) : "???"
    return `${fromText} → ${toText}`
  }

  return (
      <div className="max-w-3xl mx-auto my-8 flow-root">
        {isLoading ? (
            <Spinner />
        ) : (
            <div className="mb-4 flex items-center justify-between">
              {/* Bên trái: bộ lọc mùa + bộ lọc dateRange */}
              <div className="flex items-center gap-2">
                {/* Lọc mùa vụ */}
                <Select
                    value={seasonFilter}
                    onValueChange={(value) => setSeasonFilter(value)}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Mùa vụ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả mùa vụ</SelectItem>
                    {allSeasons.map((season) => (
                        <SelectItem key={season} value={season}>
                          {season}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Chọn khoảng ngày bằng 1 icon date nhỏ */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "p-2 text-sm justify-start font-normal flex items-center gap-1 hover:shadow-sm"
                        )}
                    >
                      <CalendarIcon className="w-4 h-4" />
                      {/* Hiển thị text "dd-MM-yyyy -> dd-MM-yyyy" */}
                      <span className="hidden sm:inline-flex">
                    {displayRangeText()}
                  </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start">
                    <Calendar
                        mode="range"
                        // "selected" kiểu { from?: Date; to?: Date } | undefined
                        selected={dateRange}
                        onSelect={(range) => {
                          // range chắc chắn có from, to, or undefined
                          setDateRange(range || {})
                        }}
                        initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Bên phải: nút Thêm mới */}
              <ButtonX
                  onClick={openAddModal}
                  className="flex items-center text-slate-700 gap-2"
                  icon={<PlusCircleIcon className="h-5 w-5" />}
              >
                Thêm mới
              </ButtonX>
            </div>
        )}

        {/* Danh sách Timeline */}
        <ul role="list" className="-mb-8">
          {filteredData.map((entry, index) => (
              <li key={entry._id}>
                <TimelineEntryComponent
                    data={entry}
                    isLast={index === filteredData.length - 1}
                    onEdit={openEditModal}
                />
              </li>
          ))}
        </ul>

        {/* Modal thêm/sửa */}
        <AddEditEntryModal
            ref={modalRef}
            onAddEntry={handleAddEntry}
            onEditEntry={handleEditEntry}
            seasons={seasons}
            stages={stages}
            tasks={tasks}
        />
      </div>
  )
}

export default EnhancedAgriculturalTimeline

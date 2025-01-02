// components/EnhancedAgriculturalTimeline.tsx

"use client"

import React, { useState, useRef, useEffect } from "react"
import { TimelineEntry } from "./types"
import AddEditEntryModal, { AddEditEntryModalHandle } from "./AddEditEntryModal"
import TimelineEntryComponent from "./TimelineEntryComponent"
import { PlusCircleIcon, CalendarIcon } from "lucide-react"
import Spinner from "@/components/ui/spinner"
import ButtonX from "../components/Button"
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

// =====================
//     Các Interfaces
// =====================
interface EnhancedAgriculturalTimelineProps {
  data: TimelineEntry[]
  onAddEntry: (entry: TimelineEntry) => void
  isLoading: boolean
}

function getAllSeasonsFromData(data: TimelineEntry[]): string[] {
  const allSeasons = data
      .map((entry) => entry.muaVu || "")
      .filter((s) => s !== "")
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
        />
      </div>
  )
}

export default EnhancedAgriculturalTimeline

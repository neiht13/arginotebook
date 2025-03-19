"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { TimelineEntry } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
import { format, parse, isWithinInterval } from "date-fns"
import { vi } from "date-fns/locale"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarIcon, Filter, Search, PlusCircle, X } from "lucide-react"
import ModernTimelineEntry from "./ModernTimelineEntry"
import EnhancedAddEditModal from "./EnhancedAddEditModal"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

interface ModernTimelineProps {
  data: TimelineEntry[]
  onAddEntry: (entry: TimelineEntry) => void
}

const ModernTimeline: React.FC<ModernTimelineProps> = ({ data, onAddEntry }) => {
  const { toast } = useToast()
  const [filteredData, setFilteredData] = useState<TimelineEntry[]>(data)
  const [searchTerm, setSearchTerm] = useState("")
  const [seasonFilter, setSeasonFilter] = useState<string>("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [showFilters, setShowFilters] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<TimelineEntry | null>(null)

  // Get unique seasons from data
  const seasons = Array.from(new Set(data.map((item) => item.muaVu))).filter(Boolean)

  useEffect(() => {
    applyFilters()
  }, [data, searchTerm, seasonFilter, dateRange])

  const applyFilters = () => {
    let filtered = [...data]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.congViec?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.giaiDoan?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply season filter
    if (seasonFilter) {
      filtered = filtered.filter((item) => item.muaVu === seasonFilter)
    }

    // Apply date range filter
    if (dateRange?.from) {
      filtered = filtered.filter((item) => {
        const itemDate = parse(item.ngayThucHien, "dd-MM-yyyy", new Date())

        if (dateRange.from && dateRange.to) {
          return isWithinInterval(itemDate, {
            start: dateRange.from,
            end: dateRange.to,
          })
        } else if (dateRange.from) {
          return itemDate >= dateRange.from
        }

        return true
      })
    }

    setFilteredData(filtered)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSeasonFilter("")
    setDateRange(undefined)
  }

  const handleOpenAddModal = () => {
    setCurrentEntry(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (entry: TimelineEntry) => {
    setCurrentEntry(entry)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentEntry(null)
  }

  const handleAddOrUpdateEntry = (entry: TimelineEntry) => {
    onAddEntry(entry)
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
        <div className="relative w-full md:w-auto flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Tìm kiếm công việc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 h-10 w-full"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-8 w-8 text-slate-500"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center h-10"
        >
          <Filter className="mr-2 h-4 w-4" />
          Bộ lọc
          {(seasonFilter || dateRange) && (
            <Badge variant="secondary" className="ml-2 bg-lime-100 text-lime-800">
              {(seasonFilter ? 1 : 0) + (dateRange ? 1 : 0)}
            </Badge>
          )}
        </Button>

        <Button
          id="add-entry-button"
          variant="default"
          size="sm"
          onClick={handleOpenAddModal}
          className="bg-lime-600 hover:bg-lime-700 text-white h-10 md:hidden"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </div>

      {/* Expanded filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-slate-50 rounded-lg flex flex-col md:flex-row gap-4 items-start">
              {/* Season filter */}
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-slate-700 mb-1">Mùa vụ</label>
                <Select value={seasonFilter} onValueChange={setSeasonFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tất cả mùa vụ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả mùa vụ</SelectItem>
                    {seasons.map((season) => (
                      <SelectItem key={season} value={season}>
                        {season}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date range filter */}
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-slate-700 mb-1">Khoảng thời gian</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                          </>
                        ) : (
                          format(dateRange.from, "dd/MM/yyyy")
                        )
                      ) : (
                        "Chọn khoảng thời gian"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      locale={vi}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Clear filters button */}
              <div className="w-full md:w-1/3 flex items-end md:justify-end mt-auto">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-600">
                  <X className="mr-2 h-4 w-4" />
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline entries */}
      <div className="space-y-6 mt-4">
        {filteredData.length > 0 ? (
          filteredData.map((entry, index) => (
            <ModernTimelineEntry
              key={entry._id || index}
              entry={entry}
              onEdit={handleOpenEditModal}
              isLast={index === filteredData.length - 1}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-slate-100 p-3 mb-4">
              <CalendarIcon className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">Không có dữ liệu</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              {searchTerm || seasonFilter || dateRange
                ? "Không tìm thấy dữ liệu phù hợp với bộ lọc. Hãy thử điều chỉnh lại bộ lọc."
                : "Chưa có hoạt động canh tác nào được ghi lại. Hãy thêm hoạt động đầu tiên của bạn."}
            </p>
            {(searchTerm || seasonFilter || dateRange) && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                <X className="mr-2 h-4 w-4" />
                Xóa bộ lọc
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <EnhancedAddEditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddOrUpdateEntry}
        entry={currentEntry}
      />
    </div>
  )
}

export default ModernTimeline


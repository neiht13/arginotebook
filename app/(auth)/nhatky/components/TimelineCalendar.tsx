"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format, isSameDay } from "date-fns"
import { vi } from "date-fns/locale"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarDays, Tractor, Sprout, Droplet, Leaf, Edit } from "lucide-react"
import type { TimelineEntry, TimelineCalendarProps } from "../types"
import { useMediaQuery } from "@/hooks/use-media-query"

const TimelineCalendar = ({ data, onAddEntry, onDeleteEntry, onEditEntry, isOffline }: TimelineCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [entriesForSelectedDate, setEntriesForSelectedDate] = useState<TimelineEntry[]>([])
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Function to parse Vietnamese date format (dd-MM-yyyy)
  const parseVietnameseDate = (dateString: string) => {
    try {
      const [day, month, year] = dateString.split("-").map(Number)
      return new Date(year, month - 1, day)
    } catch (error) {
      console.error("Error parsing date:", error)
      return new Date()
    }
  }

  // Update entries when selected date changes
  useEffect(() => {
    if (selectedDate) {
      const entriesForDate = data.filter((entry) => {
        const entryDate = parseVietnameseDate(entry.ngayThucHien)
        return isSameDay(entryDate, selectedDate)
      })
      setEntriesForSelectedDate(entriesForDate)
    } else {
      setEntriesForSelectedDate([])
    }
  }, [selectedDate, data])

  // Function to get dates with entries for highlighting in calendar
  const getDatesWithEntries = () => {
    const dates = data.map((entry) => parseVietnameseDate(entry.ngayThucHien))
    return dates
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getIconByTask = (taskName: string) => {
    switch (taskName.toLowerCase()) {
      case "đánh rãnh":
      case "cày đất":
        return <Tractor className="h-4 w-4" />
      case "phun thuốc":
        return <Droplet className="h-4 w-4" />
      case "bón phân":
        return <Sprout className="h-4 w-4" />
      case "thu hoạch":
        return <Leaf className="h-4 w-4" />
      default:
        return <Tractor className="h-4 w-4" />
    }
  }

  // Calculate total cost from agrochemicals
  const calculateAgrochemicalCost = (entry: TimelineEntry) => {
    if (!entry.agrochemicals || entry.agrochemicals.length === 0) return 0

    return entry.agrochemicals.reduce((total, item) => {
      const itemCost = (item.donGia || 0) * (item.lieuLuong || 0)
      return total + itemCost
    }, 0)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Calendar */}
        <div className="md:col-span-2">
          <Card className="border border-lime-100 shadow-sm">
            <CardHeader className="pb-2 bg-lime-50">
              <CardTitle className="text-lg font-medium text-lime-800">Lịch hoạt động</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={vi}
                className="rounded-md border items-center"
                modifiers={{
                  hasEntry: getDatesWithEntries(),
                }}
                modifiersStyles={{
                  hasEntry: {
                    backgroundColor: "rgba(132, 204, 22, 0.1)",
                    fontWeight: "bold",
                    color: "#84cc12",
                    borderBottom: "2px solid #84cc16",
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Entries for selected date */}
        <div className="md:col-span-3">
          <Card className="h-full border border-lime-100 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between bg-lime-50">
              <div>
                <CardTitle className="text-lg flex items-center text-lime-800">
                  <CalendarDays className="mr-2 h-5 w-5 text-lime-600" />
                  {selectedDate ? format(selectedDate, "EEEE, dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                </CardTitle>
                <p className="text-sm text-slate-500">
                  {entriesForSelectedDate.length > 0
                    ? `${entriesForSelectedDate.length} hoạt động`
                    : "Không có hoạt động nào"}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <AnimatePresence>
                  {entriesForSelectedDate.length > 0 ? (
                    <div className="space-y-4">
                      {entriesForSelectedDate.map((entry, index) => {
                        const agrochemicalCost = calculateAgrochemicalCost(entry)
                        const totalCost =
                          entry.chiPhiCong + (agrochemicalCost > 0 ? agrochemicalCost : entry.chiPhiVatTu)

                        return (
                          <motion.div
                            key={entry._id || index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card className="overflow-hidden border-l-4 border-l-lime-500 border-t border-r border-b border-lime-100">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center">
                                    <div className="mr-2 p-2 rounded-full bg-lime-100">
                                      {getIconByTask(entry.congViec)}
                                    </div>
                                    <div>
                                      <h3 className="font-medium">{entry.congViec}</h3>
                                      <p className="text-sm text-slate-500">{entry.giaiDoan}</p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEditEntry(entry)}
                                    className="h-8 w-8 hover:bg-lime-100"
                                  >
                                    <Edit className="h-4 w-4 text-lime-600" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-2">
                                  <div className="text-sm">
                                    <span className="text-slate-500">Chi phí công:</span>{" "}
                                    <span className="font-medium">{formatCurrency(entry.chiPhiCong)}</span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-slate-500">Chi phí vật tư:</span>{" "}
                                    <span className="font-medium">
                                      {formatCurrency(agrochemicalCost > 0 ? agrochemicalCost : entry.chiPhiVatTu)}
                                    </span>
                                  </div>
                                </div>

                                {entry.chiTietCongViec && (
                                  <div className="text-sm mt-2 bg-slate-50 p-2 rounded">
                                    <p className="text-slate-700">{entry.chiTietCongViec}</p>
                                  </div>
                                )}

                                {entry.agrochemicals && entry.agrochemicals.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-slate-500 mb-1">Vật tư sử dụng:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {entry.agrochemicals.map((item, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs border-lime-200">
                                          {item.name}: {item.lieuLuong} {item.donViTinh}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
                                  <Badge variant="secondary" className="bg-lime-100 text-lime-800">
                                    {entry.muaVu}
                                  </Badge>
                                  <p className="text-sm font-medium text-lime-600">Tổng: {formatCurrency(totalCost)}</p>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : selectedDate ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <CalendarDays className="h-12 w-12 text-slate-300 mb-4" />
                      <h3 className="text-lg font-medium text-slate-700 mb-1">Không có hoạt động</h3>
                      <p className="text-sm text-slate-500 max-w-sm mb-4">
                        Không có hoạt động nào được ghi lại cho ngày này.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <CalendarDays className="h-12 w-12 text-slate-300 mb-4" />
                      <h3 className="text-lg font-medium text-slate-700">Chọn một ngày</h3>
                      <p className="text-sm text-slate-500 max-w-sm">Chọn một ngày từ lịch để xem hoạt động.</p>
                    </div>
                  )}
                </AnimatePresence>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TimelineCalendar


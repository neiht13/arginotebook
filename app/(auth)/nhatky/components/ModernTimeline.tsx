"use client"

import { useState } from "react"
import type { ModernTimelineProps } from "../types"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import ModernTimelineEntry from "./ModernTimelineEntry"
import { useMediaQuery } from "@/hooks/use-media-query"

const ModernTimeline = ({ data, onAddEntry, onDeleteEntry, onEditEntry, isOffline }: ModernTimelineProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Pagination
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="space-y-6">
      {/* Timeline entries */}
      {data.length > 0 ? (
        <>
          <div className="space-y-6">
            {paginatedData.map((entry, index) => (
              <ModernTimelineEntry
                key={entry._id || index}
                entry={entry}
                onEdit={onEditEntry}
                onDelete={onDeleteEntry}
                isLast={index === paginatedData.length - 1}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-slate-500">
                Hiển thị {startIndex + 1}-{Math.min(startIndex + itemsPerPage, data.length)} trên {data.length} nhật ký
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 border-lime-200 hover:bg-lime-50"
                >
                  Trước
                </Button>
                <span className="text-sm font-medium">
                  Trang {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 border-lime-200 hover:bg-lime-50"
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-slate-100 p-3 mb-4">
            <CalendarIcon className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">Không có dữ liệu</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            Không tìm thấy dữ liệu phù hợp với bộ lọc. Hãy thử điều chỉnh lại bộ lọc.
          </p>
        </div>
      )}
    </div>
  )
}

export default ModernTimeline


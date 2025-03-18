"use client"

import type { TimelineEntry } from "./types"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  CalendarDays,
  Tractor,
  Sprout,
  DollarSign,
  ImageIcon,
  Droplet,
  Leaf,
  Edit,
  TowerControlIcon,
  Clock,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ImageViewer from "./ImageViewer"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { type FC, useState } from "react"

interface ModernTimelineEntryProps {
  entry: TimelineEntry
  onEdit: (entry: TimelineEntry) => void
  isLast: boolean
}

const ModernTimelineEntry: FC<ModernTimelineEntryProps> = ({ entry, onEdit, isLast }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState("")

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
        return <TowerControlIcon className="h-5 w-5" />
      case "trạc đất":
        return <Tractor className="h-5 w-5" />
      case "phun thuốc":
        return <Droplet className="h-5 w-5" />
      case "bón phân":
        return <Sprout className="h-5 w-5" />
      case "thu hoạch":
        return <Leaf className="h-5 w-5" />
      case "công việc khác":
        return <ImageIcon className="h-5 w-5" />
      default:
        return <Tractor className="h-5 w-5" />
    }
  }

  const getStageColor = (stageName: string) => {
    // Map stage names to colors
    const stageColors = {
      "Làm đất - xuống giống": "bg-amber-500",
      "Lúa mạ": "bg-green-500",
      "Đẻ nhánh": "bg-emerald-500",
      "Làm đòng": "bg-lime-500",
      "Trổ chín": "bg-yellow-500",
      "Chín, thu hoạch": "bg-orange-500",
      // Default color if stage name doesn't match
      default: "bg-slate-500",
    }

    return stageColors[stageName] || stageColors.default
  }

  const openImageModal = (imgSrc: string) => {
    setSelectedImage(imgSrc)
    setIsImageModalOpen(true)
  }

  const formatDate = (dateString: string) => {
    try {
      const [day, month, year] = dateString.split("-").map(Number)
      return format(new Date(year, month - 1, day), "dd/MM/yyyy", { locale: vi })
    } catch (error) {
      return dateString
    }
  }

  // Calculate total cost from agrochemicals
  const calculateAgrochemicalCost = () => {
    if (!entry.agrochemicals || entry.agrochemicals.length === 0) return 0

    return entry.agrochemicals.reduce((total, item) => {
      const itemCost = (item.donGia || 0) * (item.lieuLuong || 0)
      return total + itemCost
    }, 0)
  }

  const agrochemicalCost = calculateAgrochemicalCost()
  const totalCost = entry.chiPhiCong + (agrochemicalCost > 0 ? agrochemicalCost : entry.chiPhiVatTu)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-3 lg:left-4 top-6 lg:top-8 bottom-0 w-0.5 bg-gradient-to-b from-lime-500 to-lime-100 z-0" />
      )}

      <div className="relative z-10 flex gap-4">
        {/* Timeline icon */}
        <div
          className={cn(
            "flex-shrink-0 w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-white",
            getStageColor(entry.giaiDoan),
          )}
        >
          {getIconByTask(entry.congViec)}
        </div>

        {/* Content card */}
        <div className="flex-grow">
          <motion.div
            layout
            className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-100 hover:shadow-lg transition-shadow"
          >
            {/* Card header */}
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-500" />
                <span className="font-medium">{formatDate(entry.ngayThucHien)}</span>
                {entry.ngaySauBatDau && (
                  <Badge variant="outline" className="ml-1 text-xs">
                    <Clock className="mr-1 h-3 w-3" />
                    Ngày {entry.ngaySauBatDau}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-lime-100 text-lime-800 hover:bg-lime-200">{entry.muaVu || "Chưa có mùa vụ"}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-lime-600"
                  onClick={() => onEdit(entry)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Card body */}
            <div className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{entry.congViec}</h3>
                    <p className="text-sm text-slate-600">{entry.giaiDoan}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("text-xs border-0", getStageColor(entry.giaiDoan), "bg-opacity-10 text-slate-800")}
                  >
                    {entry.giaiDoan}
                  </Badge>
                </div>

                {/* Always visible content */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-lime-600" />
                    <span className="text-sm">Chi phí công: {formatCurrency(entry.chiPhiCong)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-lime-600" />
                    <span className="text-sm">
                      Chi phí vật tư: {formatCurrency(agrochemicalCost > 0 ? agrochemicalCost : entry.chiPhiVatTu)}
                    </span>
                  </div>
                </div>

                {/* Agrochemicals - Always visible */}
                {entry.agrochemicals && entry.agrochemicals.length > 0 && (
                  <div className="mt-1 pt-3 border-t border-slate-100">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Vật tư sử dụng:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {entry.agrochemicals.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {item.type === "thuốc" ? (
                            <Droplet className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Leaf className="h-4 w-4 text-green-500" />
                          )}
                          <span className="text-sm">
                            {item.name}: {item.lieuLuong} {item.donViTinh}
                            {item.donGia && ` (${formatCurrency(item.donGia)}/${item.donViTinh})`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work details if available */}
                {entry.chiTietCongViec && (
                  <div className="mt-1 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-slate-500" />
                      <h4 className="text-sm font-medium text-slate-700">Chi tiết công việc:</h4>
                    </div>
                    <p className="text-sm text-slate-600 whitespace-pre-line">{entry.chiTietCongViec}</p>
                  </div>
                )}

                {/* Images */}
                {entry.image && entry.image.length > 0 && (
                  <div className="mt-1 pt-3 border-t border-slate-100">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Hình ảnh:</h4>
                    <div className="flex flex-wrap gap-2">
                      {entry.image.map((img, index) => (
                        <div
                          key={index}
                          className="relative group cursor-pointer"
                          onClick={() => openImageModal(img.src)}
                        >
                          <Avatar className="w-16 h-16 rounded-md border border-slate-200">
                            <AvatarImage src={img.src} alt={`Hình ảnh ${index + 1}`} className="object-cover" />
                            <AvatarFallback className="bg-slate-100 text-slate-400">
                              <ImageIcon className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-md flex items-center justify-center">
                            <ImageIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes if available */}
                {entry.ghiChu && (
                  <div className="mt-1 pt-3 border-t border-slate-100">
                    <h4 className="text-sm font-medium text-slate-700 mb-1">Ghi chú:</h4>
                    <p className="text-sm text-slate-500 italic">{entry.ghiChu}</p>
                  </div>
                )}

                {/* Total cost */}
                <div className="mt-1 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500">Tổng chi phí:</p>
                    <p className="text-lg font-bold text-lime-600">{formatCurrency(totalCost)}</p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => onEdit(entry)} className="text-slate-500">
                          <Edit className="h-4 w-4 mr-1" />
                          Chỉnh sửa
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Chỉnh sửa hoạt động này</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageViewer
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageSrc={selectedImage}
        altText="Chi tiết hình ảnh"
      />
    </motion.div>
  )
}

export default ModernTimelineEntry


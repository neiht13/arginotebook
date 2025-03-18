"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { motion } from "framer-motion"
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
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

import type { TimelineEntry, Agrochemical } from "./types"
import ImageViewer from "./ImageViewer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface TimelineEntryProps {
  data: TimelineEntry
  isLast: boolean
  onEdit?: (entry: TimelineEntry) => void
}

const TimelineEntryComponent: React.FC<TimelineEntryProps> = ({ data, isLast, onEdit }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [altText, setAltText] = useState<string>("")
  const [isExpanded, setIsExpanded] = useState(false)

  const formatDate = (dateString: string) => {
    const [day, month, year] = dateString.split("-")
    return format(new Date(`${year}-${month}-${day}`), "dd MMMM yyyy", { locale: vi })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const renderAgrochemicals = (agrochemicals: Agrochemical[]) => {
    return agrochemicals.map((item) => (
      <div key={item.id} className="flex items-center text-sm text-slate-600 mt-2">
        {item.type === "thuốc" ? (
          <Droplet className="mr-2 h-4 w-4 text-blue-500" />
        ) : (
          <Leaf className="mr-2 h-4 w-4 text-green-500" />
        )}
        <span className="font-medium">{item.name}:</span>
        <span className="ml-1">
          {item.lieuLuong} {item.donViTinh}
          {item.donGia && ` (${formatCurrency(item.donGia)}/${item.donViTinh})`}
        </span>
      </div>
    ))
  }

  // Hàm mở modal với hình ảnh được chọn
  const openImageModal = (imgSrc: string, alt: string) => {
    setSelectedImage(imgSrc)
    setAltText(alt)
    setIsModalOpen(true)
  }

  // Hàm đóng modal
  const closeImageModal = () => {
    setIsModalOpen(false)
    setSelectedImage("")
    setAltText("")
  }

  // Hàm lấy icon dựa trên tên công việc
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
    const stageColors: Record<string, string> = {
      "Làm đất - xuống giống": "bg-amber-100 text-amber-800",
      "Lúa mạ": "bg-green-100 text-green-800",
      "Đẻ nhánh": "bg-emerald-100 text-emerald-800",
      "Làm đòng": "bg-lime-100 text-lime-800",
      "Trổ chín": "bg-yellow-100 text-yellow-800",
      "Chín, thu hoạch": "bg-orange-100 text-orange-800",
    }

    return stageColors[stageName] || "bg-slate-100 text-slate-800"
  }

  return (
    <div className="relative pb-8">
      {!isLast && (
        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gradient-to-b from-lime-500 to-lime-100" />
      )}
      <div className="relative flex space-x-3">
        <div>
          <span className="h-10 w-10 rounded-full bg-lime-500 flex items-center justify-center ring-8 ring-white shadow-md text-white">
            {getIconByTask(data.congViec)}
          </span>
        </div>

        <div className="min-w-0 flex-1 pt-1.5 flex flex-col space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="bg-gradient-to-r from-lime-500 to-green-500 text-white p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center">
                  <CalendarDays className="mr-2 h-5 w-5" />
                  <div>
                    <span className="text-lg font-bold">{formatDate(data.ngayThucHien)}</span>
                    {data.ngaySauBatDau && <span className="ml-2 text-sm opacity-90">(Ngày {data.ngaySauBatDau})</span>}
                  </div>
                </div>
                <Badge className="bg-white/20 hover:bg-white/30 text-white">{data.muaVu || "—"}</Badge>
              </CardHeader>

              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`px-2 py-1 rounded-md text-sm font-medium ${getStageColor(data.giaiDoan)}`}>
                        {data.giaiDoan}
                      </div>
                      <h2 className="text-xl font-bold text-slate-800">{data.congViec}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center">
                        <DollarSign className="mr-2 h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-slate-700">Chi phí công: {formatCurrency(data.chiPhiCong)}</span>
                      </div>
                      <div className="flex items-center">
                        <Sprout className="mr-2 h-4 w-4 text-lime-500" />
                        <span className="text-sm text-slate-700">Số lượng công: {data.soLuongCong ?? 0}</span>
                      </div>

                      <div className="flex items-center">
                        <DollarSign className="mr-2 h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-slate-700">
                          Chi phí vật tư: {formatCurrency(data.chiPhiVatTu)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Sprout className="mr-2 h-4 w-4 text-lime-500" />
                        <span className="text-sm text-slate-700">Số lượng vật tư: {data.soLuongVatTu ?? 0}</span>
                      </div>
                    </div>

                    {/* Agrochemicals */}
                    {data.agrochemicals && data.agrochemicals.length > 0 && (
                      <Collapsible
                        open={isExpanded}
                        onOpenChange={setIsExpanded}
                        className="mt-4 pt-4 border-t border-slate-200"
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="flex items-center justify-between w-full p-0 h-auto">
                            <h3 className="text-lg font-semibold text-slate-700">Vật tư sử dụng</h3>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-2">
                          {renderAgrochemicals(data.agrochemicals)}
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>

                  {/* Hình ảnh */}
                  {data.image && data.image.length > 0 && (
                    <div className="md:w-1/3 flex flex-wrap gap-2">
                      {data.image.map((img, index) => (
                        <div
                          key={index}
                          className="relative group cursor-pointer overflow-hidden rounded-lg"
                          onClick={() => openImageModal(img.src, `Image ${index + 1}`)}
                        >
                          <Image
                            src={img.src || `/no-image.svg`}
                            alt={`Image ${index + 1}`}
                            width={120}
                            height={120}
                            className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="text-white h-5 w-5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm text-slate-500 font-medium">Tổng chi phí:</span>
                  <span className="text-xl font-bold text-lime-600">
                    {formatCurrency(data.chiPhiCong + data.chiPhiVatTu)}
                  </span>
                </div>

                {/* Nút Edit */}
                {onEdit && (
                  <Button
                    onClick={() => onEdit(data)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-lime-600 hover:text-lime-700 hover:bg-lime-50"
                  >
                    <Edit className="h-4 w-4" />
                    Chỉnh sửa
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Modal Xem Hình ảnh */}
      <ImageViewer isOpen={isModalOpen} onClose={closeImageModal} imageSrc={selectedImage} altText={altText} />
    </div>
  )
}

export default TimelineEntryComponent


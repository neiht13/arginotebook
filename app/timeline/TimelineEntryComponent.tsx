// components/TimelineEntryComponent.tsx

"use client"

import React, { useState } from "react"
import {
  CalendarDays,
  Tractor,
  Sprout,
  DollarSign,
  ImageIcon,
  Droplet,
  Leaf,
  Edit,
  TowerControlIcon, // Thêm các icon mới nếu cần
} from "lucide-react"
import { TimelineEntry, Agrochemical } from "./types"
import ImageViewer from "./ImageViewer" // Import Modal
import { format } from 'date-fns'

interface TimelineEntryProps {
  data: TimelineEntry
  isLast: boolean
  onEdit?: (entry: TimelineEntry) => void
}

const TimelineEntryComponent: React.FC<TimelineEntryProps> = ({ data, isLast, onEdit }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [altText, setAltText] = useState<string>("")


  const formatDate = (dateString: string) => {
    const [day, month, year] = dateString.split("-")
    return `${day}/${month}/${year}`
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
          <Droplet className="mr-2 h-4 w-4 text-lime-500" />
        ) : (
          <Leaf className="mr-2 h-4 w-4 text-lime-500" />
        )}
        <span>
          {item.name}: {item.lieuLuong} {item.donViTinh}
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
        return <TowerControlIcon className="h-5 w-5 text-white" />
      case "trạc đất":
        return <Tractor className="h-5 w-5 text-white" />
      case "phun thuốc":
        return <Droplet className="h-5 w-5 text-white" />
      case "bón phân":
        return <Sprout className="h-5 w-5 text-white" />
      case "thu hoạch":
        return <Leaf className="h-5 w-5 text-white" />
      case "công việc khác":
        return <ImageIcon className="h-5 w-5 text-white" />
      default:
        return <Tractor className="h-5 w-5 text-white" /> // Icon mặc định
    }
  }

  return (
    <div className="relative pb-8">
      {!isLast && (
        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gradient-to-b from-lime-300 to-lime-100" />
      )}
      <div className="relative flex space-x-3">
        <div>
          <span className="h-10 w-10 rounded-full bg-lime-500 flex items-center justify-center ring-8 ring-white shadow-md">
            {getIconByTask(data.congViec)}
          </span>
        </div>

        <div className="min-w-0 flex-1 pt-1.5 flex flex-col space-y-4">
          {/* Card */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-slate-100 hover:shadow-xl transition-shadow duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-lime-600 to-lime-500 text-white p-4 flex items-center justify-between">
              <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                <div className="flex items-center">
                  <CalendarDays className="mr-2 h-5 w-5" />
                  <span className="text-lg font-bold">{formatDate(data.ngayThucHien)}</span>
                </div>
                {data.ngaySauBatDau && (
                  <span className="text-sm opacity-90 mt-2 md:mt-0 md:ml-2">
                    (Ngày {data.ngaySauBatDau})
                  </span>
                )}
              </div>
              <span className="text-xs md:text-sm font-medium bg-white bg-opacity-20 px-2 py-1 rounded-md shadow-sm">
                {data.muaVu || "—"}
              </span>
            </div>

            {/* Body */}
            <div className="p-5">
              <h2 className="text-xl font-bold text-slate-800 mb-1">{data.congViec}</h2>
              <div className="flex items-center mb-4">
                {getIconByTask(data.congViec)}
                <span className="text-sm md:text-base font-medium">{data.giaiDoan}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">

                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-yellow-500"/>
                  <span>Chi phí công: {formatCurrency(data.chiPhiCong)}</span>
                </div>
                <div className="flex items-center">
                  <Sprout className="mr-2 h-4 w-4 text-lime-500"/>
                  <span>Số lượng công: {data.soLuongCong ?? 0}</span>
                </div>

                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-yellow-500"/>
                  <span>Chi phí vật tư: {formatCurrency(data.chiPhiVatTu)}</span>
                </div>
                <div className="flex items-center">
                  <Sprout className="mr-2 h-4 w-4 text-lime-500"/>
                  <span>Số lượng vật tư: {data.soLuongVatTu ?? 0}</span>
                </div>
              </div>

              {/* Agrochemicals */}
              {data.agrochemicals.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Vật tư sử dụng:</h3>
                  {renderAgrochemicals(data.agrochemicals)}
                </div>
              )}

              {/* Hình ảnh */}
              {data.image && data.image.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Hình ảnh:</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.image.map((img, index) => (
                      <div
                        key={index}
                        className="relative group cursor-pointer"
                        onClick={() => openImageModal(img.src, `Image ${index + 1}`)}
                      >
                        {/* Thay thế src bằng đường dẫn thực tế của hình ảnh */}
                        <img
                          src={img.src || `/no-image.svg`}
                          alt={`Image ${index + 1}`}
                          className="w-24 h-24 object-cover rounded shadow-sm transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-slate-700 bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ImageIcon className="text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tổng chi phí + Nút "Chỉnh sửa" */}
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-slate-500 font-medium">Tổng chi phí:</span>
                  <span className="text-xl md:text-2xl font-bold text-lime-600">
                    {formatCurrency(data.chiPhiCong + data.chiPhiVatTu)}
                  </span>
                </div>

                {/* Nút Edit */}
                {onEdit && (
                  <button
                    onClick={() => onEdit(data)}
                    className="flex items-center gap-1 text-sm text-lime-600 hover:text-lime-800"
                  >
                    <Edit className="h-4 w-4" />
                    Chỉnh sửa
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Xem Hình ảnh */}
      <ImageViewer isOpen={isModalOpen} onClose={closeImageModal} imageSrc={selectedImage} altText={altText} />
    </div>
  )
}

export default TimelineEntryComponent

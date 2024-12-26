"use client"

import React, { useState } from "react"
import { CalendarDays, Tractor, Sprout, DollarSign, ImageIcon, Droplet, Leaf, Edit } from "lucide-react"
import { TimelineEntry, Agrochemical } from "./types"
import ImageViewer from "./ImageViewer" // Import Modal

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
      <div key={item.id} className="flex items-center text-sm text-gray-600 mt-2">
        {item.type === "thuốc" ? (
          <Droplet className="mr-2 h-4 w-4 text-blue-500" />
        ) : (
          <Leaf className="mr-2 h-4 w-4 text-green-500" />
        )}
        <span>
          {item.name}: {item.lieuLuong} {item.donViTinh}
        </span>
      </div>
    ))
  }

  // Hàm mở modal với hình ảnh được chọn
  const openModal = (imgSrc: string, alt: string) => {
    setSelectedImage(imgSrc)
    setAltText(alt)
    setIsModalOpen(true)
  }

  // Hàm đóng modal
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedImage("")
    setAltText("")
  }

  return (
    <div className="relative pb-8">
      {!isLast && (
        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gradient-to-b from-green-300 to-green-100" />
      )}
      <div className="relative flex space-x-3">
        <div>
          <span className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white shadow-md">
            <Tractor className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
        </div>

        <div className="min-w-0 flex-1 pt-1.5 flex flex-col space-y-4">
          {/* Card */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4 flex items-center justify-between">
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
              <h2 className="text-xl font-semibold text-gray-800 mb-1">{data.giaiDoan}</h2>
              <div className="flex items-center text-gray-600 mb-4">
                <Tractor className="mr-2 h-5 w-5 text-gray-400" />
                <span className="text-sm md:text-base font-medium">{data.congViec}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Sprout className="mr-2 h-4 w-4 text-green-500" />
                  <span>Số lượng công: {data.soLuongCong ?? 0}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-yellow-500" />
                  <span>Chi phí công: {formatCurrency(data.chiPhiCong)}</span>
                </div>
                <div className="flex items-center">
                  <Sprout className="mr-2 h-4 w-4 text-green-500" />
                  <span>Số lượng vật tư: {data.soLuongVatTu ?? 0}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-yellow-500" />
                  <span>Chi phí vật tư: {formatCurrency(data.chiPhiVatTu)}</span>
                </div>
              </div>

              {/* Agrochemicals */}
              {data.agrochemicals.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Vật tư sử dụng:</h3>
                  {renderAgrochemicals(data.agrochemicals)}
                </div>
              )}

              {/* Hình ảnh */}
              {data.image && data.image.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Hình ảnh:</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.image.map((img, index) => (
                      <div key={index} className="relative group cursor-pointer" onClick={() => openModal(img.src, `Image ${index + 1}`)}>
                        {/* Thay thế src bằng đường dẫn thực tế của hình ảnh */}
                        <img
                          src={img.src || `/no-image.svg`}
                          alt={`Image ${index + 1}`}
                          className="w-24 h-24 object-cover rounded shadow-sm transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ImageIcon className="text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tổng chi phí + Nút "Chỉnh sửa" */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-gray-500 font-medium">Tổng chi phí:</span>
                  <span className="text-xl md:text-2xl font-bold text-green-600">
                    {formatCurrency(data.chiPhiCong + data.chiPhiVatTu)}
                  </span>
                </div>

                {/* Nút Edit */}
                {onEdit && (
                  <button
                    onClick={() => onEdit(data)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
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

      {/* Modal */}
      <ImageViewer
        isOpen={isModalOpen}
        onClose={closeModal}
        imageSrc={selectedImage}
        altText={altText}
      />
    </div>
  )
}

export default TimelineEntryComponent
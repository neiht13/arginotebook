// components/EnhancedAgriculturalTimeline.tsx

"use client"

import React, { useState, useRef } from "react"
import { TimelineEntry } from "./types"
import AddEditEntryModal, { AddEditEntryModalHandle } from "./AddEditEntryModal"
import TimelineEntryComponent from "./TimelineEntryComponent"
import { PlusCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

// VD: Prop
interface EnhancedAgriculturalTimelineProps {
  data: TimelineEntry[]
  onAddEntry: (entry: TimelineEntry) => void
}

const EnhancedAgriculturalTimeline: React.FC<EnhancedAgriculturalTimelineProps> = ({
  data: initialData,
  onAddEntry,
}) => {
  const [data, setData] = useState<TimelineEntry[]>(initialData)

  // Ref để điều khiển AddEditEntryModal
  const modalRef = useRef<AddEditEntryModalHandle>(null)

  // Hàm thêm entry mới (từ AddEditEntryModal)
  const handleAddEntry = (newEntry: TimelineEntry) => {
    setData((prev) => [...prev, newEntry])
    onAddEntry(newEntry)
  }

  // Hàm chỉnh sửa entry (từ AddEditEntryModal)
  const handleEditEntry = (updatedEntry: TimelineEntry) => {
    setData((prev) =>
      prev.map((item) => (item._id === updatedEntry._id ? updatedEntry : item))
    )
    // Có thể thêm logic cập nhật API tại đây nếu cần
  }

  // Hàm mở modal thêm mới
  const openAddModal = () => {
    modalRef.current?.open()
  }

  // Hàm mở modal chỉnh sửa với entry cụ thể
  const openEditModal = (entry: TimelineEntry) => {
    modalRef.current?.open(entry)
  }

  return (
    <div className="max-w-3xl mx-auto my-8 flow-root">
      {/* Nút Thêm (AddEditEntryModal) */}
      <div className="mb-4 flex justify-end">
        <Button onClick={openAddModal} className="flex items-center gap-2">
          <PlusCircleIcon className="h-5 w-5" /> Thêm mới công việc
        </Button>
      </div>

      {/* Danh sách Timeline */}
      <ul role="list" className="-mb-8">
        {data.map((entry, index) => (
          <li key={entry._id}>
            <TimelineEntryComponent
              data={entry}
              isLast={index === data.length - 1}
              // Truyền onEdit => hiển thị nút "Chỉnh sửa"
              onEdit={openEditModal}
            />
          </li>
        ))}
      </ul>

      {/* AddEditEntryModal */}
      <AddEditEntryModal
        ref={modalRef}
        onAddEntry={handleAddEntry}
        onEditEntry={handleEditEntry}
      />
    </div>
  )
}

export default EnhancedAgriculturalTimeline

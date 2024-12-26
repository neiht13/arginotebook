"use client"

import React, { useState } from "react"
import { TimelineEntry } from "./types"
import AddEntryModal from "./AddEntryModal"
import EditEntryModal from "./EditEntryModal"
import TimelineEntryComponent from "./TimelineEntryComponent"

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

  // Quản lý state cho Modal "Thêm"
  // (bạn có thể giữ nguyên code AddEntryModal cũ – tuỳ ý)
  // Ở đây ta chỉ gọi AddEntryModal khi cần
  // => AddEntryModal tự có DialogTrigger
  // => Không cần open/close ở đây
  // (Tuy nhiên, tuỳ logic bạn có, có thể thay đổi)
  
  // Quản lý state cho Modal "Chỉnh sửa"
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null)

  // Hàm thêm entry mới (từ AddEntryModal)
  const handleAddEntry = (newEntry: TimelineEntry) => {
    setData((prev) => [...prev, newEntry])
    onAddEntry(newEntry)
  }

  // Mở Modal Edit
  const handleEdit = (entry: TimelineEntry) => {
    setEditingEntry(entry)
    setEditModalOpen(true)
  }

  // Lưu thay đổi
  const handleUpdate = (updatedEntry: TimelineEntry) => {
    setData((prev) =>
      prev.map((item) => (item._id === updatedEntry._id ? updatedEntry : item))
    )
  }

  return (
    <div className="max-w-3xl mx-auto my-8 flow-root">
      {/* Nút Thêm (AddEntryModal) */}
      <div className="mb-4 flex justify-end">
        <AddEntryModal onAddEntry={handleAddEntry}/>
      </div>

      {/* Danh sách Timeline */}
      <ul role="list" className="-mb-8">
        {data.map((entry, index) => (
          <li key={entry._id}>
            <TimelineEntryComponent
              data={entry}
              isLast={index === data.length - 1}
              // Truyền onEdit => hiển thị nút "Chỉnh sửa"
              onEdit={handleEdit}
            />
          </li>
        ))}
      </ul>

      {/* EDIT MODAL (mở khi user bấm "Chỉnh sửa") */}
      {editingEntry && (
        <EditEntryModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          entry={editingEntry}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}

export default EnhancedAgriculturalTimeline

"use client"

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import SeasonTable from './SeasonTable'
import StageTable from './StageTable'
import TaskTable from './TaskTable'
import SeasonModal from './SeasonModal'
import StageModal from './StageModal'
import TaskModal from './TaskModal'

// Sample data (replace with actual data fetching logic)
const seasons = [
  {
    "_id": "673c2dd01f8b41e75f4d39e8",
    "muavu": "Thu Đông",
    "nam": "2024",
    "ngaybatdau": "01-09-2024",
    "phuongphap": "Máy bay",
    "giong": "OM 18",
    "dientich": 10,
    "soluong": 100,
    "giagiong": 17000,
    "stt": null,
    "ghichu": "",
    "uId": "673c02b70df7665d45340b11",
    "sothua": 5,
    "chiphikhac": 30000
  }
]

const stages = [
  {
      "_id": "6583a87a45e4c89f207aed1c",
      "color": "#BB4D00",
      "ghichu": "Trước sạ",
      "giaidoan": 1,
      "tengiaidoan": "Làm đất - xuống giống",
      "xId": "tng"
  },
  {
      "_id": "6583aadf45e4c89f207aed1f",
      "color": "#1D8300",
      "ghichu": "Từ ngày 21 đến 40 ngày sau sạ",
      "giaidoan": 3,
      "tengiaidoan": "Đẻ nhánh",
      "xId": "tng"
  },
  {
      "_id": "6583aadf45e4c89f207aed21",
      "color": "#FFFF00",
      "ghichu": "Từ ngày 61 đến 80 ngày sau sạ",
      "giaidoan": 5,
      "tengiaidoan": "Trổ chín",
      "xId": "tng"
  },
  {
      "_id": "6583aadf45e4c89f207aed1e",
      "color": "#31D304",
      "ghichu": "Từ ngày 1 đến 20  ngày sau sạ",
      "giaidoan": 2,
      "tengiaidoan": "Lúa mạ",
      "xId": "tng"
  },
  {
      "_id": "6583aadf45e4c89f207aed20",
      "color": "#B7F305",
      "ghichu": "Từ ngày 41 đến 60 ngày sau sạ",
      "giaidoan": 4,
      "tengiaidoan": "Làm đòng",
      "xId": "tng"
  },
  {
      "_id": "6583aadf45e4c89f207aed22",
      "color": "#FFAD00",
      "ghichu": "Trên 80 ngày",
      "giaidoan": 6,
      "tengiaidoan": "Chín, thu hoạch",
      "xId": "tng"
  },
]

const tasks = [
  {
      "_id": "66e8ef9053bd51ade39bcf52",
      "id": "6583b94045e4c89f207aed46",
      "stt": 3,
      "tenCongViec": "Đánh rãnh",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,3",
      "giaidoanId": "6583a87a45e4c89f207aed1c",
      "tenGiaiDoan": "Làm đất - xuống giống",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf53",
      "id": "6583b94045e4c89f207aed48",
      "stt": 5,
      "tenCongViec": "Trạc đất",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2",
      "giaidoanId": "6583a87a45e4c89f207aed1c",
      "tenGiaiDoan": "Làm đất - xuống giống",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf54",
      "id": "6583b94045e4c89f207aed45",
      "stt": 2,
      "tenCongViec": "Cày đất",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2",
      "giaidoanId": "6583a87a45e4c89f207aed1c",
      "tenGiaiDoan": "Làm đất - xuống giống",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf55",
      "id": "6583b94045e4c89f207aed4e",
      "stt": 11,
      "tenCongViec": "Phun thuốc",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,5,6,7,8",
      "giaidoanId": "6583aadf45e4c89f207aed1e",
      "tenGiaiDoan": "Lúa mạ",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf56",
      "id": "6583b94045e4c89f207aed57",
      "stt": 20,
      "tenCongViec": "Phun thuốc",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4",
      "giaidoanId": "6583aadf45e4c89f207aed20",
      "tenGiaiDoan": "Trổ đồng",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf57",
      "id": "6583b94045e4c89f207aed5c",
      "stt": 25,
      "tenCongViec": "Công việc khác",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4,5,6,7,8,9,10,11",
      "giaidoanId": "6583aadf45e4c89f207aed21",
      "tenGiaiDoan": "Lúa chín",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf58",
      "id": "6583b94045e4c89f207aed50",
      "stt": 13,
      "tenCongViec": "Công việc khác",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4,5,6,7,8,9,10,11",
      "giaidoanId": "6583aadf45e4c89f207aed1e",
      "tenGiaiDoan": "Lúa mạ",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf59",
      "id": "6583b94045e4c89f207aed4d",
      "stt": 10,
      "tenCongViec": "Bón phân",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4",
      "giaidoanId": "6583aadf45e4c89f207aed1e",
      "tenGiaiDoan": "Lúa mạ",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf5a",
      "id": "6583b94045e4c89f207aed51",
      "stt": 14,
      "tenCongViec": "Bơm nước",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,12",
      "giaidoanId": "6583aadf45e4c89f207aed1f",
      "tenGiaiDoan": "Đẻ nhánh",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf5b",
      "id": "6583b94045e4c89f207aed54",
      "stt": 17,
      "tenCongViec": "Phun thuốc",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4,5,6,7,8,9,10,11",
      "giaidoanId": "6583aadf45e4c89f207aed1f",
      "tenGiaiDoan": "Đẻ nhánh",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf5c",
      "id": "6583b94045e4c89f207aed52",
      "stt": 15,
      "tenCongViec": "Bón phân",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4",
      "giaidoanId": "6583aadf45e4c89f207aed1f",
      "tenGiaiDoan": "Đẻ nhánh",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf5d",
      "id": "6583b94045e4c89f207aed5e",
      "stt": 27,
      "tenCongViec": "Bón phân",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4",
      "giaidoanId": "6583aadf45e4c89f207aed22",
      "tenGiaiDoan": "Chín, thu hoạch",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf5e",
      "id": "6583b94045e4c89f207aed59",
      "stt": 22,
      "tenCongViec": "Bơm nước",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,12",
      "giaidoanId": "6583aadf45e4c89f207aed21",
      "tenGiaiDoan": "Lúa chín",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf5f",
      "id": "6583b94045e4c89f207aed5b",
      "stt": 23,
      "tenCongViec": "Phun thuốc",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,5,6,7,8",
      "giaidoanId": "6583aadf45e4c89f207aed21",
      "tenGiaiDoan": "Lúa chín",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf60",
      "id": "6583b94045e4c89f207aed4a",
      "stt": 7,
      "tenCongViec": "Xuống giống",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3",
      "giaidoanId": "6583a87a45e4c89f207aed1c",
      "tenGiaiDoan": "Làm đất - xuống giống",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf61",
      "id": "6583b94045e4c89f207aed4c",
      "stt": 9,
      "tenCongViec": "Bơm nước",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,12",
      "giaidoanId": "6583aadf45e4c89f207aed1e",
      "tenGiaiDoan": "Lúa mạ",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf62",
      "id": "6583b94045e4c89f207aed5f",
      "stt": 28,
      "tenCongViec": "Phun thuốc",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,5,6,7,8",
      "giaidoanId": "6583aadf45e4c89f207aed22",
      "tenGiaiDoan": "Chín, thu hoạch",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf63",
      "id": "6583b94045e4c89f207aed60",
      "stt": 29,
      "tenCongViec": "Thu hoạch",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,12",
      "giaidoanId": "6583aadf45e4c89f207aed22",
      "tenGiaiDoan": "Chín, thu hoạch",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf64",
      "id": "6583b94045e4c89f207aed4b",
      "stt": 8,
      "tenCongViec": "Công việc khác",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4,5,6,7,8,9,10,11",
      "giaidoanId": "6583a87a45e4c89f207aed1c",
      "tenGiaiDoan": "Làm đất - xuống giống",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf65",
      "id": "6583b94045e4c89f207aed49",
      "stt": 6,
      "tenCongViec": "Xới đất",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2",
      "giaidoanId": "6583a87a45e4c89f207aed1c",
      "tenGiaiDoan": "Làm đất - xuống giống",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf66",
      "id": "6583b94045e4c89f207aed53",
      "stt": 16,
      "tenCongViec": "Phun thuốc",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,5,6,7,8",
      "giaidoanId": "6583aadf45e4c89f207aed1f",
      "tenGiaiDoan": "Đẻ nhánh",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf67",
      "id": "6583b94045e4c89f207aed44",
      "stt": 1,
      "tenCongViec": "Bón phân",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4",
      "giaidoanId": "6583a87a45e4c89f207aed1c",
      "tenGiaiDoan": "Làm đất - xuống giống",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf68",
      "id": "6583b94045e4c89f207aed47",
      "stt": 4,
      "tenCongViec": "Phun thuốc",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,5",
      "giaidoanId": "6583a87a45e4c89f207aed1c",
      "tenGiaiDoan": "Làm đất - xuống giống",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf69",
      "id": "6583b94045e4c89f207aed56",
      "stt": 19,
      "tenCongViec": "Bón phân",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4",
      "giaidoanId": "6583aadf45e4c89f207aed20",
      "tenGiaiDoan": "Trổ đồng",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf6a",
      "id": "6583b94045e4c89f207aed55",
      "stt": 18,
      "tenCongViec": "Bơm nước",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,12",
      "giaidoanId": "6583aadf45e4c89f207aed20",
      "tenGiaiDoan": "Trổ đồng",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf6b",
      "id": "6583b94045e4c89f207aed58",
      "stt": 21,
      "tenCongViec": "Công việc khác",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4,5,6,7,8,9,10,11",
      "giaidoanId": "6583aadf45e4c89f207aed20",
      "tenGiaiDoan": "Trổ đồng",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf6c",
      "id": "6583b94045e4c89f207aed5a",
      "stt": 23,
      "tenCongViec": "Bón phân",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4",
      "giaidoanId": "6583aadf45e4c89f207aed21",
      "tenGiaiDoan": "Lúa chín",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf6d",
      "id": "6583b94045e4c89f207aed61",
      "stt": 30,
      "tenCongViec": "Công việc khác",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,3,4,5,6,7,8,9,10,11",
      "giaidoanId": "6583aadf45e4c89f207aed22",
      "tenGiaiDoan": "Chín, thu hoạch",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf6e",
      "id": "6583b94045e4c89f207aed5d",
      "stt": 26,
      "tenCongViec": "Bơm nước",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,12",
      "giaidoanId": "6583aadf45e4c89f207aed22",
      "tenGiaiDoan": "Chín, thu hoạch",
      "xId": "tng"
  },
  {
      "_id": "66e8ef9053bd51ade39bcf6f",
      "id": "6583b94045e4c89f207aed4f",
      "stt": 12,
      "tenCongViec": "Cấy dặm",
      "chitietcongviec": "",
      "ghichu": "",
      "chiphidvt": "0,1,2,10,11",
      "giaidoanId": "6583aadf45e4c89f207aed1e",
      "tenGiaiDoan": "Lúa mạ",
      "xId": "tng"
  },
]

export default function CategoryPage() {
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false)
  const [isStageModalOpen, setIsStageModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const handleEdit = (item, type) => {
    setEditingItem(item)
    switch (type) {
      case 'season':
        setIsSeasonModalOpen(true)
        break
      case 'stage':
        setIsStageModalOpen(true)
        break
      case 'task':
        setIsTaskModalOpen(true)
        break
    }
  }

  const handleAdd = (type) => {
    setEditingItem(null)
    switch (type) {
      case 'season':
        setIsSeasonModalOpen(true)
        break
      case 'stage':
        setIsStageModalOpen(true)
        break
      case 'task':
        setIsTaskModalOpen(true)
        break
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý danh mục</h1>
      <Tabs defaultValue="seasons" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="seasons">Mùa vụ</TabsTrigger>
          <TabsTrigger value="stages">Giai đoạn</TabsTrigger>
          <TabsTrigger value="tasks">Công việc</TabsTrigger>
        </TabsList>
        <TabsContent value="seasons">
          <Button onClick={() => handleAdd('season')} className="mb-4 w-full md:w-auto">Thêm mùa vụ mới</Button>
          <SeasonTable data={seasons} onEdit={(item) => handleEdit(item, 'season')} />
        </TabsContent>
        <TabsContent value="stages">
          <Button onClick={() => handleAdd('stage')} className="mb-4 w-full md:w-auto">Thêm giai đoạn mới</Button>
          <StageTable data={stages} onEdit={(item) => handleEdit(item, 'stage')} />
        </TabsContent>
        <TabsContent value="tasks">
          <Button onClick={() => handleAdd('task')} className="mb-4 w-full md:w-auto">Thêm công việc mới</Button>
          <TaskTable data={tasks} onEdit={(item) => handleEdit(item, 'task')} />
        </TabsContent>
      </Tabs>

      <SeasonModal
        isOpen={isSeasonModalOpen}
        onClose={() => setIsSeasonModalOpen(false)}
        item={editingItem}
      />
      <StageModal
        isOpen={isStageModalOpen}
        onClose={() => setIsStageModalOpen(false)}
        item={editingItem}
      />
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        item={editingItem}
      />
    </div>
  )
}


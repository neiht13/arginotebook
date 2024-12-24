"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import TaskCountChart from './TaskCountChart'
import TaskTypeChart from './TaskTypeChart'
import TaskDateChart from './TaskDateChart'
import FinancialChart from './FinancialChart'
import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'

// Sample data (replace with actual data fetching logic)
const farmingLogs = [
  {
    "_id": "674832beb7b52c16eaeababe",
    "uId": "673c02b70df7665d45340b11",
    "xId": "",
    "chiPhiVatTu": 0,
    "chiPhiCong": 450000,
    "soLuongCong": 1,
    "soLuongVatTu": 0,
    "donViTinh": "",
    "congViec": "Cấy dặm",
    "congViecId": "66e8ef9053bd51ade39bcf6f",
    "giaiDoan": "Lúa mạ",
    "giaiDoanId": "6583aadf45e4c89f207aed1e",
    "ngayCapNhat": null,
    "thanhTien": 0,
    "loaiPhan": null,
    "tenPhan": "",
    "loaiThuoc": null,
    "tenThuoc": "",
    "ngayThucHien": "22-09-2024",
    "image": null,
    "muaVu": "Thu Đông",
    "muaVuId": "673c2dd01f8b41e75f4d39e8",
    "chiTietCongViec": "",
    "ghiChu": null,
    "year": null,
    "agrochemicals": [],
    "ngaySauBatDau": "21"
  },
  {
    "_id": "67483de6b7b52c16eaeababf",
    "uId": "673c02b70df7665d45340b11",
    "xId": "",
    "chiPhiVatTu": 95000,
    "chiPhiCong": 0,
    "soLuongCong": 0,
    "soLuongVatTu": 2,
    "donViTinh": "",
    "congViec": "Phun thuốc",
    "congViecId": "66e8ef9053bd51ade39bcf55",
    "giaiDoan": "Lúa mạ",
    "giaiDoanId": "6583aadf45e4c89f207aed1e",
    "ngayCapNhat": null,
    "thanhTien": 0,
    "loaiPhan": null,
    "tenPhan": "",
    "loaiThuoc": null,
    "tenThuoc": "",
    "ngayThucHien": "03-09-2024",
    "image": ['image1.png', 'image2.jpg'],
    "muaVu": "Thu Đông",
    "muaVuId": "673c2dd01f8b41e75f4d39e8",
    "chiTietCongViec": "",
    "ghiChu": null,
    "year": null,
    "agrochemicals": [
      {
        "id": "67483df2846bdceecb1b3d64",
        "name": "Diet mam",
        "type": "thuốc",
        "isOrganic": false,
        "farmingLogId": "67483de6b7b52c16eaeababf",
        "lieuLuong": "2",
        "donViTinh": "l"
      }
    ]
  },
  {
    "_id": "67492bc4b7b52c16eaeabac1",
    "uId": "673c02b70df7665d45340b11",
    "xId": "",
    "chiPhiVatTu": 250000,
    "chiPhiCong": 0,
    "soLuongCong": 0,
    "soLuongVatTu": 1,
    "donViTinh": "",
    "congViec": "Bón phân",
    "congViecId": "66e8ef9053bd51ade39bcf59",
    "giaiDoan": "Lúa mạ",
    "giaiDoanId": "6583aadf45e4c89f207aed1e",
    "ngayCapNhat": null,
    "thanhTien": 0,
    "loaiPhan": null,
    "tenPhan": "",
    "loaiThuoc": null,
    "tenThuoc": "",
    "ngayThucHien": "11-09-2024",
    "ngaySauBatDau": "10",
    "image": null,
    "muaVu": "Thu Đông",
    "muaVuId": "673c2dd01f8b41e75f4d39e8",
    "chiTietCongViec": "",
    "ghiChu": null,
    "year": null,
    "agrochemicals": [
      {
        "id": "67493a77cf64535a4203fb55",
        "name": "ure",
        "type": "phân",
        "isOrganic": false,
        "farmingLogId": "67492bc4b7b52c16eaeabac1",
        "lieuLuong": 25,
        "donGia": 10000,
        "donViTinh": "kg"
      }
    ]
  }
]

export default function StatisticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('all')

  const filteredLogs = useMemo(() => {
    if (selectedPeriod === 'all') return farmingLogs

    const now = new Date()
    const periodStart = new Date()

    switch (selectedPeriod) {
      case 'week':
        periodStart.setDate(now.getDate() - 7)
        break
      case 'month':
        periodStart.setMonth(now.getMonth() - 1)
        break
      case 'year':
        periodStart.setFullYear(now.getFullYear() - 1)
        break
    }

    return farmingLogs.filter(log => new Date(log.ngayThucHien) >= periodStart)
  }, [selectedPeriod])

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new()
    
    // Task Count
    const taskCountData = [['Tổng số công việc', filteredLogs.length]]
    const taskCountSheet = XLSX.utils.aoa_to_sheet(taskCountData)
    XLSX.utils.book_append_sheet(workbook, taskCountSheet, 'Số lượng công việc')

    // Task Type
    const taskTypes = filteredLogs.reduce((acc, log) => {
      acc[log.congViec] = (acc[log.congViec] || 0) + 1
      return acc
    }, {})
    const taskTypeData = Object.entries(taskTypes).map(([name, value]) => [name, value])
    const taskTypeSheet = XLSX.utils.aoa_to_sheet([['Loại công việc', 'Số lượng'], ...taskTypeData])
    XLSX.utils.book_append_sheet(workbook, taskTypeSheet, 'Công việc theo loại')

    // Task Date
    const taskDateData = filteredLogs.reduce((acc, log) => {
      const date = log.ngayThucHien
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})
    const taskDateSheet = XLSX.utils.aoa_to_sheet([
      ['Ngày', 'Số lượng công việc'],
      ...Object.entries(taskDateData)
    ])
    XLSX.utils.book_append_sheet(workbook, taskDateSheet, 'Công việc theo ngày')

    // Financial
    const totalCost = filteredLogs.reduce((sum, log) => sum + log.chiPhiVatTu + log.chiPhiCong, 0)
    const totalRevenue = filteredLogs.reduce((sum, log) => sum + log.thanhTien, 0)
    const profit = totalRevenue - totalCost
    const financialData = [
      ['Chỉ số', 'Giá trị (VND)'],
      ['Chi phí', totalCost],
      ['Doanh thu', totalRevenue],
      ['Lợi nhuận', profit]
    ]
    const financialSheet = XLSX.utils.aoa_to_sheet(financialData)
    XLSX.utils.book_append_sheet(workbook, financialSheet, 'Thống kê tài chính')

    XLSX.writeFile(workbook, 'thong_ke_nong_nghiep.xlsx')
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">Thống kê</h1>
        <Button onClick={exportToExcel} className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" /> Xuất Excel
        </Button>
      </div>
      <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="mb-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="week">Tuần</TabsTrigger>
          <TabsTrigger value="month">Tháng</TabsTrigger>
          <TabsTrigger value="year">Năm</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Số lượng công việc</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskCountChart data={filteredLogs} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Công việc theo loại</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskTypeChart data={filteredLogs} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Công việc theo ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskDateChart data={filteredLogs} />
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Thống kê tài chính</CardTitle>
          </CardHeader>
          <CardContent>
            <FinancialChart data={filteredLogs} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


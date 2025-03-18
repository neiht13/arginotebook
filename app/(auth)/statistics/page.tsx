"use client"

import { useState, useMemo, useEffect } from "react"
import { Download, Calendar, TrendingUpIcon, BarChartIcon, PieChartIcon, Filter } from "lucide-react"
import * as XLSX from "xlsx"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PageHeader } from "@/components/ui/page-header"
import { DataCard } from "@/components/ui/data-card"
import { EmptyState } from "@/components/ui/empty-state"
import Spinner from "@/components/ui/spinner"

import TaskCountChart from "./TaskCountChart"
import TaskDateChart from "./TaskDateChart"
import TaskTypeChart from "./TaskTypeChart"
import FinancialChart from "./FinancialChart"
import CostBreakdownChart from "./CostBreakdownChart"
import SeasonComparisonChart from "./SeasonComparisonChart"

export default function StatisticsPage() {
  // Tabs chính: Thời gian
  const [selectedPeriod, setSelectedPeriod] = useState("all")
  const [farmingLogs, setFarmingLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFarmingLogs = async () => {
      try {
        setIsLoading(true)
        const res = await axios.get("/api/nhatky")
        setFarmingLogs(res.data)
      } catch (error) {
        console.error("Error fetching farming logs:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFarmingLogs()
  }, [])

  // Lọc logs theo khoảng thời gian
  const filteredLogs = useMemo(() => {
    if (selectedPeriod === "all") return farmingLogs

    const now = new Date()
    const periodStart = new Date()

    switch (selectedPeriod) {
      case "week":
        periodStart.setDate(now.getDate() - 7)
        break
      case "month":
        periodStart.setMonth(now.getMonth() - 1)
        break
      case "year":
        periodStart.setFullYear(now.getFullYear() - 1)
        break
    }

    return farmingLogs.filter((log) => {
      const date = new Date(log.ngayThucHien)
      return date >= periodStart
    })
  }, [selectedPeriod, farmingLogs])

  // Một vài số liệu tổng
  const totalTasks = filteredLogs.length
  const totalCost = filteredLogs.reduce((acc, log) => acc + log.chiPhiVatTu + log.chiPhiCong, 0)
  const totalRevenue = filteredLogs.reduce((acc, log) => acc + (log.thanhTien || 0), 0)
  const profit = totalRevenue - totalCost

  // Hàm export Excel
  const exportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new()

      // Sheet: Số lượng công việc
      const taskCountData = [["Tổng số công việc", totalTasks]]
      const taskCountSheet = XLSX.utils.aoa_to_sheet(taskCountData)
      XLSX.utils.book_append_sheet(workbook, taskCountSheet, "Số lượng công việc")

      // Sheet: Công việc theo loại
      const taskTypes = filteredLogs.reduce((acc: Record<string, number>, log) => {
        acc[log.congViec] = (acc[log.congViec] || 0) + 1
        return acc
      }, {})
      const taskTypeData = Object.entries(taskTypes).map(([name, value]) => [name, value])
      const taskTypeSheet = XLSX.utils.aoa_to_sheet([["Loại công việc", "Số lượng"], ...taskTypeData])
      XLSX.utils.book_append_sheet(workbook, taskTypeSheet, "Công việc theo loại")

      // Sheet: Công việc theo ngày
      const taskDateData = filteredLogs.reduce((acc: Record<string, number>, log) => {
        const dateKey = log.ngayThucHien
        acc[dateKey] = (acc[dateKey] || 0) + 1
        return acc
      }, {})
      const taskDateSheet = XLSX.utils.aoa_to_sheet([["Ngày", "Số lượng công việc"], ...Object.entries(taskDateData)])
      XLSX.utils.book_append_sheet(workbook, taskDateSheet, "Công việc theo ngày")

      // Sheet: Thống kê tài chính
      const financialData = [
        ["Chỉ số", "Giá trị (VND)"],
        ["Chi phí", totalCost],
        ["Doanh thu", totalRevenue],
        ["Lợi nhuận", profit],
      ]
      const financialSheet = XLSX.utils.aoa_to_sheet(financialData)
      XLSX.utils.book_append_sheet(workbook, financialSheet, "Thống kê tài chính")

      XLSX.writeFile(workbook, "thong_ke_nong_nghiep.xlsx")
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Thống kê nông nghiệp"
        description="Phân tích dữ liệu canh tác và hiệu quả kinh tế"
        icon={<BarChartIcon className="w-6 h-6" />}
        actions={
          <Button onClick={exportToExcel} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Xuất Excel
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-[400px]">
          <Spinner />
        </div>
      ) : farmingLogs.length === 0 ? (
        <EmptyState
          icon={<BarChartIcon className="w-6 h-6" />}
          title="Chưa có dữ liệu thống kê"
          description="Bạn cần có dữ liệu nhật ký canh tác để xem thống kê. Hãy thêm các bản ghi nhật ký trước."
        />
      ) : (
        <>
          {/* Tabs chọn khoảng thời gian */}
          <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="mb-8">
            <TabsList className="bg-white border border-slate-200 rounded-md shadow-sm">
              <TabsTrigger value="all" className="flex items-center gap-1 px-4 py-2 text-sm font-medium">
                <Calendar className="w-4 h-4" />
                <span>Tất cả</span>
              </TabsTrigger>
              <TabsTrigger value="week" className="flex items-center gap-1 px-4 py-2 text-sm font-medium">
                <TrendingUpIcon className="w-4 h-4" />
                <span>Tuần</span>
              </TabsTrigger>
              <TabsTrigger value="month" className="flex items-center gap-1 px-4 py-2 text-sm font-medium">
                <TrendingUpIcon className="w-4 h-4" />
                <span>Tháng</span>
              </TabsTrigger>
              <TabsTrigger value="year" className="flex items-center gap-1 px-4 py-2 text-sm font-medium">
                <TrendingUpIcon className="w-4 h-4" />
                <span>Năm</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <StatisticsContent
                logs={filteredLogs}
                totalTasks={totalTasks}
                totalCost={totalCost}
                totalRevenue={totalRevenue}
                profit={profit}
              />
            </TabsContent>

            <TabsContent value="week" className="mt-6">
              <StatisticsContent
                logs={filteredLogs}
                totalTasks={totalTasks}
                totalCost={totalCost}
                totalRevenue={totalRevenue}
                profit={profit}
                period="7 ngày qua"
              />
            </TabsContent>

            <TabsContent value="month" className="mt-6">
              <StatisticsContent
                logs={filteredLogs}
                totalTasks={totalTasks}
                totalCost={totalCost}
                totalRevenue={totalRevenue}
                profit={profit}
                period="30 ngày qua"
              />
            </TabsContent>

            <TabsContent value="year" className="mt-6">
              <StatisticsContent
                logs={filteredLogs}
                totalTasks={totalTasks}
                totalCost={totalCost}
                totalRevenue={totalRevenue}
                profit={profit}
                period="365 ngày qua"
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

interface StatisticsContentProps {
  logs: any[]
  totalTasks: number
  totalCost: number
  totalRevenue: number
  profit: number
  period?: string
}

function StatisticsContent({ logs, totalTasks, totalCost, totalRevenue, profit, period }: StatisticsContentProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div>
      {period && (
        <div className="mb-4 flex items-center gap-2 text-slate-600">
          <Filter className="w-4 h-4" />
          <span>Đang xem dữ liệu trong {period}</span>
        </div>
      )}

      {/* Khối thống kê nhanh (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DataCard title="Tổng công việc" value={totalTasks} icon={<Calendar className="w-5 h-5" />} />

        <DataCard title="Chi phí" value={formatCurrency(totalCost)} icon={<BarChartIcon className="w-5 h-5" />} />

        <DataCard
          title="Doanh thu"
          value={formatCurrency(totalRevenue)}
          icon={<TrendingUpIcon className="w-5 h-5" />}
        />

        <DataCard
          title="Lợi nhuận"
          value={formatCurrency(profit)}
          icon={<PieChartIcon className="w-5 h-5" />}
          className={profit >= 0 ? "border-l-4 border-green-500" : "border-l-4 border-red-500"}
        />
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <TaskCountChart data={logs} />
        <TaskTypeChart data={logs} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <FinancialChart data={logs} />
        <CostBreakdownChart data={logs} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <TaskDateChart data={logs} />
        <SeasonComparisonChart data={logs} />
      </div>
    </div>
  )
}


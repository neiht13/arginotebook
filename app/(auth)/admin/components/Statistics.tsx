"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataCard } from "@/components/ui/data-card"
import Spinner from "@/components/ui/spinner"
import { useToast } from "@/components/ui/use-toast"
import  BarChartComponent  from "@/app/components/chart/BarChartComponent"

import  PieChartComponent  from "@/app/components/chart/PieChartComponent"
import  AreaChartComponent  from "@/app/components/chart/AreaChartComponent"
import { Users, Tractor, Leaf, Calendar, BarChart2, PieChart } from 'lucide-react'
import axios from "axios"

interface Unit {
  _id: string
  tendonvi: string
  dientich: number
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  adminUsers: number
  usersByUnit: {
    unitId: string
    unitName: string
    count: number
  }[]
}

interface TaskStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  tasksByType: {
    type: string
    count: number
  }[]
  tasksByMonth: {
    month: string
    count: number
  }[]
}

interface UnitStats {
  totalArea: number
  organicArea: number
  unitAreas: {
    unitId: string
    unitName: string
    area: number
  }[]
}

export default function Statistics() {
  const [units, setUnits] = useState<Unit[]>([])
  const [selectedUnit, setSelectedUnit] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null)
  const [unitStats, setUnitStats] = useState<UnitStats | null>(null)
  const { toast } = useToast()

  // Lấy dữ liệu thống kê
  const fetchStatistics = async () => {
    try {
      setIsLoading(true)
      
      // Lấy danh sách đơn vị
      const unitsResponse = await axios.get("/api/donvi")
      setUnits(unitsResponse.data)
      
      // Lấy thống kê người dùng
      const userStatsResponse = await axios.get(`/api/statistics/users${selectedUnit !== "all" ? `?unitId=${selectedUnit}` : ""}`)
      setUserStats(userStatsResponse.data)
      
      // Lấy thống kê công việc
      const taskStatsResponse = await axios.get(`/api/statistics/tasks${selectedUnit !== "all" ? `?unitId=${selectedUnit}` : ""}`)
      setTaskStats(taskStatsResponse.data)
      
      // Lấy thống kê đơn vị
      const unitStatsResponse = await axios.get("/api/statistics/units")
      setUnitStats(unitStatsResponse.data)
      
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu thống kê:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải dữ liệu thống kê"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStatistics()
  }, [selectedUnit])

  // Dữ liệu mẫu cho biểu đồ người dùng theo đơn vị
  const usersByUnitChartData = {
    labels: userStats?.usersByUnit.map(item => item.unitName) || [],
    datasets: [
      {
        label: 'Số lượng người dùng',
        data: userStats?.usersByUnit.map(item => item.count) || [],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      },
    ],
  }

  // Dữ liệu mẫu cho biểu đồ công việc theo loại
  const tasksByTypeChartData = {
    labels: taskStats?.tasksByType.map(item => item.type) || [],
    datasets: [
      {
        label: 'Số lượng công việc',
        data: taskStats?.tasksByType.map(item => item.count) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      },
    ],
  }

  // Dữ liệu mẫu cho biểu đồ công việc theo tháng
  const tasksByMonthChartData = {
    labels: taskStats?.tasksByMonth.map(item => item.month) || [],
    datasets: [
      {
        label: 'Số lượng công việc',
        data: taskStats?.tasksByMonth.map(item => item.count) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  }

  // Dữ liệu mẫu cho biểu đồ diện tích đơn vị
  const unitAreasChartData = {
    labels: unitStats?.unitAreas.map(item => item.unitName) || [],
    datasets: [
      {
        label: 'Diện tích (ha)',
        data: unitStats?.unitAreas.map(item => item.area) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Thống kê tổng quan</h2>
        <Select value={selectedUnit} onValueChange={setSelectedUnit}>
          <SelectTrigger className="w-full sm:w-64 mt-2 sm:mt-0">
            <SelectValue placeholder="Chọn đơn vị" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả đơn vị</SelectItem>
            {units.map((unit) => (
              <SelectItem key={unit._id} value={unit._id}>
                {unit.tendonvi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Thẻ thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DataCard
          title="Tổng số người dùng"
          value={userStats?.totalUsers || 0}
          icon={<Users className="h-5 w-5" />}
          description="Người dùng đã đăng ký"
        />
        <DataCard
          title="Tổng số công việc"
          value={taskStats?.totalTasks || 0}
          icon={<Calendar className="h-5 w-5" />}
          description={`${taskStats?.completedTasks || 0} đã hoàn thành`}
        />
        <DataCard
          title="Tổng diện tích"
          value={`${unitStats?.totalArea?.toFixed(2) || 0} ha`}
          icon={<Tractor className="h-5 w-5" />}
          description="Diện tích canh tác"
        />
        <DataCard
          title="Diện tích hữu cơ"
          value={`${unitStats?.organicArea?.toFixed(2) || 0} ha`}
          icon={<Leaf className="h-5 w-5" />}
          description="Canh tác hữu cơ"
          trend={unitStats ? {
            value: Math.round((unitStats.organicArea / unitStats.totalArea) * 100),
            isPositive: true
          } : undefined}
        />
      </div>

      {/* Biểu đồ thống kê */}
      <Tabs defaultValue="users" className="mt-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="users" className="flex items-center">
            <Users className="h-4 w-4 mr-2" /> Người dùng
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" /> Công việc
          </TabsTrigger>
          <TabsTrigger value="taskTypes" className="flex items-center">
            <PieChart className="h-4 w-4 mr-2" /> Loại công việc
          </TabsTrigger>
          <TabsTrigger value="units" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2" /> Đơn vị
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Phân bố người dùng theo đơn vị</CardTitle>
              <CardDescription>
                Số lượng người dùng trong mỗi đơn vị
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <BarChartComponent data={usersByUnitChartData} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Công việc theo tháng</CardTitle>
              <CardDescription>
                Số lượng công việc được tạo theo từng tháng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <AreaChartComponent data={tasksByMonthChartData} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taskTypes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Phân bố công việc theo loại</CardTitle>
              <CardDescription>
                Tỷ lệ các loại công việc khác nhau
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <PieChartComponent data={tasksByTypeChartData} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="units" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Diện tích canh tác theo đơn vị</CardTitle>
              <CardDescription>
                Diện tích canh tác (ha) của từng đơn vị
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <BarChartComponent data={unitAreasChartData} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

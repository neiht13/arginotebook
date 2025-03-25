"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import axios from "axios"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RefreshCw, Calendar, Layers, FileText } from "lucide-react"

import SeasonManager from "./components/SeasonManager"
import StageManager from "./components/StageManager"
import TaskManager from "./components/TaskManager"
import type { Season, Stage, Task } from "./types"

export default function CategoryPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("seasons")
  const [seasons, setSeasons] = useState<Season[]>([])
  const [stages, setStages] = useState<Stage[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState({
    seasons: true,
    stages: true,
    tasks: true,
  })

  useEffect(() => {
    if (status === "authenticated") {
      fetchData()
    }
  }, [status])

  const fetchData = async () => {
    try {
      await Promise.all([fetchSeasons(), fetchStages(), fetchTasks()])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({ variant: "destructive", description: "Có lỗi xảy ra khi tải dữ liệu" })
    }
  }

  const fetchSeasons = async () => {
    setIsLoading((prev) => ({ ...prev, seasons: true }))
    try {
      const response = await axios.get("/api/muavu", {
        params: { uId: session?.user?.uId },
      })
      setSeasons(response.data)
    } catch (error) {
      console.error("Error fetching seasons:", error)
      toast({ variant: "destructive", description: "Không thể tải dữ liệu mùa vụ" })
    } finally {
      setIsLoading((prev) => ({ ...prev, seasons: false }))
    }
  }

  const fetchStages = async () => {
    setIsLoading((prev) => ({ ...prev, stages: true }))
    try {
      const response = await axios.get("/api/giaidoan", {
        params: { uId: session?.user?.uId },
      })
      setStages(response.data)
    } catch (error) {
      console.error("Error fetching stages:", error)
      toast({ variant: "destructive", description: "Không thể tải dữ liệu giai đoạn" })
    } finally {
      setIsLoading((prev) => ({ ...prev, stages: false }))
    }
  }

  const fetchTasks = async () => {
    setIsLoading((prev) => ({ ...prev, tasks: true }))
    try {
      const response = await axios.get("/api/congviec", {
        params: { uId: session?.user?.uId },
      })
      setTasks(response.data)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast({ variant: "destructive", description: "Không thể tải dữ liệu công việc" })
    } finally {
      setIsLoading((prev) => ({ ...prev, tasks: false }))
    }
  }

  // Handle season operations
  const handleAddSeason = async (season: Partial<Season>) => {
    try {
      await axios.post("/api/muavu", {
        ...season,
        uId: session?.user?.uId,
        xId: session?.user?.xId,
      })
      toast({ description: "Thêm mùa vụ thành công" })
      fetchSeasons()
    } catch (error) {
      console.error("Error adding season:", error)
      toast({ variant: "destructive", description: "Không thể thêm mùa vụ" })
    }
  }

  const handleUpdateSeason = async (season: Season) => {
    try {
      await axios.put(`/api/muavu/${season._id}`, season)
      toast({ description: "Cập nhật mùa vụ thành công" })
      fetchSeasons()
    } catch (error) {
      console.error("Error updating season:", error)
      toast({ variant: "destructive", description: "Không thể cập nhật mùa vụ" })
    }
  }

  const handleDeleteSeason = async (id: string) => {
    try {
      await axios.delete(`/api/muavu/${id}`)
      toast({ description: "Xóa mùa vụ thành công" })
      fetchSeasons()
    } catch (error) {
      console.error("Error deleting season:", error)
      toast({ variant: "destructive", description: "Không thể xóa mùa vụ" })
    }
  }

  // Handle stage operations
  const handleAddStage = async (stage: Partial<Stage>) => {
    try {
      await axios.post("/api/giaidoan", {
        ...stage,
        uId: session?.user?.uId,
        xId: session?.user?.xId,
      })
      toast({ description: "Thêm giai đoạn thành công" })
      fetchStages()
    } catch (error) {
      console.error("Error adding stage:", error)
      toast({ variant: "destructive", description: "Không thể thêm giai đoạn" })
    }
  }

  const handleUpdateStage = async (stage: Stage) => {
    try {
      await axios.put(`/api/giaidoan/${stage._id}`, stage)
      toast({ description: "Cập nhật giai đoạn thành công" })
      fetchStages()
    } catch (error) {
      console.error("Error updating stage:", error)
      toast({ variant: "destructive", description: "Không thể cập nhật giai đoạn" })
    }
  }

  const handleDeleteStage = async (id: string) => {
    try {
      await axios.delete(`/api/giaidoan/${id}`)
      toast({ description: "Xóa giai đoạn thành công" })
      fetchStages()
    } catch (error) {
      console.error("Error deleting stage:", error)
      toast({ variant: "destructive", description: "Không thể xóa giai đoạn" })
    }
  }

  // Handle task operations
  const handleAddTask = async (task: Partial<Task>) => {
    try {
      await axios.post("/api/congviec", {
        ...task,
        uId: session?.user?.uId,
        xId: session?.user?.xId,
      })
      toast({ description: "Thêm công việc thành công" })
      fetchTasks()
    } catch (error) {
      console.error("Error adding task:", error)
      toast({ variant: "destructive", description: "Không thể thêm công việc" })
    }
  }

  const handleUpdateTask = async (task: Task) => {
    try {
      await axios.put(`/api/congviec/${task._id}`, task)
      toast({ description: "Cập nhật công việc thành công" })
      fetchTasks()
    } catch (error) {
      console.error("Error updating task:", error)
      toast({ variant: "destructive", description: "Không thể cập nhật công việc" })
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      await axios.delete(`/api/congviec/${id}`)
      toast({ description: "Xóa công việc thành công" })
      fetchTasks()
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({ variant: "destructive", description: "Không thể xóa công việc" })
    }
  }

  const handleRefresh = () => {
    fetchData()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-green-50 p-3 md:p-6"
    >
      <div className="max-w-7xl mx-auto">
        <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between pb-2 space-y-4 md:space-y-0 bg-gradient-to-r from-lime-100 to-green-100">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800">Quản lý danh mục</CardTitle>
              <CardDescription className="text-slate-600">
                Quản lý mùa vụ, giai đoạn và công việc cho nhật ký canh tác
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                className="h-9 w-9 rounded-full bg-white"
                title="Làm mới"
              >
                <RefreshCw className="h-4 w-4 text-lime-700" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4 bg-white border-b border-lime-200">
                <TabsTrigger
                  value="seasons"
                  className="py-3 flex items-center justify-center gap-2 data-[state=active]:bg-lime-50 data-[state=active]:text-lime-800 data-[state=active]:border-b-2 data-[state=active]:border-lime-500 hover:bg-lime-50"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Mùa vụ
                </TabsTrigger>
                <TabsTrigger
                  value="stages"
                  className="py-3 flex items-center justify-center gap-2 data-[state=active]:bg-lime-50 data-[state=active]:text-lime-800 data-[state=active]:border-b-2 data-[state=active]:border-lime-500 hover:bg-lime-50"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Giai đoạn
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  className="py-3 flex items-center justify-center gap-2 data-[state=active]:bg-lime-50 data-[state=active]:text-lime-800 data-[state=active]:border-b-2 data-[state=active]:border-lime-500 hover:bg-lime-50"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Công việc
                </TabsTrigger>
              </TabsList>

              <TabsContent value="seasons" className="mt-0">
                <SeasonManager
                  seasons={seasons}
                  isLoading={isLoading.seasons}
                  onAdd={handleAddSeason}
                  onUpdate={handleUpdateSeason}
                  onDelete={handleDeleteSeason}
                />
              </TabsContent>

              <TabsContent value="stages" className="mt-0">
                <StageManager
                  stages={stages}
                  isLoading={isLoading.stages}
                  onAdd={handleAddStage}
                  onUpdate={handleUpdateStage}
                  onDelete={handleDeleteStage}
                />
              </TabsContent>

              <TabsContent value="tasks" className="mt-0">
                <TaskManager
                  tasks={tasks}
                  stages={stages}
                  isLoading={isLoading.tasks}
                  onAdd={handleAddTask}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                  setActiveTab={setActiveTab}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}


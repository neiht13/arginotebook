"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/ui/page-header"
import Spinner from "@/components/ui/spinner"
import UnitManagement from "./components/UnitManagement"
import UserManagement from "./components/UserManagement"
import Statistics from "./components/Statistics"
import { useToast } from "@/components/ui/use-toast"

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("units")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Kiểm tra quyền truy cập
    if (status === "authenticated") {
      if (!session?.user?.role?.includes("ADMIN")) {
        toast({
          variant: "destructive",
          title: "Không có quyền truy cập",
          description: "Bạn không có quyền truy cập trang này"
        })
        router.push("/timeline")
      }
      setIsLoading(false)
    } else if (status === "unauthenticated") {
      router.push("/auth")
    }
  }, [status, session, router, toast])

  if (isLoading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <PageHeader
        title="Bảng điều khiển quản trị viên"
        description="Quản lý đơn vị, tài khoản người dùng và xem thống kê"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="units">Quản lý đơn vị</TabsTrigger>
          <TabsTrigger value="users">Quản lý người dùng</TabsTrigger>
          <TabsTrigger value="statistics">Thống kê</TabsTrigger>
        </TabsList>

        <TabsContent value="units" className="mt-6">
          <UnitManagement />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          <Statistics />
        </TabsContent>
      </Tabs>
    </div>
  )
}

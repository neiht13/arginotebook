"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/ui/page-header"
import { Users, Building2, Award, BarChart } from "lucide-react"
import UnitManagement from "./components/UnitManagement"
import UserManagement from "./components/UserManagement"
import CertificationManagement from "./components/CertificationManagement"
import Statistics from "./components/Statistics"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("units")

  // Kiểm tra quyền admin
  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">Đang tải...</div>
  }

  if (status === "unauthenticated" || !session?.user.role?.includes("ADMIN")) {
    // Nếu không phải admin, chuyển hướng về trang chính
    router.push("/")
    toast({
      title: "Không có quyền truy cập",
      description: "Bạn không có quyền truy cập vào trang quản trị.",
      variant: "destructive",
    })
    return null
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader title="Quản trị hệ thống" description="Quản lý đơn vị, người dùng và chứng nhận trong hệ thống" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 gap-4 bg-transparent h-auto p-0">
          <TabsTrigger
            value="units"
            className="data-[state=active]:bg-lime-50 data-[state=active]:text-lime-700 data-[state=active]:border-lime-500 border-b-2 border-transparent py-3"
          >
            <Building2 className="mr-2 h-5 w-5" />
            Quản lý đơn vị
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-lime-50 data-[state=active]:text-lime-700 data-[state=active]:border-lime-500 border-b-2 border-transparent py-3"
          >
            <Users className="mr-2 h-5 w-5" />
            Quản lý người dùng
          </TabsTrigger>
          <TabsTrigger
            value="certifications"
            className="data-[state=active]:bg-lime-50 data-[state=active]:text-lime-700 data-[state=active]:border-lime-500 border-b-2 border-transparent py-3"
          >
            <Award className="mr-2 h-5 w-5" />
            Quản lý chứng nhận
          </TabsTrigger>
          <TabsTrigger
            value="statistics"
            className="data-[state=active]:bg-lime-50 data-[state=active]:text-lime-700 data-[state=active]:border-lime-500 border-b-2 border-transparent py-3"
          >
            <BarChart className="mr-2 h-5 w-5" />
            Thống kê
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardContent className="p-6">
            <TabsContent value="units" className="mt-0">
              <UnitManagement />
            </TabsContent>
            <TabsContent value="users" className="mt-0">
              <UserManagement />
            </TabsContent>
            <TabsContent value="certifications" className="mt-0">
              <CertificationManagement />
            </TabsContent>
            <TabsContent value="statistics" className="mt-0">
              <Statistics />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}


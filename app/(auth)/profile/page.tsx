"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import PersonalInfoForm from "./PersonalInfoForm"
import ChangePasswordForm from "./ChangePasswordForm"
import ProductInfoForm from "./ProductInfoForm"
import { LogOut, User, Lock, Package, Camera } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { toast } from "react-toastify"
import axios from "axios"

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    avatar: "/placeholder.svg?height=100&width=100",
    phone: "",
    address: "",
    location: { lat: 10.452992, lng: 105.6178176 },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("personal")
  const { data: session, status } = useSession()
  const router = useRouter()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      if (status === "authenticated" && session?.user?.uId) {
        const response = await axios.get("/api/user?id=" + session.user.uId)
        const data = response.data
        setUser({
          ...data,
          avatar: data.avatar || "/placeholder.svg?height=100&width=100",
          location: data.location || { lat: 10.452992, lng: 105.6178176 },
        })
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast.error("Không thể tải thông tin người dùng")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status !== "loading") {
      fetchData()
    }
  }, [status])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create a preview
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setUser((prev) => ({ ...prev, avatar: result || prev.avatar }))
    }
    reader.readAsDataURL(file)

    // Upload the file
    try {
      const formData = new FormData()
      formData.append("file", file)

      // Compress and upload the image
      const response = await axios.post("/api/compress-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.url) {
        // Update user with the new avatar URL
        await axios.put("/api/user", {
          id: session?.user?.uId,
          avatar: response.data.url,
        })
        toast.success("Ảnh đại diện đã được cập nhật")
      }
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast.error("Không thể tải lên ảnh đại diện")
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: "/auth" }).then(() => toast.success("Đã đăng xuất"))
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 md:p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-5xl mx-auto">
        <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
          <CardHeader className="relative flex flex-col items-center space-y-4 p-6 pb-0 border-b border-slate-100">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="absolute top-4 right-4 text-slate-500 hover:text-red-500 hover:bg-red-50"
              title="Đăng xuất"
            >
              <LogOut className="h-5 w-5" />
            </Button>

            {isLoading ? (
              <Skeleton className="h-24 w-24 rounded-full" />
            ) : (
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-lime-100 text-lime-800 text-xl">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-lime-500 text-white rounded-full p-2 cursor-pointer hover:bg-lime-600 transition-colors shadow-md"
                  title="Thay đổi ảnh đại diện"
                >
                  <Camera className="w-4 h-4" />
                </label>
                <Input
                  id="avatar-upload"
                  type="file"
                  className="hidden"
                  onChange={handleAvatarChange}
                  accept="image/*"
                />
              </div>
            )}

            <div className="text-center">
              {isLoading ? (
                <>
                  <Skeleton className="h-7 w-40 mx-auto mb-2" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                </>
              ) : (
                <>
                  <CardTitle className="text-2xl font-bold text-slate-800">{user.name || "Người dùng"}</CardTitle>
                  <CardDescription className="text-slate-500">{user.email || "Email chưa cập nhật"}</CardDescription>
                </>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
              <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-t-lg">
                <TabsTrigger
                  value="personal"
                  className="data-[state=active]:bg-white data-[state=active]:text-lime-700 rounded-md"
                >
                  <User className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Thông Tin Cá Nhân</span>
                  <span className="sm:hidden">Cá Nhân</span>
                </TabsTrigger>
                <TabsTrigger
                  value="password"
                  className="data-[state=active]:bg-white data-[state=active]:text-lime-700 rounded-md"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Đổi Mật Khẩu</span>
                  <span className="sm:hidden">Mật Khẩu</span>
                </TabsTrigger>
                <TabsTrigger
                  value="product"
                  className="data-[state=active]:bg-white data-[state=active]:text-lime-700 rounded-md"
                >
                  <Package className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Thông Tin Sản Phẩm</span>
                  <span className="sm:hidden">Sản Phẩm</span>
                </TabsTrigger>
              </TabsList>

              <CardContent className="p-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="p-6"
                  >
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <div className="flex justify-end">
                          <Skeleton className="h-10 w-32" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <TabsContent value="personal" className="mt-0">
                          <PersonalInfoForm user={user} setUser={setUser} />
                        </TabsContent>
                        <TabsContent value="password" className="mt-0">
                          <ChangePasswordForm />
                        </TabsContent>
                        <TabsContent value="product" className="mt-0">
                          <ProductInfoForm />
                        </TabsContent>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </motion.div>
  )
}


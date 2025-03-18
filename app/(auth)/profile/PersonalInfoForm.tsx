"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Phone, Mail, User, Home, LocateFixed, AreaChart } from "lucide-react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import { toast } from "react-toastify"
import axios from "axios"

// Import Map component dynamically to avoid SSR issues
const Map = dynamic(() => import("./Map"), { ssr: false })

export default function PersonalInfoForm({ user, setUser }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    cultivationArea: "",
    location: { lat: 10.452992, lng: 105.6178176 },
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: session, status, update } = useSession()

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        cultivationArea: user.cultivationArea || "",
        location: user.location || { lat: 10.452992, lng: 105.6178176 },
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.email) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }

    setIsSubmitting(true)

    try {
      // Update user data via API
      const response = await axios.put("/api/user", {
        id: session?.user?.uId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        cultivationArea: formData.cultivationArea,
        location: formData.location,
      })

      // Update local state
      setUser((prev) => ({
        ...prev,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        cultivationArea: formData.cultivationArea,
        location: formData.location,
      }))

      // Update session data
      if (session) {
        await update({
          ...session,
          user: {
            ...session.user,
            name: formData.name,
            email: formData.email,
          },
        })
      }

      toast.success("Cập nhật thông tin thành công")
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("Không thể cập nhật thông tin người dùng")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLocationSelect = (location) => {
    setFormData((prev) => ({ ...prev, location }))
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setFormData((prev) => ({ ...prev, location }))
        },
        (error) => {
          console.error("Error getting location:", error)
          toast.error("Không thể lấy vị trí hiện tại")
        },
      )
    } else {
      toast.error("Trình duyệt của bạn không hỗ trợ định vị")
    }
  }

  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Họ tên */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="name" className="text-sm font-medium text-slate-700 flex items-center">
          <User className="w-4 h-4 mr-2 text-slate-500" />
          Họ Tên <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Nhập họ tên"
          className="border-slate-300 focus:border-lime-500 focus:ring-lime-500"
        />
      </motion.div>

      {/* Email */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center">
          <Mail className="w-4 h-4 mr-2 text-slate-500" />
          Email <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Nhập email"
          className="border-slate-300 focus:border-lime-500 focus:ring-lime-500"
        />
      </motion.div>

      {/* Diện tích canh tác */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="cultivationArea" className="text-sm font-medium text-slate-700 flex items-center">
          <AreaChart className="w-4 h-4 mr-2 text-slate-500" />
          Diện tích canh tác
        </Label>
        <Input
          id="cultivationArea"
          name="cultivationArea"
          value={formData.cultivationArea}
          onChange={handleChange}
          placeholder="Nhập diện tích canh tác (ha)"
          className="border-slate-300 focus:border-lime-500 focus:ring-lime-500"
        />
      </motion.div>

      {/* Số điện thoại */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="phone" className="text-sm font-medium text-slate-700 flex items-center">
          <Phone className="w-4 h-4 mr-2 text-slate-500" />
          Số Điện Thoại
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Nhập số điện thoại"
          className="border-slate-300 focus:border-lime-500 focus:ring-lime-500"
        />
      </motion.div>

      {/* Địa chỉ */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="address" className="text-sm font-medium text-slate-700 flex items-center">
          <Home className="w-4 h-4 mr-2 text-slate-500" />
          Địa Chỉ
        </Label>
        <Textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Nhập địa chỉ"
          className="border-slate-300 focus:border-lime-500 focus:ring-lime-500 min-h-[80px]"
        />
      </motion.div>

      {/* Vị trí trên bản đồ */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <Label className="text-sm font-medium text-slate-700 flex items-center">
          <LocateFixed className="w-4 h-4 mr-2 text-slate-500" />
          Vị Trí Trên Bản Đồ
        </Label>
        <div className="relative h-[300px] rounded-md overflow-hidden border border-slate-300">
          <Map location={formData.location} onLocationSelect={handleLocationSelect} />
          <Button
            type="button"
            onClick={handleGetCurrentLocation}
            size="sm"
            className="absolute z-10 top-2 right-2 bg-white text-slate-700 hover:bg-lime-500 hover:text-white"
          >
            <LocateFixed className="w-4 h-4 mr-2" />
            Lấy vị trí hiện tại
          </Button>
        </div>
      </motion.div>

      {/* Nút Lưu */}
      <motion.div className="flex justify-end pt-4" variants={itemVariants}>
        <Button type="submit" disabled={isSubmitting} className="bg-lime-500 hover:bg-lime-600 text-white px-6">
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Đang lưu...
            </>
          ) : (
            "Lưu Thay Đổi"
          )}
        </Button>
      </motion.div>
    </motion.form>
  )
}


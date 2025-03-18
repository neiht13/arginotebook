"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, Lock, AlertCircle, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import { toast } from "react-toastify"
import axios from "axios"

export default function ChangePasswordForm() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: session } = useSession()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
    setSuccess("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { currentPassword, newPassword, confirmPassword } = formData

    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.")
      return
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.")
      return
    }

    setIsSubmitting(true)

    try {
      // Call API to change password
      await axios.post("/api/user/change-password", {
        userId: session?.user?.uId,
        currentPassword,
        newPassword,
      })

      setSuccess("Đổi mật khẩu thành công!")
      toast.success("Đổi mật khẩu thành công!")

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error changing password:", error)
      const errorMessage = error.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
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
      {/* Mật khẩu hiện tại */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="currentPassword" className="text-sm font-medium text-slate-700 flex items-center">
          <Lock className="w-4 h-4 mr-2 text-slate-500" />
          Mật Khẩu Hiện Tại <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          value={formData.currentPassword}
          onChange={handleChange}
          required
          placeholder="Nhập mật khẩu hiện tại"
          className="border-slate-300 focus:border-lime-500 focus:ring-lime-500"
        />
      </motion.div>

      {/* Mật khẩu mới */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="newPassword" className="text-sm font-medium text-slate-700 flex items-center">
          <Key className="w-4 h-4 mr-2 text-slate-500" />
          Mật Khẩu Mới <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={handleChange}
          required
          placeholder="Nhập mật khẩu mới"
          className="border-slate-300 focus:border-lime-500 focus:ring-lime-500"
        />
      </motion.div>

      {/* Xác nhận mật khẩu mới */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 flex items-center">
          <Key className="w-4 h-4 mr-2 text-slate-500" />
          Xác Nhận Mật Khẩu Mới <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          placeholder="Xác nhận mật khẩu mới"
          className="border-slate-300 focus:border-lime-500 focus:ring-lime-500"
        />
      </motion.div>

      {/* Thông báo lỗi hoặc thành công */}
      {error && (
        <motion.div variants={itemVariants}>
          <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {success && (
        <motion.div variants={itemVariants}>
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        </motion.div>
      )}

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
              Đang xử lý...
            </>
          ) : (
            "Đổi Mật Khẩu"
          )}
        </Button>
      </motion.div>
    </motion.form>
  )
}


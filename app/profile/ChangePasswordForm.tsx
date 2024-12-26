// ChangePasswordForm.jsx
"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Key, Lock } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ChangePasswordForm() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
    setSuccess('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const { currentPassword, newPassword, confirmPassword } = formData

    // Basic validation
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp.')
      return
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.')
      return
    }

    // Here you would typically send the data to your backend
    console.log('Submitting:', formData)
    setSuccess('Đổi mật khẩu thành công!')
    // Reset form
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Mật khẩu hiện tại */}
      <div className="flex items-center space-x-2">
        <Lock className="w-5 h-5 text-gray-500" />
        <div className="flex-1">
          <Label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
            Mật Khẩu Hiện Tại
          </Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={handleChange}
            required
            placeholder="Nhập mật khẩu hiện tại"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Mật khẩu mới */}
      <div className="flex items-center space-x-2">
        <Key className="w-5 h-5 text-gray-500" />
        <div className="flex-1">
          <Label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
            Mật Khẩu Mới
          </Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            required
            placeholder="Nhập mật khẩu mới"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Xác nhận mật khẩu mới */}
      <div className="flex items-center space-x-2">
        <Key className="w-5 h-5 text-gray-500" />
        <div className="flex-1">
          <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Xác Nhận Mật Khẩu Mới
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Xác nhận mật khẩu mới"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Thông báo lỗi hoặc thành công */}
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {success && <div className="text-green-500 text-sm">{success}</div>}

      {/* Nút Lưu */}
      <div className="flex justify-end">
        <Button type="submit" className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow">
          <span>Đổi Mật Khẩu</span>
        </Button>
      </div>
    </motion.form>
  )
}

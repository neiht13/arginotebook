// PersonalInfoForm.jsx
"use client"

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, User, Home } from 'lucide-react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

const Map = dynamic(() => import('./Map'), { ssr: false })

export default function PersonalInfoForm({ user, setUser }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    location: { lat: 10.452992, lng: 105.6178176 }, 
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        location: user.location || { lat: 10.452992, lng: 105.6178176 },
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Xử lý thêm mới hoặc cập nhật dữ liệu
    console.log('Submitting:', formData)
    setUser(prev => ({ ...prev, name: formData.name, email: formData.email, phone: formData.phone, address: formData.address, location: formData.location }))
  }

  const handleLocationSelect = (location) => {
    setFormData(prev => ({ ...prev, location }))
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setFormData(prev => ({ ...prev, location }))
        },
        (error) => {
          console.error("Error getting location:", error)
        }
      )
    } else {
      console.error("Geolocation is not supported by this browser.")
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6 mb-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Họ tên */}
      <div className="flex items-center space-x-2">
        <User className="w-5 h-5 text-slate-500" />
        <div className="flex-1">
          <Label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Họ Tên
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Nhập họ tên"
            className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Email */}
      <div className="flex items-center space-x-2">
        <Mail className="w-5 h-5 text-slate-500" />
        <div className="flex-1">
          <Label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Nhập email"
            className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Số điện thoại */}
      <div className="flex items-center space-x-2">
        <Phone className="w-5 h-5 text-slate-500" />
        <div className="flex-1">
          <Label htmlFor="phone" className="block text-sm font-medium text-slate-700">
            Số Điện Thoại
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Nhập số điện thoại"
            className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Địa chỉ */}
      <div className="flex items-start space-x-2">
        <Home className="w-5 h-5 text-slate-500 mt-1" />
        <div className="flex-1">
          <Label htmlFor="address" className="block text-sm font-medium text-slate-700">
            Địa Chỉ
          </Label>
          <Textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Nhập địa chỉ"
            className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Vị trí trên bản đồ */}
      <div className="space-y-2" style={{zIndex: -1}}>
        <Label className="block text-sm font-medium text-slate-700">
          Vị Trí Trên Bản Đồ
        </Label>
        <div className="relative h-72">
          <Map location={formData.location} onLocationSelect={handleLocationSelect} />
          <Button
            type="button"
            onClick={handleGetCurrentLocation}
            className="absolute z-10 top-2 right-2 flex items-center space-x-1 bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1 rounded-md shadow"
          >
            <MapPin className="w-4 h-4" />
            <span>Lấy Vị Trí</span>
          </Button>
        </div>
      </div>

      {/* Nút Lưu */}
      <div className="flex justify-end">
        <Button type="submit" className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md shadow">
          <span>Lưu Thay Đổi</span>
        </Button>
      </div>
    </motion.form>
  )
}

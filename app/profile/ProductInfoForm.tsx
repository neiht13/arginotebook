// ProductInfoForm.jsx
"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, ImagePlus, MagnetIcon, InfoIcon, AppleIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Icon } from 'lucide-react';
import { fruit } from '@lucide/lab';

export default function ProductInfoForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    images: []
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)

  // Giải phóng Object URLs khi component unmount hoặc images thay đổi
  useEffect(() => {
    return () => {
      formData.images.forEach(image => URL.revokeObjectURL(image))
    }
  }, [formData.images])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
    setSuccess('')
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const remainingSlots = 5 - formData.images.length
    if (files.length > remainingSlots) {
      setError(`Bạn chỉ có thể tải lên tối đa ${remainingSlots} hình ảnh.`)
      return
    }
    const newImages = files.map(file => URL.createObjectURL(file))
    setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }))
    setSuccess('')
    // Reset giá trị của input file để có thể tải lên cùng một file nhiều lần
    e.target.value = null
  }

  const handleRemoveImage = (index) => {
    // Giải phóng Object URL của hình ảnh bị xóa
    URL.revokeObjectURL(formData.images[index])
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    setError('')
    setSuccess('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Kiểm tra lại số lượng hình ảnh
    if (formData.images.length === 0) {
      setError('Vui lòng tải lên ít nhất một hình ảnh cho sản phẩm.')
      return
    }

    // Xử lý thêm mới hoặc cập nhật dữ liệu
    console.log('Submitting:', formData)
    setSuccess('Thông tin sản phẩm đã được lưu thành công!')
    // Reset form
    setFormData({
      name: '',
      description: '',
      images: []
    })
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-2">
      <Icon iconNode={fruit} className="w-5 h-5 text-gray-500" />

      <div className="flex-1">
        <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Tên Sản Phẩm
        </Label>
        <div className="flex-1">
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Nhập tên sản phẩm"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      </div>


      {/* Mô tả sản phẩm */}
      <div className="flex items-start space-x-2"> 
        <InfoIcon className="w-5 h-5 text-gray-500" />
      <div className="flex-1">
        <Label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Mô Tả Sản Phẩm
        </Label>
        <div className="flex-1">
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Nhập mô tả sản phẩm"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>
      </div>
      </div>

      {/* Tải lên hình ảnh */}
      <div className="space-y-2">
        <Label htmlFor="image-upload" className="block text-sm font-medium text-gray-700">
          Hình Ảnh Sản Phẩm (tối đa 5 ảnh)
        </Label>
        <div className="flex items-center space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={triggerFileInput}
            className="flex items-center space-x-2"
          >
            <ImagePlus className="w-4 h-4" />
            <span>Tải Lên Hình Ảnh</span>
          </Button>
          <Input
            ref={fileInputRef}
            id="image-upload"
            name="images"
            type="file"
            multiple
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <span className="text-sm text-gray-500">
            {formData.images.length}/5 đã tải lên
          </span>
        </div>
        {/* Thông báo lỗi hoặc thành công */}
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-500 text-sm">{success}</div>}
        {/* Hiển thị hình ảnh đã tải lên */}
        {formData.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {formData.images.map((image, index) => (
              <motion.div
                key={index}
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <img src={image} alt={`Product ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 p-1 bg-white rounded-full shadow"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="w-3 h-3 text-red-500" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Nút Lưu */}
      <div className="flex justify-end">
        <Button type="submit" className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow">
          <span>Lưu Thông Tin Sản Phẩm</span>
        </Button>
      </div>
    </motion.form>
  )
}

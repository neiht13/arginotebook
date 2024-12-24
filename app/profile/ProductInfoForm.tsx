"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X } from 'lucide-react'

export default function ProductInfoForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    images: []
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const remainingSlots = 5 - formData.images.length
    const newImages = files.slice(0, remainingSlots).map(file => URL.createObjectURL(file))
    setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }))
  }

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log('Submitting:', formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Tên sản phẩm</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Mô tả sản phẩm</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="images">Hình ảnh sản phẩm (tối đa 5 ảnh)</Label>
        <Input 
          id="images" 
          name="images" 
          type="file" 
          multiple 
          onChange={handleImageUpload} 
          accept="image/*" 
          disabled={formData.images.length >= 5}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {formData.images.map((image, index) => (
            <div key={index} className="relative">
              <img src={image} alt={`Product ${index + 1}`} className="w-full h-32 object-cover rounded" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1"
                onClick={() => handleRemoveImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      <Button type="submit">Lưu thông tin sản phẩm</Button>
    </form>
  )
}


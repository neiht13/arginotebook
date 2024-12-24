"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin } from 'lucide-react'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./Map'), { ssr: false })

export default function PersonalInfoForm({ user, setUser }) {
  const [formData, setFormData] = useState({
    name: user?.name,
    email: user?.email,
    phone: '',
    address: '',
    location: { lat: 10.762622, lng: 106.660172 } // Default to Ho Chi Minh City
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log('Submitting:', formData)
    setUser(prev => ({ ...prev, name: formData.name, email: formData.email }))
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Họ tên</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Địa chỉ</Label>
        <Textarea id="address" name="address" value={formData.address} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label>Vị trí trên bản đồ</Label>
        <Map location={formData.location} onLocationSelect={handleLocationSelect} />
        <Button type="button" onClick={handleGetCurrentLocation} className="mt-2">
          <MapPin className="mr-2 h-4 w-4" /> Lấy vị trí hiện tại
        </Button>
      </div>
      <Button type="submit">Lưu thay đổi</Button>
    </form>
  )
}


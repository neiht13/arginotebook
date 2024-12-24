"use client"

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Satellite } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const users = [
  { id: 1, name: 'Nguyễn Văn A', lat: 10.762622, lng: 106.660172 },
  { id: 2, name: 'Trần Thị B', lat: 10.773831, lng: 106.704895 },
  { id: 3, name: 'Lê Văn C', lat: 10.792839, lng: 106.674385 },
]

export default function CultivationMap() {
  const mapRef = useRef(null)
  const [isSatellite, setIsSatellite] = useState(false)
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([10.762622, 106.660172], 12)

      updateMapLayer()

      users.forEach(user => {
        L.marker([user.lat, user.lng], {
          icon: L.icon({
            iconUrl: '/marker-icon-2x.png', // Thêm hình ảnh biểu tượng người dùng
            shadowUrl: '/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          })
        })
          .addTo(mapRef.current)
          .bindPopup(`<b>${user.name}</b>`)
      })
    }
  }, [])

  useEffect(() => {
    updateMapLayer()
  }, [isSatellite])

  const updateMapLayer = () => {
    if (mapRef.current) {
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          mapRef.current.removeLayer(layer)
        }
      })

      const tileUrl = isSatellite
        ? 'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
        : 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'

      L.tileLayer(tileUrl, { subdomains:['mt0','mt1','mt2','mt3'], attribution: "pht" }).addTo(mapRef.current)
    }
  }

  const toggleMapView = () => {
    setIsSatellite(!isSatellite)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  return (
    <div className="h-auto  bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-lg rounded-lg bg-white">
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-extrabold text-gray-800 flex items-center">
            🗺️ Bản Đồ Vùng Canh Tác
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={toggleMapView}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Satellite className="w-5 h-5 mr-2" />
              {isSatellite ? 'Chế độ Đường' : 'Chế độ Vệ Tinh'}
            </Button>
            <AnimatePresence>
              {showNotification && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Chế độ bản đồ đã được cập nhật!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div id="map" className="h-96 rounded-lg shadow-md overflow-hidden"></div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import { MapPin, Satellite } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'


const users = [
  { id: 1, name: 'Nguyễn Văn A', lat: 10.762622, lng: 106.660172 },
  { id: 2, name: 'Trần Thị B', lat: 10.773831, lng: 106.704895 },
  { id: 3, name: 'Lê Văn C', lat: 10.792839, lng: 106.674385 },
  // Thêm nhiều người dùng hơn nếu cần
]

export default function CultivationMap() {
  const mapRef = useRef(null)
  const markerClusterGroupRef = useRef(null)
  const [isSatellite, setIsSatellite] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [activePopup, setActivePopup] = useState(null) // Trạng thái theo dõi popup hiện tại

  useEffect(() => {
    if (!mapRef.current) {
      // Khởi tạo bản đồ
      mapRef.current = L.map('map').setView([10.762622, 106.660172], 12)

      updateMapLayer()

      // Tạo nhóm marker cluster
      markerClusterGroupRef.current = L.markerClusterGroup()
      mapRef.current.addLayer(markerClusterGroupRef.current)

      // Thêm các marker vào nhóm cluster
      users.forEach(user => {
        const marker = L.marker([user.lat, user.lng], {
          icon: L.icon({
            iconUrl: '/marker-icon-2x.png', // Đảm bảo đường dẫn đúng đến hình ảnh
            shadowUrl: '/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          })
        })

        // Tạo popup cho marker
        const popup = L.popup({ closeOnClick: false, autoClose: false })
            .setContent(`<b>${user.name}</b>`)

        // Bắt sự kiện mở popup
        marker.on('click', () => {
          if (activePopup && activePopup !== popup) {
            activePopup.close()
          }
          popup.openOn(mapRef.current)
          setActivePopup(popup)
        })

        // Thêm marker và popup vào nhóm cluster
        marker.bindPopup(popup)
        markerClusterGroupRef.current.addLayer(marker)
      })

      // Mở popup đầu tiên khi bản đồ được tải
      if (users.length > 0) {
        const firstMarker = markerClusterGroupRef.current.getLayers()[0]
        if (firstMarker) {
          firstMarker.openPopup()
          setActivePopup(firstMarker.getPopup())
        }
      }
    }
  }, [activePopup])

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

      L.tileLayer(tileUrl, {
        subdomains:['mt0','mt1','mt2','mt3'],
        attribution: "pht"
      }).addTo(mapRef.current)
    }
  }

  const toggleMapView = () => {
    setIsSatellite(!isSatellite)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  return (
      <div className="h-auto bg-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl shadow-lg rounded-lg bg-white">
          <CardHeader className="border-b">
            <CardTitle className="text-3xl font-extrabold text-slate-800 flex items-center">
              🗺️ Bản Đồ Vùng Canh Tác
            </CardTitle>
          </CardHeader>
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                  onClick={toggleMapView}
                  className="flex items-center px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition"
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
                        className="flex items-center bg-lime-100 border border-lime-400 text-lime-700 px-4 py-2 rounded-lg"
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

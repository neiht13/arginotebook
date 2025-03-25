"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"
import "leaflet.markercluster"
import { MapPin, Satellite, Search, Users, RefreshCw, ZoomIn } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"

// Định nghĩa kiểu dữ liệu cho người dùng
interface User {
  id: number | string
  name: string
  location: {
    lat: number
    lng: number
  }
  xId?: string
  avatar?: string
  farmSize?: string
  cropType?: string
}

export default function CultivationMap() {
  const mapRef = useRef<L.Map | null>(null)
  const markerClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null)
  const [isSatellite, setIsSatellite] = useState(false)
  const [showNotification, setShowNotification] = useState<string | null>(null)
  const [activePopup, setActivePopup] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [xIdFilter, setXIdFilter] = useState("")
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])

  // Lấy danh sách người dùng từ API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/users')
        const data = await response.json()
        setUsers(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching users:", error)
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  // Lọc người dùng dựa trên tìm kiếm và xId
  useEffect(() => {
    let result = users
    if (xIdFilter) {
      result = result.filter(user => user.xId === xIdFilter)
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(user => 
        user.name.toLowerCase().includes(term) || 
        user.xId?.toLowerCase().includes(term) ||
        user.cropType?.toLowerCase().includes(term)
      )
    }
    setFilteredUsers(result)
    if (result.length === 0 && (searchTerm || xIdFilter)) {
      setShowNotification("Không tìm thấy người dùng phù hợp.")
      setTimeout(() => setShowNotification(null), 3000)
    }
  }, [users, searchTerm, xIdFilter])

  // Khởi tạo và cập nhật bản đồ
  useEffect(() => {
    if (!mapRef.current && !loading && filteredUsers.length > 0) {
      // Fix Leaflet default icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })

      const center = filteredUsers.length > 0 
        ? [filteredUsers[0].location.lat, filteredUsers[0].location.lng] as L.LatLngTuple
        : [10.762622, 106.660172] as L.LatLngTuple
        
      mapRef.current = L.map("map", { zoomControl: true }).setView(center, 12)
      updateMapLayer()

      markerClusterGroupRef.current = L.markerClusterGroup({
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount()
          return L.divIcon({
            html: `<div class="cluster-icon">${count}</div>`,
            className: 'custom-cluster-icon',
            iconSize: L.point(45, 45)
          })
        }
      })
      mapRef.current.addLayer(markerClusterGroupRef.current)
      updateMarkers()
    } else if (mapRef.current && !loading) {
      updateMarkers()
    }
  }, [filteredUsers, loading])

  useEffect(() => {
    if (mapRef.current) {
      updateMapLayer()
    }
  }, [isSatellite])

  const updateMapLayer = () => {
    if (mapRef.current) {
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          mapRef.current.removeLayer(layer)
        }
      })

      const tileUrl = isSatellite
        ? "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
        : "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"

      L.tileLayer(tileUrl, {
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: "© Google Maps",
      }).addTo(mapRef.current)
    }
  }

  const updateMarkers = () => {
    if (markerClusterGroupRef.current && mapRef.current) {
      markerClusterGroupRef.current.clearLayers()

      filteredUsers.forEach((user) => {
        const customIcon = L.divIcon({
          className: 'custom-marker-icon',
          html: `
            <div class="marker-container">
              <div class="marker-avatar" style="background-image: url('${user.avatar || "/placeholder.svg?height=50&width=50"}')"></div>
            </div>
          `,
          iconSize: [50, 50],
          iconAnchor: [25, 50],
          popupAnchor: [0, -45]
        })

        const marker = L.marker([user.location.lat, user.location.lng], { icon: customIcon })
        const popupContent = `
          <div class="custom-popup">
            <div class="popup-header">
              <img src="${user.avatar || "/placeholder.svg?height=50&width=50"}" alt="${user.name}" class="popup-avatar">
              <div class="popup-title">
                <h3>${user.name}</h3>
                <span class="popup-xid">Mã đơn vị: ${user.xId || "Không có"}</span>
              </div>
            </div>
            <div class="popup-content">
              <p><strong>Diện tích:</strong> ${user.farmSize || "Chưa cập nhật"}</p>
              <p><strong>Loại cây:</strong> ${user.cropType || "Chưa cập nhật"}</p>
            </div>
          </div>
        `

        const popup = L.popup({ 
          closeOnClick: false, 
          autoClose: false,
          className: 'custom-leaflet-popup'
        }).setContent(popupContent)

        marker.on("click", () => {
          if (activePopup && activePopup !== popup) {
            activePopup.close()
          }
          popup.openOn(mapRef.current)
          setActivePopup(popup)
        })

        marker.bindPopup(popup)
        markerClusterGroupRef.current.addLayer(marker)
      })

      // Thêm style cho marker, cluster, và popup
      const style = document.createElement('style')
      style.textContent = `
        .custom-cluster-icon {
          background: linear-gradient(135deg, #84cc16, #65a30d);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
          border: 3px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
        .cluster-icon {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .custom-marker-icon {
          background: transparent;
        }
        .marker-container {
          width: 50px;
          height: 50px;
          position: relative;
        }
        .marker-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-size: cover;
          background-position: center;
          border: 3px solid #84cc16;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          position: absolute;
          top: 0;
          left: 5px;
          animation: pulse 2s infinite;
        }
        .marker-avatar::after {
          content: '';
          position: absolute;
          bottom: -12px;
          left: 12px;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 12px solid #84cc16;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        .custom-leaflet-popup .leaflet-popup-content {
          margin: 0;
          width: 280px !important;
        }
        .custom-popup {
          font-family: 'Inter', sans-serif;
        }
        .popup-header {
          display: flex;
          align-items: center;
          padding: 12px;
          background: linear-gradient(135deg, #84cc16, #65a30d);
          color: white;
        }
        .popup-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          margin-right: 12px;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .popup-title h3 {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
        }
        .popup-xid {
          font-size: 13px;
          opacity: 0.9;
        }
        .popup-content {
          padding: 12px;
          background: white;
        }
        .popup-content p {
          margin: 6px 0;
          font-size: 14px;
          color: #374151;
        }
      `
      document.head.appendChild(style)

      if (filteredUsers.length > 0) {
        const validLocations = filteredUsers
          .filter(user => user.location?.lat && user.location?.lng)
          .map(user => [user.location.lat, user.location.lng] as L.LatLngTuple)

        if (validLocations.length > 0 && mapRef.current) {
          const bounds = L.latLngBounds(validLocations)
          mapRef.current.fitBounds(bounds, { padding: [50, 50] })
        }
      }
    }
  }

  const toggleMapView = () => {
    setIsSatellite(!isSatellite)
    setShowNotification(`Đã chuyển sang chế độ ${isSatellite ? "Đường" : "Vệ Tinh"}`)
    setTimeout(() => setShowNotification(null), 3000)
  }

  const resetFilters = () => {
    setSearchTerm("")
    setXIdFilter("")
  }

  const zoomToAll = () => {
    if (mapRef.current && filteredUsers.length > 0) {
      const validLocations = filteredUsers
        .filter(user => user.location?.lat && user.location?.lng)
        .map(user => [user.location.lat, user.location.lng] as L.LatLngTuple)
      if (validLocations.length > 0) {
        const bounds = L.latLngBounds(validLocations)
        mapRef.current.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }

  const uniqueXIds = [...new Set(users.map(user => user.xId))].filter(Boolean)

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 via-lime-50 to-purple-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Sidebar */}
        <Card className="lg:col-span-1 shadow-lg bg-white/90 backdrop-blur-lg rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-lime-100 to-lime-50 p-5 border-b border-lime-200">
            <CardTitle className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-lime-700 animate-pulse" />
              Quản Lý Người Dùng
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Tìm kiếm */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium text-gray-700">
                Tìm Kiếm
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Tên, mã đơn vị, cây trồng..."
                  className="pl-10 rounded-xl shadow-md border-gray-200 focus:border-lime-500 bg-white/80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Lọc theo xId */}
            <div className="space-y-2">
              <Label htmlFor="xid-filter" className="text-sm font-medium text-gray-700">
                Lọc Theo Mã Đơn Vị
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {loading ? (
                  <>
                    <Skeleton className="h-10 rounded-xl" />
                    <Skeleton className="h-10 rounded-xl" />
                  </>
                ) : (
                  <>
                    <select
                      id="xid-filter"
                      className="flex h-10 w-full rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-lime-500"
                      value={xIdFilter}
                      onChange={(e) => setXIdFilter(e.target.value)}
                    >
                      <option value="">Tất cả đơn vị</option>
                      {uniqueXIds.map((xId) => (
                        <option key={xId} value={xId}>
                          {xId}
                        </option>
                      ))}
                    </select>
                    <Button 
                      variant="outline" 
                      onClick={resetFilters}
                      className="flex items-center gap-2 border-lime-600 text-lime-700 hover:bg-lime-50 rounded-xl shadow-md"
                    >
                      <RefreshCw className="w-4 h-4 animate-spin-slow" />
                      Đặt Lại
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Danh sách người dùng */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-800">Danh Sách ({filteredUsers.length})</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                      onClick={() => {
                        if (mapRef.current && markerClusterGroupRef.current) {
                          const marker = markerClusterGroupRef.current.getLayers().find((layer: any) => {
                            const latLng = layer.getLatLng()
                            return latLng.lat === user.location.lat && latLng.lng === user.location.lng
                          })
                          if (marker) {
                            mapRef.current.setView(marker.getLatLng(), 15)
                            marker.openPopup()
                            setActivePopup(marker.getPopup())
                          }
                        }
                      }}
                    >
                      <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-lime-300 shadow-sm">
                        <img 
                          src={user.avatar || "/placeholder.svg?height=50&width=50"} 
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">{user.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                          <span className="bg-lime-100 text-lime-800 px-2 py-1 rounded-full shadow-sm">
                            {user.xId || "Không có mã"}
                          </span>
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full shadow-sm">
                            {user.cropType || "Chưa có cây"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-600">
                    Không tìm thấy người dùng nào
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="lg:col-span-2 shadow-lg bg-white/90 backdrop-blur-lg rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-lime-100 to-lime-50 p-5 border-b border-lime-200 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-lime-700 animate-bounce" />
              Bản Đồ Vùng Canh Tác
            </CardTitle>
            <div className="flex gap-3">
              <Button
                onClick={toggleMapView}
                className="flex items-center gap-2 bg-lime-600 hover:bg-lime-700 text-white rounded-xl shadow-md"
              >
                <Satellite className="w-4 h-4" />
                {isSatellite ? "Đường" : "Vệ Tinh"}
              </Button>
              <Button
                onClick={zoomToAll}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
              >
                <ZoomIn className="w-4 h-4" />
                Zoom All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <AnimatePresence>
              {showNotification && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center bg-lime-100 border border-lime-300 text-lime-800 px-4 py-2 rounded-xl mb-4 shadow-md"
                >
                  <MapPin className="w-5 h-5 mr-2 animate-bounce" />
                  {showNotification}
                </motion.div>
              )}
            </AnimatePresence>
            
            {loading ? (
              <div className="h-[600px] rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <Skeleton className="h-10 w-10 rounded-full mx-auto mb-3 animate-pulse" />
                  <p className="text-gray-600 font-medium">Đang tải bản đồ...</p>
                </div>
              </div>
            ) : (
              <div id="map" className="h-[600px] rounded-xl overflow-hidden shadow-inner"></div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
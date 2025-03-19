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
import { MapPin, Satellite, Search, Users, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"

// Định nghĩa kiểu dữ liệu cho người dùng
interface User {
  id: number | string
  name: string
  lat: number
  lng: number
  xId?: string
  avatar?: string
  farmSize?: string
  cropType?: string
}

export default function CultivationMap() {
  const mapRef = useRef(null)
  const markerClusterGroupRef = useRef(null)
  const [isSatellite, setIsSatellite] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [activePopup, setActivePopup] = useState(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [xIdFilter, setXIdFilter] = useState("")
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])

  // Mẫu dữ liệu người dùng (sẽ được thay thế bằng API call)
  const sampleUsers: User[] = [
    { 
      id: 1, 
      name: "Nguyễn Văn A", 
      lat: 10.762622, 
      lng: 106.660172, 
      xId: "X001", 
      avatar: "/placeholder.svg?height=50&width=50", 
      farmSize: "5 hecta",
      cropType: "Lúa"
    },
    { 
      id: 2, 
      name: "Trần Thị B", 
      lat: 10.773831, 
      lng: 106.704895, 
      xId: "X001", 
      avatar: "/placeholder.svg?height=50&width=50", 
      farmSize: "3 hecta",
      cropType: "Rau màu"
    },
    { 
      id: 3, 
      name: "Lê Văn C", 
      lat: 10.792839, 
      lng: 106.674385, 
      xId: "X002", 
      avatar: "/placeholder.svg?height=50&width=50", 
      farmSize: "7 hecta",
      cropType: "Cây ăn trái"
    },
    { 
      id: 4, 
      name: "Phạm Thị D", 
      lat: 10.752622, 
      lng: 106.650172, 
      xId: "X002", 
      avatar: "/placeholder.svg?height=50&width=50", 
      farmSize: "4 hecta",
      cropType: "Lúa"
    },
    { 
      id: 5, 
      name: "Hoàng Văn E", 
      lat: 10.783831, 
      lng: 106.714895, 
      xId: "X003", 
      avatar: "/placeholder.svg?height=50&width=50", 
      farmSize: "6 hecta",
      cropType: "Rau màu"
    },
  ]

  // Lấy danh sách người dùng từ API
  useEffect(() => {
    // Giả lập API call
    const fetchUsers = async () => {
      setLoading(true)
      try {
        // Thay thế bằng API call thực tế
        // const response = await fetch('/api/users');
        // const data = await response.json();
        // setUsers(data);
        
        // Sử dụng dữ liệu mẫu
        setTimeout(() => {
          setUsers(sampleUsers)
          setLoading(false)
        }, 1000)
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
  }, [users, searchTerm, xIdFilter])

  // Khởi tạo và cập nhật bản đồ
  useEffect(() => {
    if (!mapRef.current && !loading && filteredUsers.length > 0) {
      // Khởi tạo bản đồ
      const center = filteredUsers.length > 0 
        ? [filteredUsers[0].lat, filteredUsers[0].lng] 
        : [10.762622, 106.660172]
        
      mapRef.current = L.map("map").setView(center, 12)

      updateMapLayer()

      // Tạo nhóm marker cluster
      markerClusterGroupRef.current = L.markerClusterGroup({
        iconCreateFunction: function(cluster) {
          const count = cluster.getChildCount()
          return L.divIcon({
            html: `<div class="cluster-icon">${count}</div>`,
            className: 'custom-cluster-icon',
            iconSize: L.point(40, 40)
          })
        }
      })
      mapRef.current.addLayer(markerClusterGroupRef.current)

      // Thêm style cho cluster icon
      const style = document.createElement('style')
      style.textContent = `
        .custom-cluster-icon {
          background-color: rgba(132, 204, 22, 0.8);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .cluster-icon {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `
      document.head.appendChild(style)

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

  // Cập nhật layer bản đồ (vệ tinh hoặc đường)
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

  // Cập nhật markers trên bản đồ
  const updateMarkers = () => {
    if (markerClusterGroupRef.current) {
      markerClusterGroupRef.current.clearLayers()

      // Thêm các marker vào nhóm cluster
      filteredUsers.forEach((user) => {
        const customIcon = L.divIcon({
          className: 'custom-marker-icon',
          html: `
            <div class="marker-container">
              <div class="marker-avatar" style="background-image: url('${user.avatar || "/placeholder.svg?height=50&width=50"}')"></div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -35]
        })

        const marker = L.marker([user.lat, user.lng], {
          icon: customIcon
        })

        // Tạo popup cho marker với thông tin chi tiết
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
              <p><strong>Loại cây trồng:</strong> ${user.cropType || "Chưa cập nhật"}</p>
            </div>
          </div>
        `

        const popup = L.popup({ 
          closeOnClick: false, 
          autoClose: false,
          className: 'custom-leaflet-popup'
        }).setContent(popupContent)

        // Bắt sự kiện mở popup
        marker.on("click", () => {
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

      // Thêm style cho marker và popup
      const style = document.createElement('style')
      style.textContent = `
        .custom-marker-icon {
          background: transparent;
        }
        .marker-container {
          width: 40px;
          height: 40px;
          position: relative;
        }
        .marker-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-size: cover;
          background-position: center;
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          position: absolute;
          top: 0;
          left: 5px;
        }
        .marker-avatar::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 10px;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 10px solid white;
        }
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 3px 14px rgba(0,0,0,0.2);
        }
        .custom-leaflet-popup .leaflet-popup-content {
          margin: 0;
          width: 250px !important;
        }
        .custom-popup {
          font-family: 'Helvetica Neue', Arial, sans-serif;
        }
        .popup-header {
          display: flex;
          align-items: center;
          padding: 10px;
          background-color: #84cc16;
          color: white;
        }
        .popup-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 10px;
          border: 2px solid white;
        }
        .popup-title h3 {
          margin: 0;
          font-size: 16px;
          font-weight: bold;
        }
        .popup-xid {
          font-size: 12px;
          opacity: 0.9;
        }
        .popup-content {
          padding: 10px;
        }
        .popup-content p {
          margin: 5px 0;
          font-size: 14px;
        }
      `
      document.head.appendChild(style)

      // Mở popup đầu tiên khi bản đồ được tải
      if (filteredUsers.length > 0 && markerClusterGroupRef.current.getLayers().length > 0) {
        const firstMarker = markerClusterGroupRef.current.getLayers()[0]
        if (firstMarker) {
          firstMarker.openPopup()
          setActivePopup(firstMarker.getPopup())
        }
      }

      // Fit bounds để hiển thị tất cả markers
      if (filteredUsers.length > 0) {
        const bounds = L.latLngBounds(filteredUsers.map(user => [user.lat, user.lng]))
        mapRef.current.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }

  const toggleMapView = () => {
    setIsSatellite(!isSatellite)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const resetFilters = () => {
    setSearchTerm("")
    setXIdFilter("")
  }

  // Lấy danh sách các xId duy nhất
  const uniqueXIds = [...new Set(users.map(user => user.xId))].filter(Boolean)

  return (
    <div className="p-6 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1 shadow-md border border-lime-100">
          <CardHeader className="bg-lime-50 border-b border-lime-100">
            <CardTitle className="text-xl font-bold text-lime-800 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Quản lý người dùng
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Tìm kiếm */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium">
                Tìm kiếm người dùng
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Tên, mã đơn vị, loại cây trồng..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Lọc theo xId */}
            <div className="space-y-2">
              <Label htmlFor="xid-filter" className="text-sm font-medium">
                Lọc theo mã đơn vị
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {loading ? (
                  <>
                    <Skeleton className="h-9 rounded-md" />
                    <Skeleton className="h-9 rounded-md" />
                  </>
                ) : (
                  <>
                    <select
                      id="xid-filter"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Đặt lại
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Danh sách người dùng */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Danh sách người dùng ({filteredUsers.length})</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-md">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1.5 flex-1">
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
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-lime-50 transition-colors cursor-pointer"
                      onClick={() => {
                        if (mapRef.current && markerClusterGroupRef.current) {
                          // Tìm marker tương ứng với user
                          const layers = markerClusterGroupRef.current.getLayers()
                          const marker = layers.find((layer) => {
                            const latLng = layer.getLatLng()
                            return latLng.lat === user.lat && latLng.lng === user.lng
                          })
                          
                          if (marker) {
                            mapRef.current.setView(marker.getLatLng(), 15)
                            marker.openPopup()
                            setActivePopup(marker.getPopup())
                          }
                        }
                      }}
                    >
                      <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-lime-200">
                        <img 
                          src={user.avatar || "/placeholder.svg?height=50&width=50"} 
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{user.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="bg-lime-100 text-lime-800 px-1.5 py-0.5 rounded-full">
                            {user.xId || "Không có mã"}
                          </span>
                          <span>{user.cropType || "Chưa có cây trồng"}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Không tìm thấy người dùng nào
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="lg:col-span-2 shadow-md border border-lime-100">
          <CardHeader className="bg-lime-50 border-b border-lime-100 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold text-lime-800 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Bản Đồ Vùng Canh Tác
            </CardTitle>
            <Button
              onClick={toggleMapView}
              className="flex items-center gap-1 bg-lime-600 hover:bg-lime-700 text-white"
            >
              <Satellite className="w-4 h-4" />
              {isSatellite ? "Chế độ Đường" : "Chế độ Vệ Tinh"}
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            <AnimatePresence>
              {showNotification && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center bg-lime-100 border border-lime-400 text-lime-700 px-4 py-2 rounded-lg mb-4"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Chế độ bản đồ đã được cập nhật!
                </motion.div>
              )}
            </AnimatePresence>
            
            {loading ? (
              <div className="h-[500px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <Skeleton className="h-8 w-8 rounded-full mx-auto mb-2" />
                  <p className="text-gray-500">Đang tải bản đồ...</p>
                </div>
              </div>
            ) : (
              <div id="map" className="h-[500px] rounded-lg overflow-hidden shadow-inner"></div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

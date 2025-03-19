"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, AlertCircle, Cloud, CloudRain, Thermometer, Wind, Droplets } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import Spinner from "@/components/ui/spinner"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

export default function WeatherWidget() {
  const [city, setCity] = useState("Cao Lãnh")
  const [weather, setWeather] = useState<any>(null)
  const [forecast, setForecast] = useState<any[]>([])
  const [aqi, setAqi] = useState<any>(null) // Air Quality Index
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // State variables for coordinates
  const [lat, setLat] = useState<number | null>(null)
  const [lon, setLon] = useState<number | null>(null)

  // Attempt to get user's current position on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude)
          setLon(position.coords.longitude)
        },
        (error) => {
          console.error("Error getting geolocation:", error)
          // Fallback to default city if geolocation fails
          fetchCoordinatesByCity("Cao Lãnh")
        },
      )
    } else {
      // Geolocation not supported, fallback to default city
      fetchCoordinatesByCity("Cao Lãnh")
    }
  }, [])

  // Fetch weather and AQI data whenever coordinates are available
  useEffect(() => {
    if (lat !== null && lon !== null) {
      fetchCurrentWeather(lat, lon)
      fetchForecast(lat, lon)
      fetchAqiData(lat, lon)
      setIsLoading(false)
    }
  }, [lat, lon])

  // Fetch coordinates based on city name
  const fetchCoordinatesByCity = async (cityName: string) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}`,
      )
      const data = await response.json()
      if (data.cod === 200) {
        setLat(data.coord.lat)
        setLon(data.coord.lon)
        setCity(data.name)
        setError("")
      } else {
        setError(data.message)
        setWeather(null)
        setForecast([])
        setAqi(null)
      }
    } catch (error) {
      console.error("Error fetching coordinates by city:", error)
      setError("Không thể lấy tọa độ thành phố. Vui lòng thử lại sau.")
      setIsLoading(false)
    }
  }

  // Fetch current weather using Current Weather API
  const fetchCurrentWeather = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=vi`,
      )
      const data = await response.json()
      if (data) {
        setWeather(data)
        setError("")
      } else {
        setError("Không thể lấy dữ liệu thời tiết hiện tại.")
        setWeather(null)
      }
    } catch (error) {
      console.error("Error fetching current weather data:", error)
      setError("Không thể lấy dữ liệu thời tiết hiện tại. Vui lòng thử lại sau.")
      setWeather(null)
      setIsLoading(false)
    }
  }

  // Fetch 5-day forecast using Forecast API
  const fetchForecast = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=vi`,
      )
      const data = await response.json()

      if (data && data.list) {
        const desiredHours = [1, 7, 10, 13, 16]
        const filteredData = data.list.filter((item: any) => {
          const date = new Date(item.dt * 1000)
          const hour = date.getHours()
          return desiredHours.includes(hour)
        })

        // Tổ chức dữ liệu dự báo theo ngày
        const groupedData: any[] = []
        const dateMap = new Map()

        filteredData.forEach((item: any) => {
          const dateStr = format(new Date(item.dt * 1000), "dd-MM-yyyy")
          const timeStr = format(new Date(item.dt * 1000), "HH:mm")
          if (!dateMap.has(dateStr)) {
            dateMap.set(dateStr, [])
          }
          dateMap.get(dateStr)?.push({
            time: timeStr,
            temp: item.main.temp,
            weather: item.weather[0],
          })
        })

        // Chuyển Map thành mảng
        dateMap.forEach((value, key) => {
          groupedData.push({
            date: key,
            details: value,
          })
        })

        // Giới hạn lên đến 5 ngày
        setForecast(groupedData.slice(0, 5))
        setError("")
      } else {
        setError("Không thể lấy dữ liệu dự báo thời tiết.")
        setForecast([])
      }
    } catch (error) {
      console.error("Error fetching forecast data:", error)
      setError("Không thể lấy dữ liệu dự báo thời tiết. Vui lòng thử lại sau.")
      setForecast([])
      setIsLoading(false)
    }
  }

  // Fetch Air Quality Index (AQI) data
  const fetchAqiData = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`,
      )
      const data = await response.json()
      if (data.list && data.list.length > 0) {
        setAqi(data.list[0])
        setError("")
      } else {
        setError("Không thể lấy dữ liệu chất lượng không khí.")
        setAqi(null)
      }
    } catch (error) {
      console.error("Error fetching AQI data:", error)
      setError("Không thể lấy dữ liệu chất lượng không khí. Vui lòng thử lại sau.")
      setAqi(null)
      setIsLoading(false)
    }
  }

  // Handle form submission to search for a new city
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    fetchCoordinatesByCity(city)
  }

  // Function to get weather icon URL from OpenWeather
  const getWeatherIconUrl = (iconCode: string, size = "2x") => {
    return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`
  }

  // Function to get AQI description and color
  const getAqiDescription = (aqiValue: number) => {
    switch (aqiValue) {
      case 1:
        return { label: "Tốt", color: "#4ade80" }
      case 2:
        return { label: "Khá", color: "#facc15" }
      case 3:
        return { label: "Trung Bình", color: "#fb923c" }
      case 4:
        return { label: "Xấu", color: "#ef4444" }
      case 5:
        return { label: "Rất Xấu", color: "#a855f7" }
      default:
        return { label: "Không xác định", color: "#94a3b8" }
    }
  }

  // Prepare data for temperature chart
  const prepareChartData = () => {
    if (!forecast) return []
    const chartData = forecast.flatMap((day: any) => {
      return day.details.map((detail: any) => ({
        dateTime: `${day.date.split("-").slice(0, 2).join("-")} ${detail.time}`,
        temp: Math.round(detail.temp),
      }))
    })
    return chartData
  }

  // Lấy biểu tượng thời tiết dựa trên mã thời tiết
  const getWeatherIcon = (code: string) => {
    const iconMap = {
      "01d": <Cloud className="w-6 h-6 text-amber-500" />,
      "01n": <Cloud className="w-6 h-6 text-slate-600" />,
      "02d": <Cloud className="w-6 h-6 text-amber-500" />,
      "02n": <Cloud className="w-6 h-6 text-slate-600" />,
      "03d": <Cloud className="w-6 h-6 text-slate-400" />,
      "03n": <Cloud className="w-6 h-6 text-slate-600" />,
      "04d": <Cloud className="w-6 h-6 text-slate-500" />,
      "04n": <Cloud className="w-6 h-6 text-slate-600" />,
      "09d": <CloudRain className="w-6 h-6 text-blue-400" />,
      "09n": <CloudRain className="w-6 h-6 text-blue-600" />,
      "10d": <CloudRain className="w-6 h-6 text-blue-400" />,
      "10n": <CloudRain className="w-6 h-6 text-blue-600" />,
      "11d": <CloudRain className="w-6 h-6 text-purple-500" />,
      "11n": <CloudRain className="w-6 h-6 text-purple-600" />,
      "13d": <Cloud className="w-6 h-6 text-slate-200" />,
      "13n": <Cloud className="w-6 h-6 text-slate-300" />,
      "50d": <Cloud className="w-6 h-6 text-slate-300" />,
      "50n": <Cloud className="w-6 h-6 text-slate-400" />,
    }
    
    return iconMap[code] || <Cloud className="w-6 h-6 text-slate-400" />
  }

  return (
    <div className="p-6 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin thời tiết hiện tại */}
        <div className="lg:col-span-1 space-y-6">
          {/* Form tìm kiếm */}
          <Card className="shadow-md border border-lime-100">
            <CardHeader className="bg-lime-50 border-b border-lime-100">
              <CardTitle className="text-xl font-bold text-lime-800 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Tìm kiếm
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <Input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Nhập tên thành phố..."
                  className="flex-1"
                  required
                />
                <Button 
                  type="submit" 
                  variant="default" 
                  className="flex items-center gap-1 bg-lime-600 hover:bg-lime-700" 
                  aria-label="Search"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Spinner className="w-4 h-4" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>Tìm</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Thời tiết hiện tại */}
          <Card className="shadow-md border border-lime-100 overflow-hidden">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-16 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ) : weather ? (
              <>
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">{city}</h2>
                      <p className="text-5xl font-semibold mt-2">{Math.round(weather.main.temp)}°C</p>
                      <p className="text-base capitalize mt-1">{weather.weather[0].description}</p>
                    </div>
                    <div>
                      <img
                        src={getWeatherIconUrl(weather.weather[0].icon, "4x") || "/placeholder.svg"}
                        alt={weather.weather[0].description}
                        className="w-24 h-24"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <Thermometer className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Cảm giác như</p>
                      <p className="font-medium">{Math.round(weather.main.feels_like)}°C</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Độ ẩm</p>
                      <p className="font-medium">{weather.main.humidity}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <Wind className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Gió</p>
                      <p className="font-medium">{weather.main.wind?.speed} m/s</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <Cloud className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Mây</p>
                      <p className="font-medium">{weather.clouds.all}%</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 text-center">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-gray-700">Không tìm thấy dữ liệu</h3>
                <p className="text-gray-500">Vui lòng thử tìm kiếm thành phố khác</p>
              </div>
            )}
          </Card>

          {/* Chất lượng không khí */}
          {aqi && !error && !isLoading && (
            <Card className="shadow-md border border-lime-100">
              <CardHeader className="bg-lime-50 border-b border-lime-100 py-3">
                <CardTitle className="text-lg font-bold text-lime-800 flex items-center gap-2">
                  <Wind className="w-5 h-5" />
                  Chất Lượng Không Khí
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getAqiDescription(aqi.main.aqi).color }}
                    ></div>
                    <span className="font-medium">{getAqiDescription(aqi.main.aqi).label}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    AQI: {aqi.main.aqi}/5
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Dự báo và biểu đồ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Biểu đồ nhiệt độ */}
          <Card className="shadow-md border border-lime-100">
            <CardHeader className="bg-lime-50 border-b border-lime-100">
              <CardTitle className="text-xl font-bold text-lime-800 flex items-center gap-2">
                <Thermometer className="w-5 h-5" />
                Biểu Đồ Nhiệt Độ 5 Ngày
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : forecast.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={prepareChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="dateTime" 
                      tick={{ fontSize: 10 }} 
                      stroke="#64748b"
                      tickFormatter={(value) => value.split(' ')[0]}
                    />
                    <YAxis 
                      domain={["auto", "auto"]} 
                      stroke="#64748b"
                      tickFormatter={(value) => `${value}°C`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value) => [`${value}°C`, 'Nhiệt độ']}
                      labelFormatter={(label) => `Ngày ${label.split(' ')[0]}, ${label.split(' ')[1]}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="temp" 
                      stroke="#84cc16" 
                      strokeWidth={2}
                      dot={{ fill: '#84cc16', r: 4 }}
                      activeDot={{ r: 6, fill: '#65a30d' }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center">
                  <p className="text-gray-500">Không có dữ liệu dự báo</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dự báo 5 ngày */}
          <Card className="shadow-md border border-lime-100">
            <CardHeader className="bg-lime-50 border-b border-lime-100">
              <CardTitle className="text-xl font-bold text-lime-800 flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                Dự Báo 5 Ngày
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : forecast.length > 0 ? (
                <div className="space-y-4">
                  {forecast.map((day: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="rounded-lg bg-white shadow-sm border border-gray-100 p-3"
                    >
                      <p className="text-sm font-medium mb-2 text-gray-700 border-b pb-1">{day.date}</p>
                      <div className="flex space-x-4 overflow-x-auto pb-2">
                        {day.details.map((detail: any, idx: number) => (
                          <div key={idx} className="flex flex-col items-center min-w-[80px]">
                            <p className="text-xs font-medium mb-1 text-gray-500">{detail.time}</p>
                            <img
                              src={getWeatherIconUrl(detail.weather.icon) || "/placeholder.svg"}
                              alt={detail.weather.description}
                              className="w-10 h-10"
                            />
                            <p className="text-lg font-bold mt-1 text-gray-800">{Math.round(detail.temp)}°C</p>
                            <p className="text-xs text-gray-500 capitalize">{detail.weather.description}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Không có dữ liệu dự báo</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hiển thị lỗi */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-6 p-3 rounded-lg flex items-center border border-red-400 bg-red-100 text-red-700"
          >
            <AlertCircle className="mr-2 w-5 h-5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, AlertCircle, Cloud, Thermometer, Wind, Droplets, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import Spinner from "@/components/ui/spinner"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

export default function WeatherWidget() {
  const [city, setCity] = useState("Vị trí hiện tại")
  const [weather, setWeather] = useState<any>(null)
  const [forecast, setForecast] = useState<any[]>([])
  const [aqi, setAqi] = useState<any>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [lat, setLat] = useState<number | null>(null)
  const [lon, setLon] = useState<number | null>(null)

  // Fetch initial location on mount
  useEffect(() => {
    setIsLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude)
          setLon(position.coords.longitude)
          setCity("Vị trí hiện tại")
        },
        () => {
          fetchCoordinatesByCity("Cao Lãnh") // Fallback to Cao Lãnh
        }
      )
    } else {
      fetchCoordinatesByCity("Cao Lãnh") // Fallback if geolocation not supported
    }
  }, [])

  // Fetch weather data when coordinates change
  useEffect(() => {
    if (lat !== null && lon !== null) {
      fetchCurrentWeather(lat, lon)
      fetchForecast(lat, lon)
      fetchAqiData(lat, lon)
      setIsLoading(false)
    }
  }, [lat, lon])

  const fetchCoordinatesByCity = async (cityName: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}`
      )
      const data = await response.json()
      if (data.cod === 200) {
        setLat(data.coord.lat)
        setLon(data.coord.lon)
        setCity(data.name)
        setError("")
      } else if (data.cod === "404") {
        setError(`Không tìm thấy "${cityName}". Vui lòng kiểm tra lại.`)
        setWeather(null)
        setForecast([])
        setAqi(null)
      } else {
        setError(data.message || "Lỗi không xác định từ API.")
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error)
      setError("Không thể kết nối đến API thời tiết.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCurrentWeather = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=vi`
      )
      const data = await response.json()
      if (data.cod === 200) {
        setWeather(data)
        setError("")
      } else {
        setError("Không thể lấy dữ liệu thời tiết hiện tại.")
        setWeather(null)
      }
    } catch (error) {
      console.error("Error fetching weather:", error)
      setError("Lỗi kết nối khi lấy dữ liệu thời tiết.")
      setWeather(null)
    }
  }

  const fetchForecast = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=vi`
      )
      const data = await response.json()
      if (data.cod === "200") {
        const desiredHours = [1, 7, 10, 13, 16]
        const filteredData = data.list.filter((item: any) =>
          desiredHours.includes(new Date(item.dt * 1000).getHours())
        )
        const groupedData = Array.from(
          filteredData.reduce((map: Map<string, any[]>, item: any) => {
            const dateStr = format(new Date(item.dt * 1000), "dd-MM-yyyy")
            if (!map.has(dateStr)) map.set(dateStr, [])
            map.get(dateStr)!.push({
              time: format(new Date(item.dt * 1000), "HH:mm"),
              temp: item.main.temp,
              weather: item.weather[0],
            })
            return map
          }, new Map()),
          ([date, details]) => ({ date, details })
        )
        setForecast(groupedData.slice(0, 5))
        setError("")
      } else {
        setError("Không thể lấy dữ liệu dự báo thời tiết.")
        setForecast([])
      }
    } catch (error) {
      console.error("Error fetching forecast:", error)
      setError("Lỗi kết nối khi lấy dự báo thời tiết.")
      setForecast([])
    }
  }

  const fetchAqiData = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
      )
      const data = await response.json()
      if (data.list?.length > 0) {
        setAqi(data.list[0])
        setError("")
      } else {
        setError("Không thể lấy dữ liệu chất lượng không khí.")
        setAqi(null)
      }
    } catch (error) {
      console.error("Error fetching AQI:", error)
      setError("Lỗi kết nối khi lấy dữ liệu chất lượng không khí.")
      setAqi(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCoordinatesByCity(city)
  }

  const handleLocateMe = () => {
    setIsLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude)
          setLon(position.coords.longitude)
          setCity("Vị trí hiện tại")
          setError("")
          setIsLoading(false)
        },
        (err) => {
          console.error("Geolocation error:", err)
          setError("Không thể lấy vị trí hiện tại.")
          fetchCoordinatesByCity("Cao Lãnh")
          setIsLoading(false)
        }
      )
    } else {
      setError("Trình duyệt không hỗ trợ định vị.")
      fetchCoordinatesByCity("Cao Lãnh")
      setIsLoading(false)
    }
  }

  const getWeatherIconUrl = (iconCode: string, size = "2x") =>
    `https://openweathermap.org/img/wn/${iconCode}@${size}.png`

  const getAqiDescription = (aqiValue: number) => {
    const aqiMap = {
      1: { label: "Tốt", color: "#4ade80", bg: "bg-green-50" },
      2: { label: "Khá", color: "#facc15", bg: "bg-yellow-50" },
      3: { label: "Trung Bình", color: "#fb923c", bg: "bg-orange-50" },
      4: { label: "Xấu", color: "#ef4444", bg: "bg-red-50" },
      5: { label: "Rất Xấu", color: "#a855f7", bg: "bg-purple-50" },
    }
    return aqiMap[aqiValue] || { label: "Không xác định", color: "#94a3b8", bg: "bg-gray-50" }
  }

  const prepareChartData = () =>
    forecast.flatMap((day: any) =>
      day.details.map((detail: any) => ({
        dateTime: `${day.date.split("-").slice(0, 2).join("-")} ${detail.time}`,
        temp: Math.round(detail.temp),
      }))
    )

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 via-lime-50 to-purple-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="shadow-lg bg-white/90 backdrop-blur-lg rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-gradient-to-r hover:from-lime-200 hover:to-blue-200">
            <CardHeader className="bg-gradient-to-r from-lime-100 to-lime-50 p-5 border-b border-lime-200">
              <CardTitle className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Search className="w-5 h-5 text-lime-700 animate-pulse" />
                Tra Cứu Thời Tiết
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Nhập tên thành phố..."
                    className="flex-1 rounded-xl border-gray-200 focus:border-lime-500 shadow-md bg-white/80 transition-all duration-200"
                  />
                  <Button
                    type="submit"
                    className="bg-lime-600 hover:bg-lime-700 rounded-xl shadow-md text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? <Spinner className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLocateMe}
                  className="w-full border-lime-600 text-lime-700 hover:bg-lime-50 rounded-xl shadow-md bg-white/80 transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Spinner className="w-4 h-4 mr-2" />
                  ) : (
                    <MapPin className="w-4 h-4 mr-2 animate-bounce" />
                  )}
                  Vị trí hiện tại
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-white/90 backdrop-blur-lg rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-gradient-to-r hover:from-lime-200 hover:to-blue-200">
            {isLoading ? (
              <div className="p-6 space-y-6">
                <Skeleton className="h-8 w-3/4 rounded-lg" />
                <Skeleton className="h-16 w-1/2 rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
                <div className="grid grid-cols-2 gap-4">
                  {Array(4).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              </div>
            ) : weather ? (
              <>
                <div className="bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-500 text-white p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md">{city}</h2>
                      <p className="text-6xl font-extrabold mt-2 drop-shadow-lg">
                        {Math.round(weather.main.temp)}°C
                      </p>
                      <p className="text-base capitalize mt-1 opacity-90">{weather.weather[0].description}</p>
                    </div>
                    <motion.img
                      src={getWeatherIconUrl(weather.weather[0].icon, "4x")}
                      alt={weather.weather[0].description}
                      className="w-28 h-28"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                  {[
                    { icon: Thermometer, label: "Cảm giác", value: `${Math.round(weather.main.feels_like)}°C` },
                    { icon: Droplets, label: "Độ ẩm", value: `${weather.main.humidity}%` },
                    { icon: Wind, label: "Gió", value: `${weather.wind.speed} m/s` },
                    { icon: Cloud, label: "Mây", value: `${weather.clouds.all}%` },
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl shadow-sm hover:bg-gray-100 transition-all duration-200"
                    >
                      <item.icon className="w-6 h-6 text-indigo-600 animate-pulse" />
                      <div>
                        <p className="text-xs text-gray-500">{item.label}</p>
                        <p className="font-semibold text-gray-800">{item.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
                <h3 className="text-xl font-semibold text-gray-800">Không tìm thấy dữ liệu</h3>
                <p className="text-gray-600 mt-2">Kiểm tra tên thành phố hoặc kết nối mạng.</p>
              </div>
            )}
          </Card>

          {aqi && !isLoading && (
            <Card className="shadow-lg bg-white/90 backdrop-blur-lg rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-gradient-to-r hover:from-lime-200 hover:to-blue-200">
              <CardHeader className="bg-gradient-to-r from-lime-100 to-lime-50 p-5 border-b border-lime-200">
                <CardTitle className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <Wind className="w-5 h-5 text-lime-700 animate-spin-slow" />
                  Chất Lượng Không Khí
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-8 h-8 rounded-full shadow-md"
                    style={{ backgroundColor: getAqiDescription(aqi.main.aqi).color }}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <span className="font-semibold text-xl text-gray-800">
                    {getAqiDescription(aqi.main.aqi).label}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-700 bg-gray-100 px-4 py-1 rounded-full shadow-sm">
                  AQI: {aqi.main.aqi}/5
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-lg bg-white/90 backdrop-blur-lg rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-gradient-to-r hover:from-lime-200 hover:to-blue-200">
            <CardHeader className="bg-gradient-to-r from-lime-100 to-lime-50 p-5 border-b border-lime-200">
              <CardTitle className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-lime-700 animate-pulse" />
                Xu Hướng Nhiệt Độ 5 Ngày
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <Skeleton className="h-[400px] w-full rounded-xl" />
              ) : forecast.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={prepareChartData()}>
                    <CartesianGrid strokeDasharray="5 5" stroke="#e5e7eb" opacity={0.6} />
                    <XAxis
                      dataKey="dateTime"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      tickFormatter={(value) => value.split(" ")[0]}
                      stroke="#6b7280"
                    />
                    <YAxis
                      stroke="#6b7280"
                      tickFormatter={(value) => `${value}°C`}
                      domain={["auto", "auto"]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                        padding: "12px",
                      }}
                      formatter={(value) => [`${value}°C`, "Nhiệt độ"]}
                      labelFormatter={(label) => `Ngày ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="temp"
                      stroke="#84cc16"
                      strokeWidth={4}
                      dot={{ fill: "#84cc16", r: 6, stroke: "#fff", strokeWidth: 2 }}
                      activeDot={{ r: 10, fill: "#65a30d", stroke: "#fff", strokeWidth: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center">
                  <p className="text-gray-600 text-lg font-medium">Không có dữ liệu dự báo</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-white/90 backdrop-blur-lg rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-gradient-to-r hover:from-lime-200 hover:to-blue-200">
            <CardHeader className="bg-gradient-to-r from-lime-100 to-lime-50 p-5 border-b border-lime-200">
              <CardTitle className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Cloud className="w-5 h-5 text-lime-700 animate-bounce" />
                Dự Báo 5 Ngày
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-6">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-36 w-full rounded-xl" />
                  ))}
                </div>
              ) : forecast.length > 0 ? (
                <div className="space-y-6">
                  {forecast.map((day: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white shadow-md rounded-xl p-5 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <p className="text-sm font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                        {day.date}
                      </p>
                      <div className="flex space-x-6 overflow-x-auto pb-2">
                        {day.details.map((detail: any, idx: number) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                            className="flex flex-col items-center min-w-[110px]"
                          >
                            <p className="text-xs font-medium text-gray-600">{detail.time}</p>
                            <motion.img
                              src={getWeatherIconUrl(detail.weather.icon)}
                              alt={detail.weather.description}
                              className="w-16 h-16 my-3"
                              whileHover={{ scale: 1.15, rotate: 5 }}
                              transition={{ duration: 0.2 }}
                            />
                            <p className="text-xl font-bold text-gray-900">{Math.round(detail.temp)}°C</p>
                            <p className="text-xs text-gray-500 capitalize mt-1">{detail.weather.description}</p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
                  <p className="text-gray-600 text-lg font-medium">Không có dữ liệu dự báo</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="mt-8 p-6 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center shadow-lg max-w-2xl mx-auto"
          >
            <AlertCircle className="w-6 h-6 mr-3 animate-bounce" />
            <span className="font-medium text-lg">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
// components/WeatherWidget.tsx

"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import Spinner from "@/components/ui/spinner"
import {format} from "date-fns";

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY


export default function WeatherWidget() {
  const [city, setCity] = useState("Cao Lãnh")
  const [weather, setWeather] = useState<any>(null)
  const [forecast, setForecast] = useState<any[]>([])
  const [aqi, setAqi] = useState<any>(null) // Air Quality Index
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [theme, setTheme] = useState("light") // Theme mode

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
        }
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

  // Toggle theme class on the document root
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Fetch coordinates based on city name
  const fetchCoordinatesByCity = async (cityName: string) => {
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
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=vi`
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
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=vi`
      )
      const data = await response.json()

      if (data && data.list) {
        const desiredHours = [1, 7, 10, 13, 16]
        const filteredData = data.list.filter((item: any) => {
          const date = new Date(item.dt * 1000)
          const hour = date.getHours()
          return desiredHours.includes(hour)
        })

        console.log("Filtered Forecast Data:", filteredData)

        // Tổ chức dữ liệu dự báo theo ngày
        const groupedData: any[] = []
        const dateMap = new Map()

        filteredData.forEach((item: any) => {
          const dateStr = format(new Date(item.dt * 1000), 'dd-MM-yyyy')
          const timeStr = format(new Date(item.dt * 1000), 'HH:mm')
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
            details: value
          })
        })

        console.log("Grouped Forecast Data:", groupedData.slice(0, 5))

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
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
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
    fetchCoordinatesByCity(city)
  }

  // Function to get weather icon URL from OpenWeather
  const getWeatherIconUrl = (iconCode: string, size: string = "2x") => {
    return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`
  }

  // Function to get AQI description and color
  const getAqiDescription = (aqiValue: number) => {
    switch (aqiValue) {
      case 1:
        return { label: "Tốt", color: "green" }
      case 2:
        return { label: "Khá", color: "yellow" }
      case 3:
        return { label: "Trung Bình", color: "orange" }
      case 4:
        return { label: "Xấu", color: "red" }
      case 5:
        return { label: "Rất Xấu", color: "purple" }
      default:
        return { label: "Không xác định", color: "slate" }
    }
  }

  // Prepare data for temperature chart
  const prepareChartData = () => {
    if (!forecast) return []
    const chartData = forecast.flatMap((day: any) => {
      return day.details.map((detail: any) => ({
        dateTime: `${day.date.split('-').slice(0,2).join('-')}`, // Kết hợp ngày và giờ
        temp: Math.round(detail.temp),
      }))
    })
    return chartData
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-r from-blue-400 to-purple-500'}`}
    >
      {/* Container box */}
      <Card className={`relative max-w-xl w-full rounded-xl shadow-2xl ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white'}`}>
       
        {/* Header */}
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-extrabold text-center">🌤️ Dự báo thời tiết</CardTitle>
        </CardHeader>

        <CardContent className="py-6">
          {/* Search Form */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 mb-4"
          >
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
              className="flex items-center gap-1"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
              <span>Tìm</span>
            </Button>
          </form>

          {/* Error Notification */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mb-3 p-3 rounded-lg flex items-center border border-red-400 bg-red-100 text-red-700"
              >
                <AlertCircle className="mr-2 w-5 h-5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading && (
            <div className="mb-3 flex justify-center">
              <Spinner />
            </div>
          )}

          {/* Current Weather */}
          {weather && !error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
              className="rounded-lg p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg mb-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{city}</h2>
                  <p className="text-4xl font-semibold mt-1">
                    {Math.round(weather.main.temp)}°C
                  </p>
                  <p className="text-base capitalize mt-1">
                    {weather.weather[0].description}
                  </p>
                </div>
                <div>
                  <img
                    src={getWeatherIconUrl(weather.weather[0].icon, '4x')}
                    alt={weather.weather[0].description}
                    className="w-24 h-24"
                  />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1">
                <div className="flex items-center">
                  <img
                    src="https://openweathermap.org/img/wn/01d@2x.png" // Thay bằng biểu tượng mặt trời mọc nếu có
                    alt="Sunrise"
                    className="h-5 w-5 mr-2"
                  />
                  <span>Mặt trời mọc: {format(new Date(weather.sys.sunrise * 1000), 'HH:mm')}</span>
                </div>
                <div className="flex items-center">
                  <img
                    src="https://openweathermap.org/img/wn/01n@2x.png" // Thay bằng biểu tượng mặt trời lặn nếu có
                    alt="Sunset"
                    className="h-5 w-5 mr-2"
                  />
                  <span>Mặt trời lặn: {format(new Date(weather.sys.sunset * 1000), 'HH:mm')}</span>
                </div>
                <div className="flex items-center">
                  <img
                    src="https://openweathermap.org/img/wn/09d@2x.png" // Thay bằng biểu tượng gió nếu có
                    alt="Wind"
                    className="h-5 w-5 mr-2"
                  />
                  <span>Tốc độ gió: {weather.wind.speed} m/s</span>
                </div>
                <div className="flex items-center">
                  <img
                    src="https://openweathermap.org/img/wn/03d@2x.png" // Thay bằng biểu tượng mây nếu có
                    alt="Clouds"
                    className="h-5 w-5 mr-2"
                  />
                  <span>Tỉ lệ mây: {weather.clouds.all}%</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Air Quality Index (AQI) */}
          {aqi && !error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
              className="rounded-lg p-4 bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg mb-4"
            >
              <h3 className="text-xl font-bold mb-2">🌬️ Chất Lượng Không Khí (AQI)</h3>
              <div className="flex items-center">
                {/* Sử dụng style inline để thay đổi màu sắc động */}
                <div
                  className={`w-4 h-4 rounded-full mr-2`}
                  style={{ backgroundColor: getAqiDescription(aqi.main.aqi).color }}
                ></div>
                <span className="capitalize">{getAqiDescription(aqi.main.aqi).label}</span>
              </div>
            </motion.div>
          )}

          {/* Temperature Chart */}
          {forecast.length > 0 && !error && (
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-slate-700 mb-2">📈 Biểu Đồ Nhiệt Độ 5 Ngày</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={prepareChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dateTime" tick={{ fontSize: 10 }} />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="temp" label={false} stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 5-Day Forecast - Multiple Time Slots */}
          {forecast.length > 0 && !error && (
            <div className="flex flex-col mt-4">
              <h3 className="text-lg font-bold text-slate-700 mb-2">📅 Dự Báo 5 Ngày</h3>
              <div className="space-y-4">
                {forecast.map((day: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-white'} shadow-sm p-3 flex flex-col`}
                  >
                    <p className="text-sm font-medium mb-2">
                      {day.date}
                    </p>
                    <div className="flex space-x-4 overflow-x-auto">
                      {day.details.map((detail: any, idx: number) => (
                        <div key={idx} className="flex flex-col items-center min-w-[80px]">
                          <p className="text-xs font-medium mb-1">{detail.time}</p>
                          <img
                            src={getWeatherIconUrl(detail.weather.icon)}
                            alt={detail.weather.description}
                            className="w-12 h-12"
                          />
                          <p className="text-lg font-bold mt-1">
                            {Math.round(detail.temp)}°C
                          </p>
                          <p className="text-xs text-slate-500 capitalize">
                            {detail.weather.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
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
import {
  Search,
  Sun,
  Cloud,
  CloudRain,
  Wind,
  AlertCircle,
  Moon,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

export default function WeatherWidget() {
  const [city, setCity] = useState("Cao Lãnh")
  const [weather, setWeather] = useState<any>(null)
  const [forecast, setForecast] = useState<any>(null)
  const [aqi, setAqi] = useState<any>(null) // Air Quality Index
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [theme, setTheme] = useState("light") // Chế độ sáng/tối

  useEffect(() => {
    fetchWeather()
    fetchForecast()
    fetchAqi()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const fetchWeather = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=vi`
      )
      const data = await response.json()
      setIsLoading(false)
      if (data.cod === 200) {
        setWeather(data)
        setError("")
      } else {
        setError(data.message)
        setWeather(null)
      }
    } catch (error) {
      console.error("Error fetching weather data:", error)
      setError("Không thể lấy dữ liệu thời tiết. Vui lòng thử lại sau.")
      setWeather(null)
      setIsLoading(false)
    }
  }

  const fetchForecast = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=vi`
      )
      const data = await response.json()
      setIsLoading(false)
      if (data.cod === "200") {
        setForecast(data)
        setError("")
      } else {
        setError(data.message)
        setForecast(null)
      }
    } catch (error) {
      console.error("Error fetching forecast data:", error)
      setError("Không thể lấy dữ liệu dự báo. Vui lòng thử lại sau.")
      setForecast(null)
      setIsLoading(false)
    }
  }

  const fetchAqi = async () => {
    try {
      setIsLoading(true)
      // Sử dụng OpenWeather Air Pollution API
      const { coord } = weather || {}
      if (!coord) {
        setIsLoading(false)
        return
      }
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${coord.lat}&lon=${coord.lon}&appid=${API_KEY}`
      )
      const data = await response.json()
      setIsLoading(false)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchWeather()
    fetchForecast()
    fetchAqi()
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "Clear":
        return <Sun className="h-12 w-12 text-yellow-400 animate-pulse" />
      case "Clouds":
        return <Cloud className="h-12 w-12 text-gray-300 animate-bounce" />
      case "Rain":
        return <CloudRain className="h-12 w-12 text-cyan-400 animate-shake" />
      case "Snow":
        return <CloudRain className="h-12 w-12 text-blue-300" />
      case "Thunderstorm":
        return <Sun className="h-12 w-12 text-yellow-600" />
      case "Drizzle":
        return <CloudRain className="h-12 w-12 text-blue-300" />
      case "Mist":
      case "Smoke":
      case "Haze":
      case "Dust":
      case "Fog":
      case "Sand":
      case "Ash":
      case "Squall":
      case "Tornado":
        return <Wind className="h-12 w-12 text-gray-500" />
      default:
        return <Wind className="h-12 w-12 text-gray-500" />
    }
  }

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
        return { label: "Không xác định", color: "gray" }
    }
  }

  // Chuẩn bị dữ liệu cho biểu đồ nhiệt độ
  const prepareChartData = () => {
    if (!forecast) return []
    const dailyData: { date: string, temp: number }[] = []
    forecast.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      })
      dailyData.push({ date, temp: item.main.temp })
    })
    // Giữ lại chỉ 5 ngày
    const chartData = dailyData.slice(0, 40).reduce((acc: any, curr: any) => {
      const existing = acc.find((item: any) => item.date === curr.date)
      if (existing) {
        existing.temp = Math.max(existing.temp, curr.temp)
      } else {
        acc.push(curr)
      }
      return acc
    }, []).slice(0, 5)
    return chartData
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-r from-blue-400 to-purple-500'}`}
    >
      {/* Container box */}
      <Card className={`relative max-w-md w-full rounded-xl shadow-2xl ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
       
        {/* Header */}
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-extrabold text-center">🌤️ Weather Widget</CardTitle>
        </CardHeader>

        <CardContent className="py-6">
          {/* Form tìm kiếm */}
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

          {/* Thông báo lỗi */}
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

          {/* Loading state */}
          {isLoading && (
            <div className="mb-3 text-gray-600 text-sm animate-pulse">
              Đang tải dữ liệu...
            </div>
          )}

          {/* Thời tiết hiện tại */}
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
                  <h2 className="text-2xl font-bold">{weather.name}</h2>
                  <p className="text-4xl font-semibold mt-1">
                    {Math.round(weather.main.temp)}°C
                  </p>
                  <p className="text-base capitalize mt-1">
                    {weather.weather[0].description}
                  </p>
                </div>
                <div>{getWeatherIcon(weather.weather[0].main)}</div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Sun className="h-5 w-5 mr-2 text-yellow-300" />
                  <span>Mặt trời mọc: {new Date(weather.sys.sunrise * 1000).toLocaleTimeString("vi-VN")}</span>
                </div>
                <div className="flex items-center">
                  <Moon className="h-5 w-5 mr-2 text-gray-300" />
                  <span>Mặt trời lặn: {new Date(weather.sys.sunset * 1000).toLocaleTimeString("vi-VN")}</span>
                </div>
                <div className="flex items-center">
                  <Wind className="h-5 w-5 mr-2 text-blue-300" />
                  <span>Tốc độ gió: {weather.wind.speed} m/s</span>
                </div>
                <div className="flex items-center">
                  <Cloud className="h-5 w-5 mr-2 text-gray-300" />
                  <span>Tỉ lệ mây: {weather.clouds.all}%</span>
                </div>
                {/* <div className="flex items-center">
                  <Sun className="h-5 w-5 mr-2 text-yellow-300" />
                  <span>UV Index: N/A</span>
                </div> */}
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
                <div className={`w-4 h-4 rounded-full bg-${getAqiDescription(aqi.main.aqi).color}-500 mr-2`}></div>
                <span className="capitalize">{getAqiDescription(aqi.main.aqi).label}</span>
              </div>
            </motion.div>
          )}

          {/* Biểu đồ nhiệt độ */}
          {forecast && !error && (
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-gray-700 mb-2">📈 Biểu Đồ Nhiệt Độ 5 Ngày</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={prepareChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="temp" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Dự báo 5 ngày - cuộn ngang */}
          {forecast && !error && (
            <div className="flex flex-col mt-4">
              <h3 className="text-lg font-bold text-gray-700 mb-2">📅 Dự Báo 5 Ngày</h3>
              <div
                className="flex gap-4 overflow-x-auto pb-2 rounded-lg shadow-lg scrollbar-thin scrollbar-thumb-lime-500 scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full hover:scrollbar-thumb-lime-700"
              >
                {/* Lấy mỗi 8 item => 1 ngày */}
                {forecast.list
                  .filter((_, index: number) => index % 8 === 0)
                  .map((item: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className={`min-w-[120px] rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-sm p-3 flex flex-col items-center`}
                    >
                      <p className="text-sm font-medium mb-1">
                        {new Date(item.dt * 1000).toLocaleDateString("vi-VN", {
                          weekday: "short",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </p>
                      <div>{getWeatherIcon(item.weather[0].main)}</div>
                      <p className="text-xl font-bold mt-1">
                        {Math.round(item.main.temp)}°C
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {item.weather[0].description}
                      </p>
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

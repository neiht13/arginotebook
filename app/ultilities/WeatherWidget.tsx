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
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

export default function WeatherWidget() {
  const [city, setCity] = useState("Cao Lãnh")
  const [weather, setWeather] = useState<any>(null)
  const [forecast, setForecast] = useState<any>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchWeather()
    fetchForecast()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchWeather()
    fetchForecast()
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "Clear":
        return <Sun className="h-8 w-8 text-yellow-400" />
      case "Clouds":
        return <Cloud className="h-8 w-8 text-gray-300" />
      case "Rain":
        return <CloudRain className="h-8 w-8 text-blue-400" />
      default:
        return <Wind className="h-8 w-8 text-gray-500" />
    }
  }

  return (
    <div
      className="h-auto w-full overflow-hidden 
                 flex items-center justify-center shadow-lg rounded-lg
                 "
    >
      {/* Container box */}
      <div className="relative max-w-md w-full bg-white/80 backdrop-blur-md rounded-xl shadow-2xl p-6 flex flex-col">
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
          />
          <Button
            type="submit"
            variant="default"
            className="inline-flex items-center gap-1"
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
              className="mb-3 p-3 rounded-lg flex items-center 
                         border border-red-400 bg-red-100 text-red-700"
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
            className="rounded-lg p-4 bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-lg mb-4"
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
            <div className="mt-3 flex flex-col gap-1 text-sm">
              <p>Độ ẩm: {weather.main.humidity}%</p>
              <p>Tốc độ gió: {weather.wind.speed} m/s</p>
              <p>Mây: {weather.clouds.all}%</p>
            </div>
          </motion.div>
        )}

        {/* Dự báo 5 ngày - cuộn ngang */}
        {forecast && !error && (
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              Dự Báo 5 Ngày
            </h3>
            <div
              className="flex gap-4 overflow-x-auto pb-2 rounded-lg shadow-lg"
              // có thể thêm "scrollbar-thin scrollbar-thumb-rounded" nếu muốn
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
                    className="min-w-[120px] rounded-lg bg-white shadow-sm p-3 flex flex-col items-center"
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
      </div>
    </div>
  )
}

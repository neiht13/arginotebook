"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Sun, Cloud, CloudRain, Wind, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

export default function WeatherWidget() {
  const [city, setCity] = useState('Ho Chi Minh City')
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchWeather()
    fetchForecast()
  }, [])

  const fetchWeather = async () => {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
      const data = await response.json()
      if (data.cod === 200) {
        setWeather(data)
        setError('')
      } else {
        setError(data.message)
        setWeather(null)
      }
    } catch (error) {
      console.error('Error fetching weather data:', error)
      setError('Không thể lấy dữ liệu thời tiết. Vui lòng thử lại sau.')
      setWeather(null)
    }
  }

  const fetchForecast = async () => {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`)
      const data = await response.json()
      if (data.cod === "200") {
        setForecast(data)
        setError('')
      } else {
        setError(data.message)
        setForecast(null)
      }
    } catch (error) {
      console.error('Error fetching forecast data:', error)
      setError('Không thể lấy dữ liệu dự báo. Vui lòng thử lại sau.')
      setForecast(null)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchWeather()
    fetchForecast()
  }

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'Clear':
        return <Sun className="h-8 w-8 text-yellow-400" />
      case 'Clouds':
        return <Cloud className="h-8 w-8 text-gray-400" />
      case 'Rain':
        return <CloudRain className="h-8 w-8 text-blue-400" />
      default:
        return <Wind className="h-8 w-8 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-lg rounded-lg bg-white">
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-extrabold text-gray-800 flex items-center">
            ☀️ Thông Tin Thời Tiết
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <Input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Nhập tên thành phố"
              className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <Button type="submit" className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <Search className="w-5 h-5 mr-2" />
              Tìm kiếm
            </Button>
          </form>

          {/* Hiển thị lỗi */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center"
              >
                <AlertCircle className="w-6 h-6 mr-2" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hiển thị thời tiết hiện tại */}
          {weather && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-blue-500 to-blue-300 text-white rounded-lg p-6 mb-6 shadow-md"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-semibold">{weather.name}</h2>
                  <p className="text-6xl font-bold mt-2">{Math.round(weather.main.temp)}°C</p>
                  <p className="text-xl mt-2 capitalize">{weather.weather[0].description}</p>
                </div>
                <div>
                  {getWeatherIcon(weather.weather[0].main)}
                </div>
              </div>
              <div className="flex justify-between mt-4 text-lg">
                <p>Độ ẩm: {weather.main.humidity}%</p>
                <p>Tốc độ gió: {weather.wind.speed} m/s</p>
                <p>Mây: {weather.clouds.all}%</p>
              </div>
            </motion.div>
          )}

          {/* Hiển thị dự báo 5 ngày */}
          {forecast && (
            <div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">🌤️ Dự Báo 5 Ngày Tới</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {forecast.list.filter((item, index) => index % 8 === 0).map((item, index) => (
                  <Card key={index} className="bg-gray-50 rounded-lg shadow-sm">
                    <CardContent className="p-4 flex flex-col items-center">
                      <p className="font-semibold">{new Date(item.dt * 1000).toLocaleDateString()}</p>
                      <div className="flex items-center justify-center my-2">
                        {getWeatherIcon(item.weather[0].main)}
                      </div>
                      <p className="text-2xl font-bold">{Math.round(item.main.temp)}°C</p>
                      <p className="text-sm capitalize text-gray-600">{item.weather[0].description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

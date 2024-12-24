"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCheckIcon, TrashIcon } from 'lucide-react'

export default function HarvestTracker() {
  const [totalWeight, setTotalWeight] = useState(0)
  const [currentWeight, setCurrentWeight] = useState('')
  const [history, setHistory] = useState([])
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (currentWeight) {
      const weight = parseFloat(currentWeight)
      setTotalWeight(prevTotal => prevTotal + weight)
      setHistory(prevHistory => [...prevHistory, { weight, timestamp: new Date() }])
      setCurrentWeight('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000) // Thông báo tự động biến mất sau 3 giây
    }
  }

  const handleReset = () => {
    setTotalWeight(0)
    setHistory([])
  }

  return (
    <div className="h-auto bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg rounded-lg bg-white">
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-extrabold text-gray-800">🌾 Sổ cân nặng</CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                placeholder="Nhập cân nặng (kg)"
                step="0.01"
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
              <Button type="submit" className="flex items-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                <CheckCheckIcon className="w-5 h-5 mr-2" />
                Thêm
              </Button>
            </div>
          </form>

{/* 
            <div className="mt-4 flex items-center bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <CheckCheckIcon className="w-6 h-6 mr-2" />
              <span className="block sm:inline">Cân nặng đã được thêm thành công!</span>
            </div> */}

          {/* Hiển thị lịch sử nhập liệu */}
          {history.length > 0 && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">📜 Lịch Sử Nhập</h2>
              <ul className="max-h-48 overflow-y-auto space-y-2">
                {history.map((entry, index) => (
                  <li key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                    <div>
                      <p className="text-lg font-medium text-gray-800">{entry.weight.toFixed(2)} kg</p>
                      <p className="text-sm text-gray-500">{entry.timestamp.toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Button type="button" onClick={handleReset} className="mt-4 flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                <TrashIcon className="w-5 h-5 mr-2" />
                Xóa Lịch Sử
              </Button>
            </div>
          )}

          {/* Hiển thị tổng cân nặng */}
          <div className="mt-8 text-center">
            <p className="text-xl text-gray-600">Tổng Cân Nặng Hiện Tại:</p>
            <p className="text-4xl font-bold text-green-600">{totalWeight.toFixed(2)} kg</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

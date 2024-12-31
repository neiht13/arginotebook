// components/HarvestTracker.tsx

"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCheckIcon, TrashIcon, ClipboardIcon, ClipboardCheckIcon, PlusCircleIcon } from 'lucide-react'
import { toast } from 'react-toastify'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

export default function HarvestTracker() {
  const [totalWeight, setTotalWeight] = useState(0)
  const [currentWeight, setCurrentWeight] = useState('')
  const [history, setHistory] = useState<{ weight: number, timestamp: Date }[]>([])
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentWeight) {
      const weight = parseFloat(currentWeight)
      setTotalWeight(prevTotal => prevTotal + weight)
      setHistory(prevHistory => [...prevHistory, { weight, timestamp: new Date() }])
      setCurrentWeight('')
      setSuccess(true)
      toast.success("Cân nặng đã được thêm thành công!")
      setTimeout(() => setSuccess(false), 3000) // Thông báo tự động biến mất sau 3 giây
    }
  }

  const handleReset = () => {
    if (history.length === 0) return
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử cân nặng?")) {
      setTotalWeight(0)
      setHistory([])
      toast.info("Lịch sử cân nặng đã được xóa.")
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${totalWeight.toFixed(2)}`)
      setCopied(true)
      toast.success("Đã sao chép tổng cân nặng!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Sao chép thất bại!")
    }
  }

  const [openAlert, setOpenAlert] = useState(false)

  const confirmReset = () => {
    setTotalWeight(0)
    setHistory([])
    setOpenAlert(false)
    toast.info("Lịch sử cân nặng đã được xóa.")
  }

  const cancelReset = () => {
    setOpenAlert(false)
  }

  return (
    <div className="h-auto max-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg rounded-lg bg-white">
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-extrabold text-gray-800">🌾 Sổ cân nặng</CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          {/* Form Thêm Cân Nặng */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                placeholder="Nhập cân nặng (kg)"
                step="0.01"
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 transition"
              />
              <Button
                type="submit"
                className="flex items-center px-4 py-3 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition"
              >
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                Thêm
              </Button>
            </div>
          </form>

          {/* Hiển Thị Lịch Sử Nhập Liệu */}
          {history.length > 0 && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">📜 Lịch Sử Nhập</h2>
              <ul className="max-h-48 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-lime-500 scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full hover:scrollbar-thumb-lime-700">
                {history.map((entry, index) => (
                  <li key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                    <div>
                      <p className="text-lg font-medium text-gray-800">{entry.weight.toFixed(2)} kg</p>
                      <p className="text-sm text-gray-500">{entry.timestamp.toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    onClick={handleReset}
                    className="mt-4 flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <TrashIcon className="w-5 h-5 mr-2" />
                    Xóa Lịch Sử
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xóa Lịch Sử Cân Nặng</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn xóa toàn bộ lịch sử cân nặng? Hành động này không thể hoàn tác.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={cancelReset}>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmReset}>Xóa</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* Hiển Thị Tổng Cân Nặng */}
          <div className="mt-8 text-center">
            <div className="space-x-2">
              <p className="text-xl text-gray-600">Tổng Cân Nặng Hiện Tại:</p>
              <div className='flex items-center justify-center '>
                <p className="text-4xl font-bold text-lime-600">{totalWeight.toFixed(2)} kg</p>
                </div>
                <div className='flex items-center justify-end'>
              <Button
                type="button"
                onClick={handleCopy}
                className="ml-2 p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition"
              >
                {copied ? <ClipboardCheckIcon className="w-5 h-5" /> : <ClipboardIcon className="w-5 h-5" />} Sao chép
              </Button></div>
              
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

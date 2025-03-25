"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Package, Leaf, AlertTriangle, Clock, DollarSign } from "lucide-react"
import type { VatTu } from "../types"
import { isAfter, parseISO, format, subMonths } from "date-fns"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { vi } from "date-fns/locale"

interface VatTuStatsProps {
  data: VatTu[]
}

export default function VatTuStats({ data }: VatTuStatsProps) {
  const stats = useMemo(() => {
    const totalItems = data.length
    const totalValue = data.reduce((sum, item) => sum + item.donGia * item.soLuong, 0)
    const outOfStock = data.filter((item) => item.soLuong <= 0).length
    const organicCount = data.filter((item) => item.huuCo).length
    const expiredCount = data.filter((item) => item.hanSuDung && isAfter(new Date(), parseISO(item.hanSuDung))).length
    const typeDistribution = [
      { name: "Thuốc", value: data.filter((item) => item.loai === "thuốc").length },
      { name: "Phân bón", value: data.filter((item) => item.loai === "phân").length },
      { name: "Khác", value: data.filter((item) => item.loai === "khác").length },
    ]

    // Calculate monthly purchase data (for the last 6 months)
    const today = new Date()
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(today, i)
      const monthName = format(month, "MMM", { locale: vi })
      const monthItems = data.filter(
        (item) => item.ngayMua && format(parseISO(item.ngayMua), "MM/yyyy") === format(month, "MM/yyyy"),
      )
      const value = monthItems.reduce((sum, item) => sum + item.donGia * item.soLuong, 0)
      monthlyData.push({ name: monthName, value })
    }

    return { totalItems, totalValue, outOfStock, organicCount, expiredCount, typeDistribution, monthlyData }
  }, [data])

  const COLORS = ["#ff6b6b", "#51cf66", "#339af0"]
  const formatCurrency = (amount: number) => new Intl.NumberFormat("vi-VN").format(amount)

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="overview" className="data-[state=active]:bg-lime-50 data-[state=active]:text-lime-700">
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="charts" className="data-[state=active]:bg-lime-50 data-[state=active]:text-lime-700">
            Biểu đồ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2 bg-lime-50">
              <CardTitle className="text-sm font-medium text-lime-800">Tổng quan vật tư</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Tổng số vật tư</p>
                    <p className="text-xl font-bold text-slate-800">{stats.totalItems}</p>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <Leaf className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Vật tư hữu cơ</p>
                    <p className="text-xl font-bold text-slate-800">{stats.organicCount}</p>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Hết hàng</p>
                    <p className="text-xl font-bold text-slate-800">{stats.outOfStock}</p>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Hết hạn</p>
                    <p className="text-xl font-bold text-slate-800">{stats.expiredCount}</p>
                  </div>
                </motion.div>
                <motion.div
                  className="pt-2 border-t"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Tổng giá trị</p>
                      <p className="text-xl font-bold text-slate-800">{formatCurrency(stats.totalValue)} đ</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          {stats.totalItems > 0 && (
            <div className="space-y-4">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2 bg-lime-50">
                  <CardTitle className="text-sm font-medium text-lime-800">Phân loại vật tư</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.typeDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100)?.toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {stats.typeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} vật tư`, ""]}
                          labelFormatter={(label) => `${label}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2 bg-lime-50">
                  <CardTitle className="text-sm font-medium text-lime-800">Chi tiêu theo tháng</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `${value / 1000}K`} />
                        <Tooltip formatter={(value) => [`${formatCurrency(value as number)} đ`, "Chi tiêu"]} />
                        <Bar dataKey="value" fill="#4ade80" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}


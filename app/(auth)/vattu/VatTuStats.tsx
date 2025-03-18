"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Package, Leaf, AlertTriangle } from "lucide-react"
import type { VatTu } from "./types"

interface VatTuStatsProps {
  data: VatTu[]
}

export default function VatTuStats({ data }: VatTuStatsProps) {
  const stats = useMemo(() => {
    const totalItems = data.length
    const totalValue = data.reduce((sum, item) => sum + item.donGia * item.soLuong, 0)
    const outOfStock = data.filter((item) => item.soLuong <= 0).length
    const organicCount = data.filter((item) => item.huuCo).length

    const typeDistribution = [
      { name: "Thuốc", value: data.filter((item) => item.loai === "thuốc").length },
      { name: "Phân bón", value: data.filter((item) => item.loai === "phân").length },
      { name: "Khác", value: data.filter((item) => item.loai === "khác").length },
    ]

    return {
      totalItems,
      totalValue,
      outOfStock,
      organicCount,
      typeDistribution,
    }
  }, [data])

  const COLORS = ["#ff6b6b", "#51cf66", "#339af0"]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Tổng quan vật tư</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Tổng số vật tư</p>
                <p className="text-xl font-bold">{stats.totalItems}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <Leaf className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Vật tư hữu cơ</p>
                <p className="text-xl font-bold">{stats.organicCount}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Hết hàng</p>
                <p className="text-xl font-bold">{stats.outOfStock}</p>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm text-slate-500">Tổng giá trị</p>
              <p className="text-xl font-bold">{formatCurrency(stats.totalValue)} đ</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {stats.totalItems > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Phân loại vật tư</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.typeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {stats.typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} vật tư`, ""]} labelFormatter={(label) => `${label}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CostBreakdownChart({ data }) {
  // Tính tổng chi phí theo loại
  const costByType = data.reduce((acc, log) => {
    // Chi phí công
    if (log.chiPhiCong > 0) {
      acc.labor = (acc.labor || 0) + log.chiPhiCong
    }

    // Chi phí vật tư
    if (log.chiPhiVatTu > 0) {
      // Nếu có agrochemicals, phân loại chi tiết hơn
      if (log.agrochemicals && log.agrochemicals.length > 0) {
        log.agrochemicals.forEach((item) => {
          if (item.type === "phân") {
            acc.fertilizer = (acc.fertilizer || 0) + item.lieuLuong * item.donGia
          } else if (item.type === "thuốc") {
            acc.pesticide = (acc.pesticide || 0) + item.lieuLuong * item.donGia
          } else {
            acc.otherMaterials = (acc.otherMaterials || 0) + item.lieuLuong * item.donGia
          }
        })
      } else {
        // Nếu không có chi tiết, ghi nhận là chi phí vật tư khác
        acc.otherMaterials = (acc.otherMaterials || 0) + log.chiPhiVatTu
      }
    }

    return acc
  }, {})

  // Chuyển đổi thành mảng cho biểu đồ
  const chartData = [
    { name: "Công lao động", value: costByType.labor || 0, color: "#4CAF50" },
    { name: "Phân bón", value: costByType.fertilizer || 0, color: "#2196F3" },
    { name: "Thuốc BVTV", value: costByType.pesticide || 0, color: "#FFC107" },
    { name: "Vật tư khác", value: costByType.otherMaterials || 0, color: "#9C27B0" },
  ].filter((item) => item.value > 0)

  // Format số tiền
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-md shadow-md">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-lg font-bold">{formatCurrency(payload[0].value)}</p>
          <p className="text-sm text-slate-500">{Math.round(payload[0].percent * 100)}% tổng chi phí</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cơ cấu chi phí</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


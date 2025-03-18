import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SeasonComparisonChart({ data }) {
  // Nhóm dữ liệu theo mùa vụ
  const seasonData = data.reduce((acc, log) => {
    const season = log.muaVu || "Không xác định"

    if (!acc[season]) {
      acc[season] = {
        name: season,
        cost: 0,
        revenue: 0,
        profit: 0,
        taskCount: 0,
      }
    }

    acc[season].cost += log.chiPhiCong + log.chiPhiVatTu
    acc[season].revenue += log.thanhTien || 0
    acc[season].taskCount += 1

    return acc
  }, {})

  // Tính lợi nhuận và chuyển đổi thành mảng
  const chartData = Object.values(seasonData).map((season) => {
    season.profit = season.revenue - season.cost
    return season
  })

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
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sm text-slate-500">Số công việc: {payload[0].payload.taskCount}</p>
          <div className="mt-2 space-y-1">
            <p>Chi phí: {formatCurrency(payload[0].payload.cost)}</p>
            <p>Doanh thu: {formatCurrency(payload[0].payload.revenue)}</p>
            <p className={payload[0].payload.profit >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
              Lợi nhuận: {formatCurrency(payload[0].payload.profit)}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>So sánh hiệu quả theo mùa vụ</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="cost" name="Chi phí" fill="#FF5252" />
            <Bar dataKey="revenue" name="Doanh thu" fill="#4CAF50" />
            <Bar dataKey="profit" name="Lợi nhuận" fill="#2196F3" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


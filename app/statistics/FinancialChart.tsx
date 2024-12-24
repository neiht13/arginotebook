import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function FinancialChart({ data }) {
  const totalCost = data.reduce((sum, log) => sum + log.chiPhiVatTu + log.chiPhiCong, 0)
  const totalRevenue = data.reduce((sum, log) => sum + log.thanhTien, 0)
  const profit = totalRevenue - totalCost

  const chartData = [
    { name: 'Chi phí', value: totalCost },
    { name: 'Doanh thu', value: totalRevenue },
    { name: 'Lợi nhuận', value: profit },
  ]

  return (
    <ChartContainer
      config={{
        value: {
          label: 'Giá trị (VND)',
          color: 'hsl(var(--chart-1))',
        },
      }}
      className="h-[300px] w-full"
    >
      <ResponsiveContainer width="60%" height="100%">
      <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Bar dataKey="value" fill="var(--color-value)" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}


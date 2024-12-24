import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function TaskCountChart({ data }) {
  const chartData = [
    { name: 'Tổng số công việc', value: data.length },
  ]

  return (
    <ChartContainer
      config={{
        value: {
          label: 'Số lượng',
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
          <Bar dataKey="value" fill="var(--color-value)" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}


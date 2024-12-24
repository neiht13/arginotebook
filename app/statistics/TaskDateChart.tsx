import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function TaskDateChart({ data }) {
  const chartData= data.reduce((acc, log) => {
    const date = log.ngayThucHien
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  const sortedData = Object.entries(chartData)
    .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
    .map(([date, count]) => ({ date, count }))

  return (
    <ChartContainer
      config={{
        count: {
          label: 'Số lượng công việc',
          color: 'hsl(var(--chart-1))',
        },
      }}
      className="h-[300px] w-full"
    >
      <ResponsiveContainer width="60%" height="100%">
      <LineChart data={sortedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line type="monotone" dataKey="count" stroke="var(--color-count)" />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}


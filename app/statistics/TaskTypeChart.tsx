import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function TaskTypeChart({ data }) {
  const taskTypes = data.reduce((acc, log) => {
    acc[log.congViec] = (acc[log.congViec] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(taskTypes).map(([name, value]) => ({ name, value }))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <ChartContainer
      config={Object.fromEntries(
        chartData.map((entry, index) => [
          entry.name,
          { label: entry.name, color: COLORS[index % COLORS.length] },
        ])
      )}
      className="h-[300px] w-full"
    >
      <ResponsiveContainer width="60%" height="100%">
      <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}


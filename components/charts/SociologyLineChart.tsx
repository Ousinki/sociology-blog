'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface DataPoint {
  year: string | number
  [key: string]: string | number
}

interface SociologyLineChartProps {
  data: DataPoint[]
  dataKeys: string[]
  title?: string
  xAxisLabel?: string
  yAxisLabel?: string
  colors?: string[]
}

const DEFAULT_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']

/**
 * 社会学数据折线图组件
 * 用于展示趋势变化，如人口增长、社会指标变化等
 */
export default function SociologyLineChart({
  data,
  dataKeys,
  title,
  xAxisLabel,
  yAxisLabel,
  colors = DEFAULT_COLORS,
}: SociologyLineChartProps) {
  return (
    <div className="my-8 w-full">
      {title && <h3 className="mb-4 text-center text-xl font-semibold">{title}</h3>}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            label={{ value: xAxisLabel, position: 'insideBottom', offset: -10 }}
          />
          <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          {dataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

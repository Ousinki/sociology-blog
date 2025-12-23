'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface DataPoint {
  category: string
  value: number
  [key: string]: string | number
}

interface SociologyBarChartProps {
  data: DataPoint[]
  dataKey?: string
  title?: string
  xAxisLabel?: string
  yAxisLabel?: string
  color?: string
}

/**
 * 社会学数据条形图组件
 * 用于展示分类数据的对比，如调查结果、人口统计等
 */
export default function SociologyBarChart({
  data,
  dataKey = 'value',
  title,
  xAxisLabel,
  yAxisLabel,
  color = '#3b82f6',
}: SociologyBarChartProps) {
  return (
    <div className="my-8 w-full">
      {title && <h3 className="mb-4 text-center text-xl font-semibold">{title}</h3>}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
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
            dataKey="category"
            label={{ value: xAxisLabel, position: 'insideBottom', offset: -10 }}
          />
          <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey={dataKey} fill={color} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

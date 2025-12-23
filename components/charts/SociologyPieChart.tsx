'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface DataPoint {
  name: string
  value: number
  [key: string]: string | number
}

interface SociologyPieChartProps {
  data: DataPoint[]
  title?: string
  colors?: string[]
}

const DEFAULT_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

/**
 * 社会学数据饼图组件
 * 用于展示比例分布，如人口结构、调查选项分布等
 */
export default function SociologyPieChart({
  data,
  title,
  colors = DEFAULT_COLORS,
}: SociologyPieChartProps) {
  return (
    <div className="my-8 w-full">
      {title && <h3 className="mb-4 text-center text-xl font-semibold">{title}</h3>}
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// ============================================
// TradingHub Pro - Monthly Returns Component
// Bar chart showing monthly performance
// ============================================

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface MonthlyReturn {
  month: string
  return: string
}

interface MonthlyReturnsProps {
  /** Monthly returns data */
  data: MonthlyReturn[]
}

/**
 * Bar chart showing monthly returns
 */
export function MonthlyReturns({ data }: MonthlyReturnsProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Monthly Returns
          </h2>
          <p className="text-sm text-gray-400">Performance breakdown by month</p>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="month" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <YAxis 
              tickFormatter={(value) => `${value}%`}
              stroke="#6B7280" 
              tick={{ fill: '#9CA3AF', fontSize: 12 }} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              formatter={(value: number) => [`${value}%`, 'Return']}
            />
            <Bar 
              dataKey="return" 
              fill="#6366F1"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

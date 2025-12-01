// ============================================
// TradingHub Pro - Asset Allocation Component
// Pie chart showing portfolio distribution
// ============================================

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { PieChart as PieChartIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface AllocationItem {
  name: string
  value: number
  percent: number
  color: string
  [key: string]: string | number // Index signature for Recharts compatibility
}

interface AssetAllocationProps {
  /** Allocation data for the pie chart */
  data: AllocationItem[]
  /** Price formatting function */
  formatPrice: (value: number) => string
}

/**
 * Asset allocation pie chart with legend
 */
export function AssetAllocation({ data, formatPrice }: AssetAllocationProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-indigo-400" />
            Asset Allocation
          </h2>
          <p className="text-sm text-gray-400">Portfolio distribution by asset</p>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                formatter={(value: number) => formatPrice(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">{item.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  {formatPrice(item.value)}
                </span>
                <span className="text-sm font-medium w-16 text-right">
                  {item.percent.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

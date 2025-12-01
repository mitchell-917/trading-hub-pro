// ============================================
// TradingHub Pro - Risk Profile Component
// Radar chart showing risk distribution
// ============================================

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import { Shield } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import type { SectorData } from './types'

interface RiskProfileProps {
  /** Sector allocation data for the radar chart */
  data: SectorData[]
}

/**
 * Risk profile radar chart showing portfolio distribution across sectors
 */
export function RiskProfile({ data }: RiskProfileProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Risk Profile
          </h2>
          <p className="text-sm text-gray-400">Portfolio risk analysis</p>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="sector" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
            <Radar
              name="Allocation"
              dataKey="value"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

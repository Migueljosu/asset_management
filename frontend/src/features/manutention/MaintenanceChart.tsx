//src/features/manutention/MaintenanceChart.tsx
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

import { StatusStats } from '../reports/types'

interface Props {
  data?: StatusStats
}

const COLORS = [
  '#3b82f6', // reported
  '#f59e0b', // under_review
  '#a855f7', // in_maintenance
  '#22c55e'  // resolved
]

export default function MaintenanceChart({ data }: Props) {

  if (!data) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="font-semibold mb-4">
          Estado das Manutenções
        </h3>
        <p>Sem dados disponíveis</p>
      </div>
    )
  }

  const chartData = [
    { name: 'Reportadas', value: data.reported },
    { name: 'Em revisão', value: data.under_review },
    { name: 'Em manutenção', value: data.in_maintenance },
    { name: 'Resolvidas', value: data.resolved },
  ]

  return (
    <div className="bg-white p-6 rounded-2xl shadow">

      <h3 className="font-semibold mb-4">
        Estado das Manutenções
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>

          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />

        </PieChart>
      </ResponsiveContainer>

    </div>
  )
}
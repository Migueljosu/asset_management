import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { SeverityStats } from '../reports/types'

interface Props {
  data?: SeverityStats
}

export default function AnomalyChart({ data }: Props) {

  if (!data) {
    return (
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-lg font-semibold mb-4">Severidade</h2>
        <p>Sem dados disponíveis</p>
      </div>
    )
  }

  const chartData = [
    { name: 'Baixa', value: data.low, color: '#22c55e' },
    { name: 'Média', value: data.medium, color: '#f59e0b' },
    { name: 'Alta', value: data.high, color: '#ef4444' },
  ]

  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <h2 className="text-lg font-semibold mb-4">Severidade</h2>

      <div className="w-full h-[300px]">
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

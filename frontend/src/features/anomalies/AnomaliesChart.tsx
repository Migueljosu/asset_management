import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
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
    { name: 'Baixa', value: data.low },
    { name: 'Média', value: data.medium },
    { name: 'Alta', value: data.high },
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
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
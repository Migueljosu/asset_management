import { SystemStats } from './types'

interface Props {
  stats: SystemStats
}

export default function StatsCards({ stats }: Props) {

  const pending = stats.totalAnomalies - stats.resolvedAnomalies

  return (
    <div className="grid grid-cols-3 gap-6">

      {/* Total */}
      <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-200">
        <p className="text-blue-600 text-sm font-medium">
          Total de Anomalias
        </p>
        <h2 className="text-4xl font-bold text-blue-800">
          {stats.totalAnomalies}
        </h2>
      </div>

      {/* Resolvidas */}
      <div className="bg-green-50 p-6 rounded-2xl shadow border border-green-200">
        <p className="text-green-600 text-sm font-medium">
          Resolvidas
        </p>
        <h2 className="text-4xl font-bold text-green-800">
          {stats.resolvedAnomalies}
        </h2>
      </div>

      {/* Pendentes */}
      <div className="bg-red-50 p-6 rounded-2xl shadow border border-red-200">
        <p className="text-red-600 text-sm font-medium">
          Pendentes
        </p>
        <h2 className="text-4xl font-bold text-red-800">
          {pending}
        </h2>
      </div>

    </div>
  )
}
import { useEffect, useState } from 'react'
import { fetchAnomalies } from '../anomalies/anomalyService'
import { Anomaly } from '../anomalies/types'

export default function AnomalyList() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnomalies().then((data) => {
      setAnomalies(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <p className="text-center py-10">Carregando anomalias...</p>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Lista de Anomalias</h1>

      <div className="space-y-4">
        {anomalies.map((anomaly) => (
          <div
            key={anomaly.id}
            className="p-4 border rounded-lg bg-card shadow-sm"
          >
            <h2 className="font-semibold">{anomaly.title}</h2>
            <p>Severidade: {anomaly.severity}</p>
            <p>Status: {anomaly.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
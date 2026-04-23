import { useEffect, useRef, useState } from 'react'
import { anomalyService } from './anomalyService'
import { Anomaly } from './types'
import { useAppState } from '@/context/AppContext'

interface Props {
  filterSeverity?: 'low' | 'medium' | 'high' | 'all'
}

export default function AnomalyList({ filterSeverity = 'all' }: Props) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const listRef = useRef<HTMLDivElement>(null)
  const { theme } = useAppState()

  useEffect(() => {
    anomalyService.getAll().then(setAnomalies)
  }, [])

  // Scroll automático para o último item
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [anomalies])

  const filtered = anomalies.filter(a => filterSeverity === 'all' ? true : a.severity === filterSeverity)

  return (
    <div
      ref={listRef}
      className={`p-4 rounded-xl shadow-lg overflow-y-auto max-h-96 space-y-3 ${theme === 'dark' ? 'bg-zinc-800 text-zinc-100' : 'bg-white text-zinc-900'}`}
    >
      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-400">Nenhuma anomalia encontrada</p>
      ) : (
        filtered.map(a => (
          <div key={a.id} className="border-b border-zinc-600 pb-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{a.title}</h3>
              <span className="text-sm">{a.severity === 'low' ? '🟢' : a.severity === 'medium' ? '🟡' : '🔴'}</span>
            </div>
            <p className="text-sm text-zinc-400">{a.description}</p>
            <p className="text-xs text-zinc-500">Reportado por {a.reportedBy} em {new Date(a.createdAt).toLocaleString()}</p>
          </div>
        ))
      )}
    </div>
  )
}
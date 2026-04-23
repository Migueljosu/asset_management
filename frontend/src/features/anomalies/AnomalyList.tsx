import { useEffect, useRef, useState } from 'react'
import { fetchAnomalies } from './anomalyService'
import { Anomaly } from './types'
import { useAppState } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

interface Props {
  filterSeverity?: 'low' | 'medium' | 'high' | 'all'
  refreshKey?: number
  anomalies?: Anomaly[]
  onEdit?: (anomaly: Anomaly) => void
  onDelete?: (id: number) => Promise<void> | void
  onResolve?: (id: number) => Promise<void> | void
}

export default function AnomalyList({
  filterSeverity = 'all',
  refreshKey,
  anomalies: externalAnomalies,
  onEdit,
  onDelete,
  onResolve,
}: Props) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>(externalAnomalies || [])
  const listRef = useRef<HTMLDivElement>(null)
  const { theme } = useAppState()
  const { token } = useAuth()

  useEffect(() => {
    if (externalAnomalies) {
      setAnomalies(externalAnomalies)
      return
    }

    if (!token) return

    fetchAnomalies(token)
      .then(setAnomalies)
      .catch((error: any) => {
        toast.error(error.message || 'Erro ao carregar anomalias')
      })
  }, [token, refreshKey, externalAnomalies])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [anomalies])

  const filtered = anomalies.filter((a) =>
    filterSeverity === 'all' ? true : a.severity === filterSeverity
  )

  return (
    <div
      ref={listRef}
      className={`p-4 rounded-xl shadow-lg overflow-y-auto max-h-96 space-y-3 ${theme === 'dark' ? 'bg-zinc-800 text-zinc-100' : 'bg-white text-zinc-900'}`}
    >
      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-400">Nenhuma anomalia encontrada</p>
      ) : (
        filtered.map((a) => (
          <div key={a.id} className="border-b border-zinc-600 pb-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{a.title}</h3>
              <span className="text-sm">
                {a.severity === 'low' ? 'Baixa' : a.severity === 'medium' ? 'Media' : 'Alta'}
              </span>
            </div>
            <p className="text-sm text-zinc-400">{a.description}</p>
            <p className="text-xs text-zinc-500">
              Equipamento: {a.equipmentName || `#${a.equipmentId}`}
            </p>
            <p className="text-xs text-zinc-500">
              Reportado por {a.reportedBy || 'Utilizador'} em{' '}
              {new Date(a.createdAt).toLocaleString()}
            </p>
            <p className="text-xs text-zinc-500 capitalize">Estado: {a.status}</p>

            {(onEdit || onDelete || onResolve) && (
              <div className="mt-3 flex gap-3">
                {onEdit && (
                  <button
                    onClick={() => onEdit(a)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Editar
                  </button>
                )}
                {onResolve && a.status !== 'resolved' && (
                  <button
                    onClick={() => onResolve(a.id)}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Resolver
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() =>
                      toast('Confirmar eliminação?', {
                        description: `A anomalia "${a.title}" será removida.`,
                        action: {
                          label: 'Confirmar',
                          onClick: () => onDelete(a.id),
                        },
                        cancel: {
                          label: 'Cancelar',
                          onClick: () => {
                            toast('Ação cancelada')
                          },
                        },
                      })
                    }
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

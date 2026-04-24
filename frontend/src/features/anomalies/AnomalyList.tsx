import { useEffect, useRef, useState } from 'react'
import { fetchAnomalies } from './anomalyService'
import { Anomaly } from './types'
import { useAppState } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { usePagination } from '@/hooks/usePagination'
import Pagination from '@/components/ui/Pagination'
import { AlertTriangle, ShieldAlert, ShieldCheck, Shield } from 'lucide-react'

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
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
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

  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    goToPrevious,
    goToNext,
  } = usePagination<Anomaly>({
    data: anomalies,
    itemsPerPage: 5,
    searchFields: ['title', 'description', 'equipmentName'],
    searchValue: search,
    filterFn: (a) => {
      const severityMatch = filterSeverity === 'all' || a.severity === filterSeverity
      const statusMatch = statusFilter === 'ALL' || a.status === statusFilter
      return severityMatch && statusMatch
    },
  })

  const severityConfig = {
    low: { label: 'Baixa', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Shield },
    medium: { label: 'Média', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: ShieldAlert },
    high: { label: 'Alta', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    reported: { label: 'Reportada', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    in_progress: { label: 'Em análise', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    resolved: { label: 'Resolvida', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  }

  const isDark = theme === 'dark'

  return (
    <div className="space-y-4">
      {/* 🔍 Filtros avançados */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Pesquisar por título, descrição ou equipamento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`flex-1 min-w-[200px] border rounded-md px-3 py-2 text-sm ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-gray-300'}`}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`border rounded-md px-3 py-2 text-sm ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-gray-300'}`}
          aria-label="Filtrar por estado"
        >
          <option value="ALL">Todos os estados</option>
          <option value="reported">Reportada</option>
          <option value="in_progress">Em análise</option>
          <option value="resolved">Resolvida</option>
        </select>
      </div>

      <div
        ref={listRef}
        className={`p-4 rounded-xl shadow-lg overflow-y-auto max-h-[500px] space-y-3 ${isDark ? 'bg-zinc-800 text-zinc-100' : 'bg-white text-zinc-900'}`}
      >
        {totalItems === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-8">Nenhuma anomalia encontrada</p>
        ) : (
          <>
            {paginatedData.map((a) => {
              const sev = severityConfig[a.severity] || severityConfig.low
              const stat = statusConfig[a.status] || statusConfig.reported
              const Icon = sev.icon

              return (
                <div
                  key={a.id}
                  className={`border rounded-lg p-4 transition hover:shadow-md ${isDark ? 'border-zinc-700 bg-zinc-900/50' : 'border-gray-200 bg-gray-50/50'}`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base">{a.title}</h3>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${sev.color}`}>
                          <Icon size={12} />
                          {sev.label}
                        </span>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${stat.color}`}>
                          {stat.label}
                        </span>
                      </div>

                      <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>
                        {a.description}
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                        <span>Equipamento: <strong className={isDark ? 'text-zinc-300' : 'text-gray-700'}>{a.equipmentName || `#${a.equipmentId}`}</strong></span>
                        <span>Reportado por: <strong className={isDark ? 'text-zinc-300' : 'text-gray-700'}>{a.reportedBy || 'Utilizador'}</strong></span>
                        <span>Data: {new Date(a.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {(onEdit || onDelete || onResolve) && (
                      <div className="flex flex-col gap-2 min-w-[80px]">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(a)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium text-right"
                          >
                            Editar
                          </button>
                        )}
                        {onResolve && a.status !== 'resolved' && (
                          <button
                            onClick={() => onResolve(a.id)}
                            className="text-emerald-600 hover:text-emerald-800 text-sm font-medium text-right"
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
                            className="text-red-600 hover:text-red-800 text-sm font-medium text-right"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              startItem={startItem}
              endItem={endItem}
              onPrevious={goToPrevious}
              onNext={goToNext}
            />
          </>
        )}
      </div>
    </div>
  )
}


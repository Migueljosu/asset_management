import { useEffect, useMemo, useState } from 'react'
import { maintenanceService } from './maintenanceService'
import { Maintenance } from './types'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { fetchAnomalies } from '../anomalies/anomalyService'
import { Anomaly } from '../anomalies/types'
import { Button } from '@/components/ui/Button'
import { usePagination } from '@/hooks/usePagination'
import Pagination from '@/components/ui/Pagination'
import { Wrench, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

interface Props {
  refreshKey?: number
}

export default function MaintenanceList({ refreshKey }: Props) {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const { token, user } = useAuth()

  useEffect(() => {
    loadData()
  }, [refreshKey, token])

  async function loadData() {
    if (!token) return

    setLoading(true)

    try {
      const [maintenanceData, anomalyData] = await Promise.all([
        maintenanceService.getAll(token),
        fetchAnomalies(token),
      ])

      setMaintenances(maintenanceData)
      setAnomalies(anomalyData)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar manutenções')
    } finally {
      setLoading(false)
    }
  }

  const anomalyCountByEquipment = useMemo(() => {
    return anomalies.reduce<Record<number, number>>((acc, anomaly) => {
      if (anomaly.status === 'resolved') return acc
      acc[anomaly.equipmentId] = (acc[anomaly.equipmentId] || 0) + 1
      return acc
    }, {})
  }, [anomalies])

  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    goToPrevious,
    goToNext,
  } = usePagination<Maintenance>({
    data: maintenances,
    itemsPerPage: 5,
    searchFields: ['equipmentName', 'description', 'type', 'technicianName'],
    searchValue: search,
    filterFn: (m) => {
      if (statusFilter === 'ALL') return true
      return m.status === statusFilter
    },
  })

  async function handleFinish(id: number) {
    if (!token) return

    try {
      await maintenanceService.finish(id, token)
      toast.success('Manutenção concluída com sucesso')
      await loadData()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao concluir manutenção')
    }
  }

  async function handleCancel(id: number) {
    if (!token) return

    try {
      await maintenanceService.cancel(id, token)
      toast.success('Manutenção cancelada com sucesso')
      await loadData()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cancelar manutenção')
    }
  }

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    in_progress: { label: 'Em andamento', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Wrench },
    completed: { label: 'Concluída', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  }

  const canManageMaintenance = user?.role === 'admin' || user?.role === 'tecnico'

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
        Carregando manutenções...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 🔍 Filtros avançados */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Pesquisar por equipamento, descrição, tipo ou técnico..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] border rounded-md px-3 py-2 text-sm bg-background"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-background"
          aria-label="Filtrar por estado"
        >
          <option value="ALL">Todos os estados</option>
          <option value="in_progress">Em andamento</option>
          <option value="completed">Concluídas</option>
          <option value="cancelled">Canceladas</option>
        </select>
      </div>

      {totalItems === 0 ? (
        <div className="text-center py-8 text-muted-foreground bg-card rounded-lg border border-border">
          Nenhuma manutenção registrada.
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedData.map((maintenance) => {
              const activeAnomalies = anomalyCountByEquipment[maintenance.equipmentId] || 0
              const stat = statusConfig[maintenance.status] || statusConfig.in_progress
              const StatusIcon = stat.icon

              return (
                <div
                  key={maintenance.id}
                  className="bg-card p-5 rounded-xl border border-border shadow-sm space-y-3 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{maintenance.equipmentName}</h3>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${stat.color}`}>
                          <StatusIcon size={12} />
                          {stat.label}
                        </span>
                      </div>

                      {activeAnomalies > 0 && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertTriangle size={12} />
                          Este equipamento tem {activeAnomalies} anomalia(s) aberta(s)
                        </p>
                      )}

                      <p className="text-muted-foreground text-sm">{maintenance.description}</p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>Tipo: <strong className="text-foreground">{maintenance.type}</strong></span>
                        <span>Técnico: <strong className="text-foreground">{maintenance.technicianName}</strong></span>
                        {maintenance.startDate && (
                          <span>Início: {new Date(maintenance.startDate).toLocaleDateString()}</span>
                        )}
                        {maintenance.endDate && (
                          <span>Fim: {new Date(maintenance.endDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    {canManageMaintenance && maintenance.status === 'in_progress' && (
                      <div className="flex gap-2 min-w-[180px]">
                        <Button size="sm" onClick={() => handleFinish(maintenance.id)}>
                          Concluir
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleCancel(maintenance.id)}>
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

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
  )
}


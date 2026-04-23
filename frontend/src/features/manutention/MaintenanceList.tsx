import { useEffect, useMemo, useState } from 'react'
import { maintenanceService } from './maintenanceService'
import { Maintenance } from './types'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { fetchAnomalies } from '../anomalies/anomalyService'
import { Anomaly } from '../anomalies/types'
import { Button } from '@/components/ui/Button'

interface Props {
  refreshKey?: number
}

export default function MaintenanceList({ refreshKey }: Props) {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [loading, setLoading] = useState(true)
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

  if (loading) {
    return <div>Carregando manutenções...</div>
  }

  const canManageMaintenance = user?.role === 'admin' || user?.role === 'tecnico'

  return (
    <div className="space-y-4">
      {maintenances.length === 0 && (
        <div className="text-gray-500">Nenhuma manutenção registrada.</div>
      )}

      {maintenances.map((maintenance) => {
        const activeAnomalies = anomalyCountByEquipment[maintenance.equipmentId] || 0

        return (
          <div
            key={maintenance.id}
            className="bg-white p-5 rounded-2xl shadow-md space-y-3"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{maintenance.equipmentName}</h3>
                {activeAnomalies > 0 && (
                  <p className="text-xs text-amber-600">
                    Este equipamento tem {activeAnomalies} anomalia(s) aberta(s)
                  </p>
                )}
              </div>

              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  maintenance.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {maintenance.status}
              </span>
            </div>

            <p className="text-gray-600">{maintenance.description}</p>

            <div className="text-sm text-gray-500">Tipo: {maintenance.type}</div>
            <div className="text-sm text-gray-500">Técnico: {maintenance.technicianName}</div>

            {canManageMaintenance && maintenance.status === 'in_progress' && (
              <div className="flex gap-3">
                <Button onClick={() => handleFinish(maintenance.id)}>Concluir</Button>
                <Button onClick={() => handleCancel(maintenance.id)}>Cancelar</Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

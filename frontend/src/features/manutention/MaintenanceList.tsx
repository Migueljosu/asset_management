import { useEffect, useState } from 'react'
import { maintenanceService } from './maintenanceService'
import { equipmentService } from '../equipment/equipmentService'
import { Maintenance } from './types'
import { Equipment } from '../equipment/types'
import { Button } from '@/components/ui/Button'
import { fakeUser } from '@/utils/fakeAuth'

interface Props {
  refreshKey?: number
}

export default function MaintenanceList({ refreshKey }: Props) {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [refreshKey])

  async function loadData() {
    setLoading(true)

    const maintenanceData = await maintenanceService.getAll()
    const equipmentData = await equipmentService.getAll()

    setMaintenances(maintenanceData)
    setEquipments(equipmentData)
    setLoading(false)
  }

  function getEquipmentName(id: string) {
    const equipment = equipments.find((e) => e.id === id)
    return equipment ? equipment.name : 'Desconhecido'
  }

  async function handleUpdateStatus(
    id: string,
    status: Maintenance['status']
  ) {
    await maintenanceService.updateStatus(id, status)
    loadData()
  }

  if (loading) {
    return <div>Carregando manutenções...</div>
  }

  return (
    <div className="space-y-4">
      {maintenances.length === 0 && (
        <div className="text-gray-500">
          Nenhuma manutenção registrada.
        </div>
      )}

      {maintenances.map((maintenance) => (
        <div
          key={maintenance.id}
          className="bg-white p-5 rounded-2xl shadow-md space-y-3"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">
              {getEquipmentName(maintenance.equipmentId)}
            </h3>

            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${
                maintenance.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : maintenance.status === 'in_progress'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {maintenance.status}
            </span>
          </div>

          <p className="text-gray-600">
            {maintenance.description}
          </p>

          <div className="text-sm text-gray-500">
            Técnico: {maintenance.technician}
          </div>

          <div className="flex gap-3">
            {/* Técnico pode iniciar */}
            {fakeUser.role === 'technician' &&
              maintenance.status === 'pending' && (
                <Button
                  onClick={() =>
                    handleUpdateStatus(
                      maintenance.id,
                      'in_progress'
                    )
                  }
                >
                  Iniciar
                </Button>
              )}

            {/* Técnico pode concluir */}
            {fakeUser.role === 'technician' &&
              maintenance.status === 'in_progress' && (
                <Button
                  onClick={() =>
                    handleUpdateStatus(
                      maintenance.id,
                      'completed'
                    )
                  }
                >
                  Concluir
                </Button>
              )}

            {/* Admin pode alterar qualquer status */}
            {fakeUser.role === 'admin' &&
              maintenance.status !== 'completed' && (
                <Button
                  onClick={() =>
                    handleUpdateStatus(
                      maintenance.id,
                      'completed'
                    )
                  }
                >
                  Marcar como Concluída
                </Button>
              )}
          </div>
        </div>
      ))}
    </div>
  )
}
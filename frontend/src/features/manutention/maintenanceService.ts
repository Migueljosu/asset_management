import { Maintenance, CreateMaintenanceDTO } from './types'
import { equipmentService } from '../equipment/equipmentService'
import { anomalyService } from '../anomalies/anomalyService'

let mockMaintenances: Maintenance[] = []

export const maintenanceService = {
  async getAll(): Promise<Maintenance[]> {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockMaintenances), 300)
    )
  },

  async create(data: CreateMaintenanceDTO): Promise<Maintenance> {
    const newMaintenance: Maintenance = {
      id: crypto.randomUUID(),
      ...data,
      status: 'pending',
      startDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    mockMaintenances.push(newMaintenance)

    //  Coloca equipamento em manutenção
    await equipmentService.updateStatus(
      data.equipmentId,
      'maintenance'
    )

    return newMaintenance
  },

  async updateStatus(
    id: string,
    status: Maintenance['status']
  ) {
    const maintenance = mockMaintenances.find(
      (m) => m.id === id
    )

    if (!maintenance) return undefined

    maintenance.status = status

    if (status === 'completed') {
      maintenance.endDate = new Date().toISOString()

      //  Equipamento volta a ativo
      await equipmentService.updateStatus(
        maintenance.equipmentId,
        'active'
      )

      //  Se estiver ligada a uma anomalia, resolve
      if (maintenance.anomalyId) {
        await anomalyService.markAsResolved(
          maintenance.anomalyId
        )
      }
    }

    return maintenance
  },
}
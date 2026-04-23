import { anomalyService } from '../anomalies/anomalyService'
import { equipmentService } from '../equipment/equipmentService'

async function getBaseData(token?: string) {
  const [anomalies, equipments] = await Promise.all([
    anomalyService.getAll(token),
    equipmentService.getAll(token || ''),
  ])
  return { anomalies, equipments }
}

export const reportService = {

  async getSystemStats(token?: string) {
    const { anomalies, equipments } = await getBaseData(token)

    return {
      totalEquipments: equipments.length,
      totalAnomalies: anomalies.length,
      resolvedAnomalies: anomalies.filter(a => a.status === 'resolved').length,
      maintenanceAnomalies: anomalies.filter(a => a.status === 'in_progress').length,
      borrowedEquipments: equipments.filter((e: { estado: string }) => e.estado === 'em_uso').length,
    }
  },

  async getSeverityStats(token?: string) {
    const { anomalies } = await getBaseData(token)

    return {
      low: anomalies.filter(a => a.severity === 'low').length,
      medium: anomalies.filter(a => a.severity === 'medium').length,
      high: anomalies.filter(a => a.severity === 'high').length
    }
  },

  async getStatusStats(token?: string) {
    const { anomalies } = await getBaseData(token)

    return {
      reported: anomalies.filter(a => a.status === 'reported').length,
      in_progress: anomalies.filter(a => a.status === 'in_progress').length,
      resolved: anomalies.filter(a => a.status === 'resolved').length
    }
  }
}


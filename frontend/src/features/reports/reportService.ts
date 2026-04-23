import { anomalyService } from '../anomalies/anomalyService'
import { equipmentService } from '../equipment/equipmentService'

async function getBaseData() {
  const [anomalies, equipments] = await Promise.all([
    anomalyService.getAll(),
    //equipmentService.getAll()
  ])

  return { anomalies, equipments }
}

export const reportService = {

  async getSystemStats() {
    const { anomalies, equipments } = await getBaseData()

    return {
      //totalEquipments: equipments.length,
      totalAnomalies: anomalies.length,
      resolvedAnomalies: anomalies.filter(a => a.status === 'resolved').length,
      maintenanceAnomalies: anomalies.filter(a => a.status === 'in_maintenance').length,
      borrowedEquipments: 0
    }
  },

  async getSeverityStats() {
    const { anomalies } = await getBaseData()

    return {
      low: anomalies.filter(a => a.severity === 'low').length,
      medium: anomalies.filter(a => a.severity === 'medium').length,
      high: anomalies.filter(a => a.severity === 'high').length
    }
  },

  async getStatusStats() {
    const { anomalies } = await getBaseData()

    return {
      reported: anomalies.filter(a => a.status === 'reported').length,
      under_review: anomalies.filter(a => a.status === 'under_review').length,
      in_maintenance: anomalies.filter(a => a.status === 'in_maintenance').length,
      resolved: anomalies.filter(a => a.status === 'resolved').length
    }
  }

}
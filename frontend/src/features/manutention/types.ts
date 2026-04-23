export type MaintenanceStatus = 'in_progress' | 'completed'

export interface Maintenance {
  id: number
  equipmentId: number
  equipmentName: string
  description: string
  type: string
  status: MaintenanceStatus
  startDate: string
  endDate?: string
  technicianId: number
  technicianName: string
  createdAt: string
}

export interface CreateMaintenanceDTO {
  equipmentId: number
  description: string
  type: string
}

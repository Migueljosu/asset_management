export type MaintenanceStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'

export interface Maintenance {
  id: string
  equipmentId: string
  anomalyId?: string
  description: string
  status: MaintenanceStatus
  startDate: string
  endDate?: string
  technician: string
  createdAt: string
}

export interface CreateMaintenanceDTO {
  equipmentId: string
  anomalyId?: string
  description: string
  technician: string
}
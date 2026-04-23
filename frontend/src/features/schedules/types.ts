export type ScheduleStatus = 'pending' | 'approved' | 'cancelled' | 'completed'

export interface Schedule {
  id: number
  equipmentId: number
  equipmentName: string
  userId: number
  userName: string
  sectorId: number
  sectorName: string
  startDate: string
  endDate: string
  status: ScheduleStatus
  createdAt?: string
}

export interface CreateScheduleDTO {
  equipmentId: number
  sectorId: number
  startDate: string
  endDate: string
}

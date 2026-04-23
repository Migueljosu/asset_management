export interface Anomaly {
  id: number
  equipmentId: number
  title: string
  description: string
  equipmentName?: string
  reportedBy?: string
  severity: 'low' | 'medium' | 'high'
  status: 'reported' | 'in_progress' | 'resolved'
  createdAt: string
}

export interface CreateAnomalyDTO {
  equipmentId: number
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
}

export interface UpdateAnomalyDTO {
  title?: string
  description?: string
  severity?: 'low' | 'medium' | 'high'
  status?: 'reported' | 'in_progress' | 'resolved'
}

export interface AnomalyStatsType {
  total: number
  open: number
  resolved: number
  critical: number
}

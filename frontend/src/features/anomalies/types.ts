export interface Anomaly {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  status: 'reported' | 'in_progress' | 'resolved'
  createdAt: string
}

export interface CreateAnomalyDTO {
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

// Renomeado para evitar conflito com o componente
export interface AnomalyStatsType {
  total: number
  open: number
  resolved: number
  critical: number
}
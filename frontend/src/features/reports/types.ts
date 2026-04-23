export interface SystemStats {
  totalEquipments: number
  totalAnomalies: number
  resolvedAnomalies: number
  maintenanceAnomalies: number
  borrowedEquipments: number
}

export interface SeverityStats {
  low: number
  medium: number
  high: number
}

export interface StatusStats {
  reported: number
  in_progress: number
  resolved: number
}

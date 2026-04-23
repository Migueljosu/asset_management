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
  under_review: number
  in_maintenance: number
  resolved: number
}
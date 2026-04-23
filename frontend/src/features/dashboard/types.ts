// features/dashboard/types.ts

export interface DashboardStats {
  totalEquipments: number

  byStatus: {
    disponivel: number
    reservado: number
    em_uso: number
    manutencao: number
    inativo: number
  }

  totalAnomalies: number
  activeUsers: number
  performance: number

  monthlyData: {
    month: string
    value: number
  }[]
}
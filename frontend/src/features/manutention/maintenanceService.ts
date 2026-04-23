import { CreateMaintenanceDTO, Maintenance } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type ApiMaintenance = {
  id: number
  equipmentId: number
  tecnicoId: number
  tipo: string
  descricao: string
  dataInicio: string
  dataFim?: string | null
  estado: 'em_andamento' | 'concluida'
  createdAt: string
  equipment?: {
    nome: string
  }
  tecnico?: {
    nome: string
  }
}

function getToken(token?: string) {
  return token || localStorage.getItem('token') || ''
}

async function handleResponse(res: Response) {
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Erro na requisição')
  }

  return data
}

function mapStatus(status: ApiMaintenance['estado']): Maintenance['status'] {
  return status === 'em_andamento' ? 'in_progress' : 'completed'
}

function mapMaintenance(item: ApiMaintenance): Maintenance {
  return {
    id: item.id,
    equipmentId: item.equipmentId,
    equipmentName: item.equipment?.nome || `#${item.equipmentId}`,
    description: item.descricao,
    type: item.tipo,
    status: mapStatus(item.estado),
    startDate: item.dataInicio,
    endDate: item.dataFim || undefined,
    technicianId: item.tecnicoId,
    technicianName: item.tecnico?.nome || `#${item.tecnicoId}`,
    createdAt: item.createdAt,
  }
}

export const maintenanceService = {
  async getAll(token?: string): Promise<Maintenance[]> {
    const authToken = getToken(token)
    const res = await fetch(`${API_URL}/api/maintenance`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })

    const data = await handleResponse(res)
    return data.data.map(mapMaintenance)
  },

  async create(data: CreateMaintenanceDTO, token?: string): Promise<Maintenance> {
    const authToken = getToken(token)
    const res = await fetch(`${API_URL}/api/maintenance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        equipmentId: data.equipmentId,
        tipo: data.type,
        descricao: data.description,
      }),
    })

    const response = await handleResponse(res)
    return mapMaintenance(response.data)
  },

  async finish(id: number, token?: string): Promise<void> {
    const authToken = getToken(token)
    const res = await fetch(`${API_URL}/api/maintenance/${id}/finish`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authToken}` },
    })

    await handleResponse(res)
  },

  async cancel(id: number, token?: string): Promise<void> {
    const authToken = getToken(token)
    const res = await fetch(`${API_URL}/api/maintenance/${id}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authToken}` },
    })

    await handleResponse(res)
  },
}

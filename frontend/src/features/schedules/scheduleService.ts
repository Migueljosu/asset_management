import { CreateScheduleDTO, Schedule } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type ApiSchedule = {
  id: number
  userId: number
  equipmentId: number
  setorDestinoId: number
  dataInicio: string
  dataFim: string
  estado: 'pendente' | 'aprovado' | 'cancelado' | 'concluido'
  createdAt?: string
  user?: { nome: string }
  equipment?: { nome: string }
  setorDestino?: { nome: string }
}

function mapStatus(status: ApiSchedule['estado']): Schedule['status'] {
  if (status === 'pendente') return 'pending'
  if (status === 'aprovado') return 'approved'
  if (status === 'cancelado') return 'cancelled'
  return 'completed'
}

function mapSchedule(item: ApiSchedule): Schedule {
  return {
    id: item.id,
    equipmentId: item.equipmentId,
    equipmentName: item.equipment?.nome || `#${item.equipmentId}`,
    userId: item.userId,
    userName: item.user?.nome || `#${item.userId}`,
    sectorId: item.setorDestinoId,
    sectorName: item.setorDestino?.nome || `#${item.setorDestinoId}`,
    startDate: item.dataInicio,
    endDate: item.dataFim,
    status: mapStatus(item.estado),
    createdAt: item.createdAt,
  }
}

async function handleResponse(res: Response) {
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Erro na requisição')
  }

  return data
}

export const scheduleService = {
  async getAll(token: string): Promise<Schedule[]> {
    const res = await fetch(`${API_URL}/api/schedules`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await handleResponse(res)
    return data.data.map(mapSchedule)
  },

  async create(token: string, payload: CreateScheduleDTO): Promise<Schedule> {
    const res = await fetch(`${API_URL}/api/schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        equipmentId: payload.equipmentId,
        setorDestinoId: payload.sectorId,
        dataInicio: payload.startDate,
        dataFim: payload.endDate,
      }),
    })

    const data = await handleResponse(res)
    return mapSchedule(data.data)
  },

  async approve(token: string, id: number): Promise<Schedule> {
    const res = await fetch(`${API_URL}/api/schedules/${id}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await handleResponse(res)
    return mapSchedule(data.data)
  },

  async cancel(token: string, id: number): Promise<Schedule> {
    const res = await fetch(`${API_URL}/api/schedules/${id}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await handleResponse(res)
    return mapSchedule(data.data)
  },

  async complete(token: string, id: number): Promise<Schedule> {
    const res = await fetch(`${API_URL}/api/schedules/${id}/complete`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await handleResponse(res)
    return mapSchedule(data.data)
  },
}

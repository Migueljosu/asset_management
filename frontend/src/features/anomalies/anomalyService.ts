import { Anomaly, CreateAnomalyDTO, UpdateAnomalyDTO } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type ApiAnomaly = {
  id: number
  equipmentId: number
  titulo: string
  descricao: string
  severidade: 'baixa' | 'media' | 'alta'
  estado: 'reportada' | 'em_analise' | 'resolvida'
  createdAt: string
  user?: {
    nome: string
  }
  equipment?: {
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

function mapSeverity(severity: ApiAnomaly['severidade']): Anomaly['severity'] {
  if (severity === 'baixa') return 'low'
  if (severity === 'media') return 'medium'
  return 'high'
}

function mapStatus(status: ApiAnomaly['estado']): Anomaly['status'] {
  if (status === 'reportada') return 'reported'
  if (status === 'em_analise') return 'in_progress'
  return 'resolved'
}

function mapSeverityToApi(severity: Anomaly['severity']) {
  if (severity === 'low') return 'baixa'
  if (severity === 'medium') return 'media'
  return 'alta'
}

function mapStatusToApi(status: Anomaly['status']) {
  if (status === 'reported') return 'reportada'
  if (status === 'in_progress') return 'em_analise'
  return 'resolvida'
}

function mapAnomaly(anomaly: ApiAnomaly): Anomaly {
  return {
    id: anomaly.id,
    equipmentId: anomaly.equipmentId,
    title: anomaly.titulo,
    description: anomaly.descricao,
    severity: mapSeverity(anomaly.severidade),
    status: mapStatus(anomaly.estado),
    createdAt: anomaly.createdAt,
    reportedBy: anomaly.user?.nome,
    equipmentName: anomaly.equipment?.nome,
  }
}

export async function fetchAnomalies(token?: string): Promise<Anomaly[]> {
  const authToken = getToken(token)
  const res = await fetch(`${API_URL}/api/anomalies`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })

  const data = await handleResponse(res)
  return data.data.map(mapAnomaly)
}

export const anomalyService = {
  async getAll(token?: string): Promise<Anomaly[]> {
    return fetchAnomalies(token)
  },

  async create(data: CreateAnomalyDTO, token?: string): Promise<Anomaly> {
    const authToken = getToken(token)
    const res = await fetch(`${API_URL}/api/anomalies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        equipmentId: data.equipmentId,
        titulo: data.title,
        descricao: data.description,
        severidade: mapSeverityToApi(data.severity),
      }),
    })

    const response = await handleResponse(res)
    return mapAnomaly(response.data)
  },

  async update(id: number, data: UpdateAnomalyDTO, token?: string): Promise<Anomaly> {
    const authToken = getToken(token)
    const body: Record<string, unknown> = {}

    if (data.title) body.titulo = data.title
    if (data.description) body.descricao = data.description
    if (data.severity) body.severidade = mapSeverityToApi(data.severity)
    if (data.status) body.estado = mapStatusToApi(data.status)

    const res = await fetch(`${API_URL}/api/anomalies/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    })

    const response = await handleResponse(res)
    return mapAnomaly(response.data)
  },

  async updateStatus(id: number, status: Anomaly['status'], token?: string): Promise<Anomaly> {
    return this.update(id, { status }, token)
  },

  async markAsResolved(id: number, token?: string): Promise<Anomaly> {
    const authToken = getToken(token)
    const res = await fetch(`${API_URL}/api/anomalies/${id}/resolve`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    const response = await handleResponse(res)
    return mapAnomaly(response.data)
  },

  async delete(id: number, token?: string): Promise<void> {
    const authToken = getToken(token)
    const res = await fetch(`${API_URL}/api/anomalies/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    await handleResponse(res)
  },

  async getById(id: number, token?: string): Promise<Anomaly> {
    const authToken = getToken(token)
    const res = await fetch(`${API_URL}/api/anomalies/${id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })

    const data = await handleResponse(res)
    return mapAnomaly(data.data)
  },
}

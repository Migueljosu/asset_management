import { CreateSectorDTO, Sector } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function handleResponse(res: Response) {
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Erro na requisição')
  }

  return data
}

export const sectorService = {
  async getAll(token: string): Promise<Sector[]> {
    const res = await fetch(`${API_URL}/api/sectors`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await handleResponse(res)
    return data.data
  },

  async create(token: string, payload: CreateSectorDTO): Promise<Sector> {
    const res = await fetch(`${API_URL}/api/sectors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await handleResponse(res)
    return data.data
  },

  async update(token: string, id: number, payload: CreateSectorDTO): Promise<Sector> {
    const res = await fetch(`${API_URL}/api/sectors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await handleResponse(res)
    return data.data
  },

  async delete(token: string, id: number): Promise<void> {
    const res = await fetch(`${API_URL}/api/sectors/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    await handleResponse(res)
  },
}

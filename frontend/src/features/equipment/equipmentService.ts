//src/feature/equipament/EquipamentService.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function handleResponse(res: Response) {
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Erro na requisição')
  }

  return data
}

export const equipmentService = {
  async getAll(token: string) {
    const res = await fetch(`${API_URL}/api/equipment`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await handleResponse(res)
    return data.data
  },

  async create(token: string, payload: any) {
    const res = await fetch(`${API_URL}/api/equipment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    return handleResponse(res)
  },

  async update(token: string, id: number, payload: any) {
    const res = await fetch(`${API_URL}/api/equipment/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    return handleResponse(res)
  },

  async delete(token: string, id: number) {
    const res = await fetch(`${API_URL}/api/equipment/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return handleResponse(res)
  },
}

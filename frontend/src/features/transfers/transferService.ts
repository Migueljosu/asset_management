import { CreateTransferDTO, TransferItem, TransferableEquipment } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function handleResponse(res: Response) {
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Erro na requisição')
  }

  return data
}

function mapTransfer(item: any): TransferItem {
  return {
    id: item.id,
    equipmentId: item.equipmentId,
    equipmentName: item.equipment?.nome || `#${item.equipmentId}`,
    originSectorId: item.setorOrigemId,
    originSectorName: item.setorOrigem?.nome || `#${item.setorOrigemId}`,
    destinationSectorId: item.setorDestinoId,
    destinationSectorName: item.setorDestino?.nome || `#${item.setorDestinoId}`,
    transferredAt: item.dataTransferencia,
  }
}

export const transferService = {
  async getAll(token: string): Promise<TransferItem[]> {
    const res = await fetch(`${API_URL}/api/transfers`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await handleResponse(res)
    return data.data.map(mapTransfer)
  },

  async getTransferableEquipments(token: string): Promise<TransferableEquipment[]> {
    const res = await fetch(`${API_URL}/api/transfers/available/equipment`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await handleResponse(res)
    return data.data
  },

  async create(token: string, payload: CreateTransferDTO): Promise<TransferItem> {
    const res = await fetch(`${API_URL}/api/transfers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        equipmentId: payload.equipmentId,
        setorDestinoId: payload.destinationSectorId,
      }),
    })

    const data = await handleResponse(res)
    return mapTransfer(data.data)
  },
}

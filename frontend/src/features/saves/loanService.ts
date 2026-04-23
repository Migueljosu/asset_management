import { CreateLoanDTO, Loan } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type ApiLoan = {
  id: number
  userId: number
  equipmentId: number
  setorDestinoId: number
  dataSaida: string
  dataPrevista: string
  dataDevolucao?: string | null
  estado: 'ativo' | 'devolvido' | 'atrasado'
  user?: { nome: string }
  equipment?: { nome: string }
  setorDestino?: { nome: string }
}

function mapLoan(item: ApiLoan): Loan {
  return {
    id: item.id,
    userId: item.userId,
    userName: item.user?.nome || `#${item.userId}`,
    equipmentId: item.equipmentId,
    equipmentName: item.equipment?.nome || `#${item.equipmentId}`,
    sectorId: item.setorDestinoId,
    sectorName: item.setorDestino?.nome || `#${item.setorDestinoId}`,
    startDate: item.dataSaida,
    dueDate: item.dataPrevista,
    returnDate: item.dataDevolucao || undefined,
    status: item.estado === 'devolvido' ? 'RETURNED' : 'ACTIVE',
  }
}

async function handleResponse(res: Response) {
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Erro na requisição')
  }

  return data
}

export async function getLoans(token: string): Promise<Loan[]> {
  const res = await fetch(`${API_URL}/api/loans`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await handleResponse(res)
  return data.data.map(mapLoan)
}

export async function createLoan(token: string, payload: CreateLoanDTO): Promise<Loan> {
  const res = await fetch(`${API_URL}/api/loans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      equipmentId: payload.equipmentId,
      setorDestinoId: payload.sectorId,
      dataPrevista: payload.dueDate,
    }),
  })

  const data = await handleResponse(res)
  return mapLoan(data.data)
}

export async function returnLoan(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/loans/return`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ loanId: id }),
  })

  await handleResponse(res)
}

export async function deleteLoan(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/loans/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  await handleResponse(res)
}

export const loanService = {
  getLoans,
  createLoan,
  returnLoan,
  deleteLoan,
}

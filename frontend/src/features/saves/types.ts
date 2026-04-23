export type LoanStatus = 'ACTIVE' | 'RETURNED'

export interface Loan {
  id: number
  userId: number
  userName: string
  equipmentId: number
  equipmentName: string
  sectorId: number
  sectorName: string
  startDate: string
  dueDate: string
  returnDate?: string
  status: LoanStatus
}

export interface CreateLoanDTO {
  equipmentId: number
  sectorId: number
  dueDate: string
}

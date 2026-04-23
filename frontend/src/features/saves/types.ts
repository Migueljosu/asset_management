export type LoanStatus = 'ACTIVE' | 'OVERDUE' | 'RETURNED'

export interface Loan {
  id: string
  userId: number
  userName: string
  equipmentId: string
  equipmentName: string
  destination: string //  novo
  startDate: string
  dueDate: string
  returnDate?: string
  status: LoanStatus
}
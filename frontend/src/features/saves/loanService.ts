import { Loan } from './types'

let loans: Loan[] = []

function calculateStatus(loan: Loan): Loan {
  if (loan.returnDate) {
    return { ...loan, status: 'RETURNED' }
  }

  if (new Date() > new Date(loan.dueDate)) {
    return { ...loan, status: 'OVERDUE' }
  }

  return { ...loan, status: 'ACTIVE' }
}

function refreshLoans() {
  loans = loans.map(calculateStatus)
}

export async function getLoans(): Promise<Loan[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      refreshLoans()
      resolve([...loans])
    }, 400)
  })
}

export async function createLoan(
  data: Omit<Loan, 'id' | 'status'>
): Promise<Loan> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {

      const alreadyLoaned = loans.find(
        (l) =>
          l.equipmentId === data.equipmentId &&
          !l.returnDate
      )

      if (alreadyLoaned) {
        reject(new Error('Equipamento já está emprestado'))
        return
      }

      const newLoan: Loan = {
        ...data,
        id: crypto.randomUUID(),
        status: 'ACTIVE',
      }

      loans.push(newLoan)

      resolve(newLoan)
    }, 400)
  })
}

export async function returnLoan(id: string): Promise<Loan> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {

      const index = loans.findIndex((l) => l.id === id)

      if (index === -1) {
        reject(new Error('Empréstimo não encontrado'))
        return
      }

      loans[index] = {
        ...loans[index],
        returnDate: new Date().toISOString(),
      }

      const updated = calculateStatus(loans[index])
      loans[index] = updated

      resolve(updated)
    }, 400)
  })
}

export async function deleteLoan(id: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      loans = loans.filter((l) => l.id !== id)
      resolve()
    }, 400)
  })
}

export const loanService = {
  getLoans,
  createLoan,
  returnLoan,
  deleteLoan,
}
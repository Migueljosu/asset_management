import { useEffect, useState } from 'react'
import { Loan } from './types'
import { getLoans, returnLoan, deleteLoan } from './loanService'
import LoanForm from './LoanForm'
import LoanList from './LoanList'
import BackToHome from '@/components/ui/BackToHome'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const { token } = useAuth()

  useEffect(() => {
    loadLoans()
  }, [token])

  async function loadLoans() {
    if (!token) return

    const data = await getLoans(token)
    setLoans(data)
  }

  const handleCreate = (loan: Loan) => {
    setLoans((prev) => [...prev, loan])
  }

  const handleReturn = async (id: number) => {
    if (!token) return

    try {
      await returnLoan(token, id)
      toast.success('Equipamento devolvido')
      await loadLoans()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (id: number) => {
    if (!token) return

    try {
      await deleteLoan(token, id)
      toast.success('Empréstimo excluído')
      await loadLoans()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="space-y-8">

      <div className="flex justify-between items-center">
        
        <div className="text-right">
          <h1 className="text-3xl font-bold">Empréstimos</h1>
          <p className="text-muted-foreground">
            Gestão de empréstimos
          </p>
        </div>
      </div>

      <LoanForm onCreated={handleCreate} />

      <LoanList
        loans={loans}
        onReturn={handleReturn}
        onDelete={handleDelete}
      />

    </div>
  )
}

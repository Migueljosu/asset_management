import { useEffect, useState } from 'react'
import { Loan } from './types'
import { getLoans, returnLoan, deleteLoan } from './loanService'
import LoanForm from './LoanForm'
import LoanList from './LoanList'
import BackToHome from '@/components/ui/BackToHome'
import { useToast } from '@/hooks/use-toast'

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadLoans()
  }, [])

  async function loadLoans() {
    const data = await getLoans()
    setLoans(data)
  }

  const handleCreate = (loan: Loan) => {
    setLoans((prev) => [...prev, loan])
  }

  const handleReturn = async (id: string) => {
    try {
      const updated = await returnLoan(id)

      setLoans((prev) =>
        prev.map((l) => (l.id === id ? updated : l))
      )

      toast({
        title: 'Sucesso',
        description: 'Equipamento devolvido',
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err.message,
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteLoan(id)

      setLoans((prev) => prev.filter((l) => l.id !== id))

      toast({
        title: 'Removido',
        description: 'Empréstimo excluído',
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err.message,
      })
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
import { useState } from 'react'
import { Loan } from './types'
import { Button } from '@/components/ui/Button'

interface Props {
  loans: Loan[]
  onReturn: (id: string) => void
  onDelete: (id: string) => void
}

export default function LoanList({ loans, onReturn, onDelete }: Props) {

  const [search, setSearch] = useState('')

  const filtered = loans.filter((l) =>
    l.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
    l.userName.toLowerCase().includes(search.toLowerCase()) ||
    l.destination.toLowerCase().includes(search.toLowerCase()) ||
    l.status.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">

      <input
        placeholder="Pesquisar..."
        className="border p-2 rounded w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.map((loan) => (

        <div key={loan.id} className="flex justify-between items-center p-4 border rounded bg-card">

          <div>
            <p className="font-semibold">
              {loan.userName} → {loan.equipmentName}
            </p>

            <p className="text-sm text-muted-foreground">
              Destino: {loan.destination}
            </p>

            <p className={
              loan.status === 'OVERDUE'
                ? 'text-red-500'
                : loan.status === 'RETURNED'
                ? 'text-green-500'
                : 'text-blue-500'
            }>
              {loan.status}
            </p>
          </div>

          <div className="flex gap-2">

            {loan.status !== 'RETURNED' && (
              <Button onClick={() => onReturn(loan.id)}>
                Devolver
              </Button>
            )}

            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('Tem certeza?')) {
                  onDelete(loan.id)
                }
              }}
            >
              Excluir
            </Button>

          </div>

        </div>

      ))}

    </div>
  )
}
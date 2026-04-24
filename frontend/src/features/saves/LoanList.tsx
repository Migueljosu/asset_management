import { useState } from 'react'
import { Loan } from './types'
import { Button } from '@/components/ui/Button'
import { usePagination } from '@/hooks/usePagination'
import Pagination from '@/components/ui/Pagination'
import { Package, User, Building2, RotateCcw, Trash2, CheckCircle2 } from 'lucide-react'

interface Props {
  loans: Loan[]
  onReturn: (id: number) => void
  onDelete: (id: number) => void
}

export default function LoanList({ loans, onReturn, onDelete }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    goToPrevious,
    goToNext,
  } = usePagination<Loan>({
    data: loans,
    itemsPerPage: 5,
    searchFields: ['equipmentName', 'userName', 'sectorName'],
    searchValue: search,
    filterFn: (l) => {
      if (statusFilter === 'ALL') return true
      return l.status === statusFilter
    },
  })

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    ACTIVE: { label: 'Ativo', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Package },
    RETURNED: { label: 'Devolvido', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  }

  return (
    <div className="space-y-4">
      {/* 🔍 Filtros avançados */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Pesquisar por equipamento, utilizador ou setor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] border rounded-md px-3 py-2 text-sm bg-background"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-background"
          aria-label="Filtrar por estado"
        >
          <option value="ALL">Todos os estados</option>
          <option value="ACTIVE">Ativo</option>
          <option value="RETURNED">Devolvido</option>
        </select>
      </div>

      {totalItems === 0 ? (
        <div className="text-center py-8 text-muted-foreground bg-card rounded-lg border border-border">
          Nenhum empréstimo encontrado.
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedData.map((loan) => {
              const stat = statusConfig[loan.status] || statusConfig.ACTIVE
              const StatusIcon = stat.icon

              return (
                <div
                  key={loan.id}
                  className="flex justify-between items-center p-4 border rounded-lg bg-card hover:shadow-md transition"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold flex items-center gap-1">
                        <User size={14} />
                        {loan.userName}
                      </p>
                      <span className="text-muted-foreground">→</span>
                      <p className="font-semibold flex items-center gap-1">
                        <Package size={14} />
                        {loan.equipmentName}
                      </p>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${stat.color}`}>
                        <StatusIcon size={12} />
                        {stat.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 size={12} />
                        {loan.sectorName}
                      </span>
                      {loan.startDate && (
                        <span>Saída: {new Date(loan.startDate).toLocaleDateString()}</span>
                      )}
                      {loan.dueDate && (
                        <span>Previsão: {new Date(loan.dueDate).toLocaleDateString()}</span>
                      )}
                      {loan.returnDate && (
                        <span>Devolvido: {new Date(loan.returnDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {loan.status !== 'RETURNED' && (
                      <Button size="sm" onClick={() => onReturn(loan.id)} className="flex items-center gap-1">
                        <RotateCcw size={14} />
                        Devolver
                      </Button>
                    )}

                    {loan.status === 'RETURNED' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir este empréstimo?')) {
                            onDelete(loan.id)
                          }
                        }}
                        className="flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        Excluir
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            startItem={startItem}
            endItem={endItem}
            onPrevious={goToPrevious}
            onNext={goToNext}
          />
        </>
      )}
    </div>
  )
}


import { useState } from 'react'
import { Schedule } from './types'
import { toast } from 'sonner'
import { usePagination } from '@/hooks/usePagination'
import Pagination from '@/components/ui/Pagination'
import { Calendar, Clock, User, Building2, CheckCircle2, XCircle, Hourglass } from 'lucide-react'

interface Props {
  schedules: Schedule[]
  title: string
  emptyMessage: string
  onApprove?: (id: number) => Promise<void> | void
  onComplete?: (id: number) => Promise<void> | void
  onCancel?: (id: number) => Promise<void> | void
  showUser?: boolean
  userRole?: string
}

export default function ScheduleList({
  schedules,
  title,
  emptyMessage,
  onApprove,
  onComplete,
  onCancel,
  showUser = false,
  userRole,
}: Props) {
  const [search, setSearch] = useState('')

  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    goToPrevious,
    goToNext,
  } = usePagination<Schedule>({
    data: schedules,
    itemsPerPage: 5,
    searchFields: ['equipmentName', 'sectorName', 'userName'],
    searchValue: search,
  })

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Hourglass },
    approved: { label: 'Aprovado', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
    completed: { label: 'Concluído', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2 },
  }

  const canCancel = (status: string): boolean => {
    if (status === 'pending') return true
    if (status === 'approved' && userRole === 'admin') return true
    return false
  }

  return (
    <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className="text-sm text-muted-foreground">{totalItems} agendamento(s)</span>
      </div>

      {schedules.length > 0 && (
        <input
          type="text"
          placeholder="Pesquisar por equipamento, setor ou funcionário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm bg-background"
        />
      )}

      {totalItems === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">{emptyMessage}</p>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedData.map((schedule) => {
              const canComplete = new Date(schedule.endDate) <= new Date()
              const stat = statusConfig[schedule.status] || statusConfig.pending
              const StatusIcon = stat.icon

              return (
                <div
                  key={schedule.id}
                  className="flex justify-between items-start gap-4 p-4 border rounded-lg hover:shadow-md transition bg-background"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{schedule.equipmentName}</p>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${stat.color}`}>
                        <StatusIcon size={12} />
                        {stat.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {showUser && (
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {schedule.userName}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Building2 size={12} />
                        {schedule.sectorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(schedule.startDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(schedule.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[80px]">
                    {onApprove && schedule.status === 'pending' && (
                      <button
                        onClick={() => onApprove(schedule.id)}
                        className="text-emerald-600 hover:text-emerald-800 font-medium text-sm text-right"
                      >
                        Aprovar
                      </button>
                    )}

                    {onComplete && schedule.status === 'approved' && (
                      <button
                        onClick={() => onComplete(schedule.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm text-right"
                        disabled={!canComplete}
                        title={!canComplete ? "Só pode concluir depois da data de fim" : ""}
                      >
                        Concluir
                      </button>
                    )}

                    {onCancel && canCancel(schedule.status) && (
                      <button
                        onClick={() =>
                          toast('Cancelar agendamento?', {
                            description: `O agendamento de ${schedule.equipmentName} será cancelado.`,
                            action: {
                              label: 'Confirmar',
                              onClick: () => onCancel(schedule.id),
                            },
                            cancel: {
                              label: 'Cancelar',
                              onClick: () => toast('Ação cancelada'),
                            },
                          })
                        }
                        className="text-red-600 hover:text-red-800 font-medium text-sm text-right"
                      >
                        Cancelar
                      </button>
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

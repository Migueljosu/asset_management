import { Schedule } from './types'
import { toast } from 'sonner'

interface Props {
  schedules: Schedule[]
  title: string
  emptyMessage: string
  onApprove?: (id: number) => Promise<void> | void
  onComplete?: (id: number) => Promise<void> | void
  onCancel?: (id: number) => Promise<void> | void
  showUser?: boolean
}

export default function ScheduleList({
  schedules,
  title,
  emptyMessage,
  onApprove,
  onComplete,
  onCancel,
  showUser = false,
}: Props) {
  return (
    <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>

      {schedules.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        schedules.map((schedule) => {
          const canComplete = new Date(schedule.endDate) <= new Date()

          return (
            <div
              key={schedule.id}
              className="flex justify-between items-start gap-4 p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <p className="font-semibold">{schedule.equipmentName}</p>
                {showUser && <p className="text-sm text-muted-foreground">Funcionário: {schedule.userName}</p>}
                <p className="text-sm text-muted-foreground">Setor: {schedule.sectorName}</p>
                <p className="text-sm text-muted-foreground">
                  Início: {new Date(schedule.startDate).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Fim: {new Date(schedule.endDate).toLocaleString()}
                </p>
                <p className="text-xs capitalize">{schedule.status}</p>
              </div>

              <div className="flex gap-3">
                {onApprove && schedule.status === 'pending' && (
                  <button
                    onClick={() => onApprove(schedule.id)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Aprovar
                  </button>
                )}

                {onComplete && schedule.status === 'approved' && (
                  <button
                    onClick={() => onComplete(schedule.id)}
                    className="text-green-600 hover:text-green-800 font-medium"
                    disabled={!canComplete}
                    title={!canComplete ? 'Só pode concluir depois da data de fim' : ''}
                  >
                    Concluir
                  </button>
                )}

                {onCancel && ['pending', 'approved'].includes(schedule.status) && (
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
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

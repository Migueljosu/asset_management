import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { equipmentService } from '../equipment/equipmentService'
import { sectorService } from '../sectors/sectorService'
import { Equipment } from '../equipment/types'
import { Sector } from '../sectors/types'
import { CreateScheduleDTO, Schedule } from './types'
import { scheduleService } from './scheduleService'
import ScheduleForm from './ScheduleForm'
import ScheduleList from './ScheduleList'

export default function SchedulesPage() {
  const { token, user } = useAuth()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [sectors, setSectors] = useState<Sector[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [token])

  async function loadData() {
    if (!token) return

    setLoading(true)
    try {
      const [scheduleData, equipmentData] = await Promise.all([
        scheduleService.getAll(token),
        equipmentService.getAll(token),
      ])

      setSchedules(scheduleData)
      setEquipments(equipmentData)

      if (user?.role === 'admin') {
        const sectorData = await sectorService.getAll(token)
        setSectors(sectorData)
      } else if (user?.role === 'funcionario') {
        const sectorData = await sectorService.getAll(token)
        setSectors(sectorData)
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(data: CreateScheduleDTO) {
    if (!token) return

    setSubmitting(true)
    try {
      await scheduleService.create(token, data)
      toast.success('Agendamento criado com sucesso')
      await loadData()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar agendamento')
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  async function handleApprove(id: number) {
    if (!token) return

    try {
      await scheduleService.approve(token, id)
      toast.success('Agendamento aprovado com sucesso')
      await loadData()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao aprovar agendamento')
    }
  }

  async function handleCancel(id: number) {
    if (!token) return

    try {
      await scheduleService.cancel(token, id)
      toast.success('Agendamento cancelado com sucesso')
      await loadData()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cancelar agendamento')
    }
  }

  async function handleComplete(id: number) {
    if (!token) return

    try {
      await scheduleService.complete(token, id)
      toast.success('Agendamento concluído com sucesso')
      await loadData()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao concluir agendamento')
    }
  }

  const pendingSchedules = useMemo(
    () => schedules.filter((schedule) => schedule.status === 'pending'),
    [schedules]
  )

  const approvedSchedules = useMemo(
    () => schedules.filter((schedule) => schedule.status === 'approved'),
    [schedules]
  )

  const otherSchedules = useMemo(
    () => schedules.filter((schedule) => ['cancelled', 'completed'].includes(schedule.status)),
    [schedules]
  )

  if (loading) {
    return <div className="text-center py-10">A carregar agendamentos...</div>
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Agendamentos</h1>
        <p className="text-muted-foreground">Gestão de schedules e reservas por período</p>
      </div>

      <ScheduleForm
        equipments={equipments}
        sectors={sectors}
        schedules={schedules}
        onSubmit={handleCreate}
        loading={submitting}
      />

      {isAdmin ? (
        <div className="space-y-6">
          <ScheduleList
            schedules={pendingSchedules}
            title="Agendamentos Pendentes"
            emptyMessage="Não existem agendamentos pendentes."
            onApprove={handleApprove}
            showUser
          />

          <ScheduleList
            schedules={approvedSchedules}
            title="Agendamentos Aprovados"
            emptyMessage="Não existem agendamentos aprovados."
            onComplete={handleComplete}
            showUser
          />

          <ScheduleList
            schedules={otherSchedules}
            title="Histórico"
            emptyMessage="Sem histórico de agendamentos."
            showUser
          />
        </div>
      ) : (
        <ScheduleList
          schedules={schedules}
          title="Os Meus Agendamentos"
          emptyMessage="Ainda não criou nenhum agendamento."
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}

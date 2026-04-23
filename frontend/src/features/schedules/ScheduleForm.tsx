import { useEffect, useMemo, useState } from 'react'
import { CreateScheduleDTO, Schedule } from './types'
import { Sector } from '../sectors/types'
import { Equipment } from '../equipment/types'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/Button'

interface Props {
  equipments: Equipment[]
  sectors: Sector[]
  schedules: Schedule[]
  onSubmit: (data: CreateScheduleDTO) => Promise<void>
  loading?: boolean
}

export default function ScheduleForm({
  equipments,
  sectors,
  schedules,
  onSubmit,
  loading = false,
}: Props) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [equipmentId, setEquipmentId] = useState('')
  const [sectorId, setSectorId] = useState('')

  useEffect(() => {
    setEquipmentId('')
  }, [startDate, endDate])

  const availableEquipments = useMemo(() => {
    if (!startDate || !endDate) return []
    if (new Date(endDate) <= new Date(startDate)) return []

    return equipments.filter((equipment) => {
      if (equipment.estado !== 'disponivel') return false

      const hasConflict = schedules.some((schedule) => {
        if (schedule.equipmentId !== equipment.id) return false
        if (!['pending', 'approved'].includes(schedule.status)) return false

        return new Date(schedule.startDate) < new Date(endDate) &&
          new Date(schedule.endDate) > new Date(startDate)
      })

      return !hasConflict
    })
  }, [equipments, schedules, startDate, endDate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!startDate || !endDate) {
      toast.error('Selecione a data de início e a data de fim')
      return
    }

    if (new Date(endDate) <= new Date(startDate)) {
      toast.error('A data de fim deve ser maior que a data de início')
      return
    }

    if (!equipmentId || !sectorId) {
      toast.error('Selecione o equipamento e o setor de destino')
      return
    }

    await onSubmit({
      equipmentId: Number(equipmentId),
      sectorId: Number(sectorId),
      startDate,
      endDate,
    })

    setStartDate('')
    setEndDate('')
    setEquipmentId('')
    setSectorId('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-4"
    >
      <h2 className="text-xl font-semibold">Criar Agendamento</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      <select
        value={equipmentId}
        onChange={(e) => setEquipmentId(e.target.value)}
        className="w-full border rounded px-3 py-2"
        disabled={!startDate || !endDate || availableEquipments.length === 0}
      >
        <option value="">Selecione um equipamento disponível</option>
        {availableEquipments.map((equipment) => (
          <option key={equipment.id} value={equipment.id}>
            {equipment.nome}
          </option>
        ))}
      </select>

      <select
        value={sectorId}
        onChange={(e) => setSectorId(e.target.value)}
        className="w-full border rounded px-3 py-2"
        disabled={!equipmentId}
      >
        <option value="">Selecione o setor de destino</option>
        {sectors.map((sector) => (
          <option key={sector.id} value={sector.id}>
            {sector.nome}
          </option>
        ))}
      </select>

      {startDate && endDate && availableEquipments.length === 0 && (
        <p className="text-sm text-amber-600">
          Não há equipamentos disponíveis para esse período.
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? 'A guardar...' : 'Criar Agendamento'}
      </Button>
    </form>
  )
}

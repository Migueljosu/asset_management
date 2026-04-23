import { useEffect, useMemo, useState } from 'react'
import { equipmentService } from '../equipment/equipmentService'
import { maintenanceService } from './maintenanceService'
import { Equipment } from '../equipment/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { fetchAnomalies } from '../anomalies/anomalyService'
import { Anomaly } from '../anomalies/types'

interface Props {
  onSuccess?: () => void
}

export default function MaintenanceForm({ onSuccess }: Props) {
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [equipmentId, setEquipmentId] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('')
  const [loading, setLoading] = useState(false)

  const { token } = useAuth()

  useEffect(() => {
    loadData()
  }, [token])

  async function loadData() {
    if (!token) return

    try {
      const [equipmentData, anomalyData] = await Promise.all([
        equipmentService.getAll(token),
        fetchAnomalies(token),
      ])

      const availableEquipments = equipmentData.filter(
        (equipment) => equipment.estado !== 'em_uso' && equipment.estado !== 'manutencao'
      )

      setEquipments(availableEquipments)
      setAnomalies(anomalyData)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar dados de manutenção')
    }
  }

  const anomalyCountByEquipment = useMemo(() => {
    return anomalies.reduce<Record<number, number>>((acc, anomaly) => {
      if (anomaly.status === 'resolved') return acc
      acc[anomaly.equipmentId] = (acc[anomaly.equipmentId] || 0) + 1
      return acc
    }, {})
  }, [anomalies])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!equipmentId || !description.trim() || !type.trim()) {
      toast.error('Preencha todos os campos.')
      return
    }

    if (!token) return

    try {
      setLoading(true)

      await maintenanceService.create(
        {
          equipmentId: Number(equipmentId),
          description: description.trim(),
          type: type.trim(),
        },
        token
      )

      toast.success('Manutenção criada com sucesso.')
      setEquipmentId('')
      setDescription('')
      setType('')
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar manutenção.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-4"
    >
      <h2 className="text-xl font-semibold">Criar Nova Manutenção</h2>

      <div className="space-y-2">
        <label className="text-sm font-medium">Equipamento</label>

        <Select onValueChange={setEquipmentId} value={equipmentId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um equipamento" />
          </SelectTrigger>
          <SelectContent>
            {equipments.map((equipment) => {
              const activeAnomalies = anomalyCountByEquipment[equipment.id] || 0
              const label =
                activeAnomalies > 0
                  ? `${equipment.nome} (${activeAnomalies} anomalia(s) aberta(s))`
                  : equipment.nome

              return (
                <SelectItem key={equipment.id} value={String(equipment.id)}>
                  {label}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tipo</label>
        <Input
          placeholder="Ex: Preventiva, Corretiva"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Descrição</label>
        <Input
          placeholder="Descreva o problema..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Criando...' : 'Criar Manutenção'}
      </Button>
    </form>
  )
}

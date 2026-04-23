import { useEffect, useState } from 'react'
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
import { useToast } from '@/hooks/use-toast'
import { fakeUser } from '@/utils/fakeAuth'

interface Props {
  onSuccess?: () => void
}

export default function MaintenanceForm({ onSuccess }: Props) {
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [equipmentId, setEquipmentId] = useState('')
  const [description, setDescription] = useState('')
  const [technician, setTechnician] = useState('')
  const [loading, setLoading] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    loadEquipments()
  }, [])

  async function loadEquipments() {
    const data = await equipmentService.getAll()

    // Apenas equipamentos ativos podem entrar em manutenção
    const activeEquipments = data.filter(
      (e) => e.status === 'active'
    )

    setEquipments(activeEquipments)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!equipmentId || !description || !technician) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos.',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)

      await maintenanceService.create({
        equipmentId,
        description,
        technician,
      })

      toast({
        title: 'Sucesso',
        description: 'Manutenção criada com sucesso.',
      })

      setEquipmentId('')
      setDescription('')
      setTechnician('')

      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar manutenção.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // 🔐 Apenas admin pode criar manutenção
  if (fakeUser.role !== 'admin') {
    return (
      <div className="text-red-500 font-medium">
        Apenas administradores podem criar manutenções.
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-4"
    >
      <h2 className="text-xl font-semibold">
        Criar Nova Manutenção
      </h2>

      {/* Equipamento */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Equipamento
        </label>

        <Select onValueChange={setEquipmentId} value={equipmentId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um equipamento" />
          </SelectTrigger>
          <SelectContent>
            {equipments.map((equipment) => (
              <SelectItem key={equipment.id} value={equipment.id}>
                {equipment.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Descrição
        </label>
        <Input
          placeholder="Descreva o problema..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Técnico */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Técnico Responsável
        </label>
        <Input
          placeholder="Nome do técnico"
          value={technician}
          onChange={(e) => setTechnician(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Criando...' : 'Criar Manutenção'}
      </Button>
    </form>
  )
}
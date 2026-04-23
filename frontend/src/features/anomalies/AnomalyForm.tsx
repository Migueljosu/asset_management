import { useEffect, useState } from 'react'
import { equipmentService } from '../equipment/equipmentService'
import { CreateAnomalyDTO, Anomaly } from './types'
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
import { useAppState } from '@/context/AppContext'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

interface Props {
  onSubmit: (data: CreateAnomalyDTO) => Promise<void>
  onSuccess?: () => void
  initialData?: Anomaly | null
  onCancelEdit?: () => void
  loading?: boolean
}

export default function AnomalyForm({
  onSubmit,
  onSuccess,
  initialData,
  onCancelEdit,
  loading = false,
}: Props) {
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [equipmentId, setEquipmentId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('low')

  const { theme } = useAppState()
  const { token } = useAuth()

  useEffect(() => {
    loadEquipments()
  }, [token])

  useEffect(() => {
    if (initialData) {
      setEquipmentId(String(initialData.equipmentId))
      setTitle(initialData.title)
      setDescription(initialData.description)
      setSeverity(initialData.severity)
    } else {
      resetForm()
    }
  }, [initialData])

  async function loadEquipments() {
    if (!token) return

    try {
      const data = await equipmentService.getAll(token)
      setEquipments(data)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar equipamentos')
    }
  }

  function resetForm() {
    setEquipmentId('')
    setTitle('')
    setDescription('')
    setSeverity('low')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!equipmentId || !title.trim() || !description.trim()) {
      toast.error('Preencha todos os campos')
      return
    }

    await onSubmit({
      equipmentId: Number(equipmentId),
      title: title.trim(),
      description: description.trim(),
      severity,
    })

    resetForm()
    onSuccess?.()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`p-6 rounded-xl shadow-lg space-y-6 ${theme === 'dark' ? 'bg-zinc-800 text-zinc-100' : 'bg-white text-zinc-900'}`}
    >
      <div>
        <h2 className="text-xl font-bold">
          {initialData ? 'EDITAR ANOMALIA' : 'REGISTRAR ANOMALIA'}
        </h2>
        <p className="text-sm text-zinc-400">Relatar falha operacional do equipamento</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm">Equipamento</label>
        <Select onValueChange={setEquipmentId} value={equipmentId}>
          <SelectTrigger className="bg-zinc-200 text-zinc-900 border border-zinc-400">
            <SelectValue placeholder="Selecione o equipamento" />
          </SelectTrigger>
          <SelectContent>
            {equipments.map((equipment) => (
              <SelectItem key={equipment.id} value={String(equipment.id)}>
                {equipment.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm">Título</label>
        <Input
          id="title"
          placeholder="Ex: Superaquecimento do motor"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm">Descrição</label>
        <Input
          id="description"
          placeholder="Descreva a falha detectada"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm">Severidade</label>
        <Select
          onValueChange={(value) => setSeverity(value as 'low' | 'medium' | 'high')}
          value={severity}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a severidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="medium">Media</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : initialData ? 'Atualizar Falha' : 'Registrar Falha'}
        </Button>
        {initialData && onCancelEdit && (
          <Button type="button" onClick={onCancelEdit}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}

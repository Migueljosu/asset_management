import { useEffect, useState } from 'react'
import { equipmentService } from '../equipment/equipmentService'
import { anomalyService } from './anomalyService'
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
import { useAppDispatch, useAppState, showNotification } from '@/context/AppContext'
import { fakeUser } from '@/utils/fakeAuth'

interface Props {
  onSuccess?: () => void
}

export default function AnomalyForm({ onSuccess }: Props) {
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [equipmentId, setEquipmentId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('low')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { theme } = useAppState()
  const dispatch = useAppDispatch()

  useEffect(() => {
   // equipmentService.getAll().then(setEquipments)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!equipmentId || !title.trim() || !description.trim()) {
      showNotification(dispatch, 'Preencha todos os campos', 'destructive')
      return
    }
    try {
      setIsSubmitting(true)
      await anomalyService.create({
        //equipmentId,
        title: title.trim(),
        description: description.trim(),
        severity,
        reportedBy: fakeUser.name,
      })
      showNotification(dispatch, 'Anomalia registrada com sucesso', 'success')
      setTitle('')
      setDescription('')
      setEquipmentId('')
      setSeverity('low')
      onSuccess?.()
    } catch {
      showNotification(dispatch, 'Não foi possível registrar a anomalia', 'destructive')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`p-6 rounded-xl shadow-lg space-y-6 ${theme === 'dark' ? 'bg-zinc-800 text-zinc-100' : 'bg-white text-zinc-900'}`}
    >
      <div>
        <h2 className="text-xl font-bold">REGISTRAR ANOMALIA</h2>
        <p className="text-sm text-zinc-400">Relatar falha operacional do equipamento</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="equipment" className="text-sm">Equipamento</label>
        <Select id="equipment" onValueChange={setEquipmentId} value={equipmentId}>
          <SelectTrigger className="bg-zinc-200 text-zinc-900 border border-zinc-400">
            <SelectValue placeholder="Selecione o equipamento" />
          </SelectTrigger>
          <SelectContent>
            {equipments.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
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
        <label htmlFor="severity" className="text-sm">Severidade</label>
        <Select id="severity" onValueChange={(value: 'low'|'medium'|'high') => setSeverity(value)} value={severity}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a severidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">🟢 Baixa</SelectItem>
            <SelectItem value="medium">🟡 Média</SelectItem>
            <SelectItem value="high">🔴 Alta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Registrando...' : 'Registrar Falha'}
      </Button>
    </form>
  )
}
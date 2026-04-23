// src/feature/equipament/EquipmentForm.tsx

import { useState, useEffect } from 'react'
import { CreateEquipmentDTO, Equipment } from './types'
import { toast } from 'sonner'

interface Props {
  onSubmit: (data: CreateEquipmentDTO) => Promise<void>
  initialData?: Equipment | null
  onCancelEdit?: () => void
  loading?: boolean
}

export default function EquipmentForm({
  onSubmit,
  initialData,
  onCancelEdit,
  loading = false,
}: Props) {
  const emptyForm: CreateEquipmentDTO = {
    nome: '',
    codigo: '',
    estado: 'disponivel',
  }

  const [form, setForm] = useState<CreateEquipmentDTO>(emptyForm)

  useEffect(() => {
    if (initialData) {
      setForm({
        nome: initialData.nome,
        codigo: initialData.codigo,
        estado: initialData.estado,
      })
    } else {
      setForm(emptyForm)
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 🔥 validação real
    if (!form.nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    if (!form.codigo.trim()) {
      toast.error('Código é obrigatório')
      return
    }

    try {
      await onSubmit(form)

      toast.success(
        initialData ? 'Equipamento atualizado com sucesso' : 'Equipamento criado com sucesso'
      )

      setForm(emptyForm)

      if (onCancelEdit) onCancelEdit()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar equipamento')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-4"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {initialData ? 'Editar Equipamento' : 'Adicionar Equipamento'}
        </h2>

        {initialData && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Cancelar edição
          </button>
        )}
      </div>

      <input
        name="nome"
        placeholder="Nome do equipamento"
        value={form.nome}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        disabled={loading}
      />

      <input
        name="codigo"
        placeholder="Código único"
        value={form.codigo}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        disabled={loading}
      />

      <select
        name="estado"
        value={form.estado}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        disabled={loading}
      >
        <option value="disponivel">Disponível</option>
        <option value="reservado">Reservado</option>
        <option value="em_uso">Em uso</option>
        <option value="manutencao">Manutenção</option>
        <option value="inativo">Inativo</option>
      </select>

      <button
        type="submit"
        disabled={loading}
        className="bg-primary text-white px-4 py-2 rounded hover:opacity-90 w-full disabled:opacity-50"
      >
        {loading ? 'A guardar...' : initialData ? 'Atualizar Equipamento' : 'Salvar Equipamento'}
      </button>
    </form>
  )
}

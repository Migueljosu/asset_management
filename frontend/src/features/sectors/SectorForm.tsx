import { useEffect, useState } from 'react'
import { CreateSectorDTO, Sector } from './types'
import { toast } from 'sonner'

interface Props {
  onSubmit: (data: CreateSectorDTO) => Promise<void>
  initialData?: Sector | null
  onCancelEdit?: () => void
  loading?: boolean
}

export default function SectorForm({
  onSubmit,
  initialData,
  onCancelEdit,
  loading = false,
}: Props) {
  const emptyForm: CreateSectorDTO = {
    nome: '',
  }

  const [form, setForm] = useState<CreateSectorDTO>(emptyForm)

  useEffect(() => {
    if (initialData) {
      setForm({
        nome: initialData.nome,
      })
    } else {
      setForm(emptyForm)
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    try {
      await onSubmit({
        nome: form.nome.trim(),
      })

      toast.success(initialData ? 'Setor atualizado com sucesso' : 'Setor criado com sucesso')
      setForm(emptyForm)

      if (onCancelEdit) onCancelEdit()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar setor')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-4"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {initialData ? 'Editar Setor' : 'Adicionar Setor'}
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
        placeholder="Nome do setor/departamento"
        value={form.nome}
        onChange={(e) => setForm({ nome: e.target.value })}
        className="w-full p-2 border rounded"
        disabled={loading}
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-primary text-white px-4 py-2 rounded hover:opacity-90 w-full disabled:opacity-50"
      >
        {loading ? 'A guardar...' : initialData ? 'Atualizar Setor' : 'Salvar Setor'}
      </button>
    </form>
  )
}

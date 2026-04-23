// src/feature/equipament/EquipmentList.tsx

import { useEffect, useState } from 'react'
import { equipmentService } from './equipmentService'
import { Equipment, CreateEquipmentDTO } from './types'
import EquipmentForm from './EquipmentForm'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export default function EquipmentList() {
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null)

  const { token, user } = useAuth()
  const role = user?.role
  const isAdmin = role === 'admin'
  const isFuncionario = role === 'funcionario'

  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(true)

  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 4

  // Funcionário só vê equipamentos disponíveis
  const visibleEquipments = isFuncionario
    ? equipments.filter((eq) => eq.estado === 'disponivel')
    : equipments

  const filteredEquipments = visibleEquipments.filter((eq) =>
    eq.nome.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredEquipments.length / ITEMS_PER_PAGE)

  const paginatedEquipments = filteredEquipments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  useEffect(() => {
    loadEquipments()
  }, [token])

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const loadEquipments = async () => {
    if (!token) return

    setLoading(true)

    try {
      const data = await equipmentService.getAll(token)
      setEquipments(data)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar equipamentos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data: CreateEquipmentDTO) => {
    if (!token) return

    setSubmitting(true)

    try {
      await equipmentService.create(token, data)
      toast.success('Equipamento criado')
      await loadEquipments()
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (data: CreateEquipmentDTO) => {
    if (!editingEquipment || !token) return

    setSubmitting(true)

    try {
      await equipmentService.update(token, editingEquipment.id, data)
      toast.success('Equipamento atualizado')
      setEditingEquipment(null)
      await loadEquipments()
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (id: number) => {
    toast('Confirmar remoção?', {
      description: 'Esta ação não pode ser desfeita.',
      action: {
        label: 'Confirmar',
        onClick: async () => {
          if (!token) return

          try {
            await equipmentService.delete(token, id)

            toast.success('Equipamento removido com sucesso')
            await loadEquipments()
          } catch (error: any) {
            toast.error(error.message || 'Erro ao remover')
          }
        },
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {
          toast('Ação cancelada')
        },
      },
    })
  }

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-3" />A carregar
        equipamentos...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          {isFuncionario ? 'Equipamentos Disponíveis' : 'Equipamentos'}
        </h1>
        <p className="text-muted-foreground">
          {isFuncionario
            ? 'Consulte os equipamentos disponíveis para agendamento'
            : 'Gestão completa de equipamentos'}
        </p>
      </div>

      {/* Form só para admin */}
      {isAdmin && (
        <EquipmentForm
          onSubmit={editingEquipment ? handleUpdate : handleCreate}
          initialData={editingEquipment}
          onCancelEdit={() => setEditingEquipment(null)}
          loading={submitting}
        />
      )}

      <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {isFuncionario ? 'Lista de Disponíveis' : 'Lista'}
          </h2>

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-blue-600 hover:underline"
          >
            {expanded ? 'Ocultar' : 'Expandir'}
          </button>
        </div>

        <Input
          placeholder="Pesquisar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {expanded && (
          <div className="space-y-4">
            {filteredEquipments.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {isFuncionario
                  ? 'Nenhum equipamento disponível no momento.'
                  : 'Nenhum equipamento encontrado.'}
              </p>
            )}

            {paginatedEquipments.map((eq) => (
              <div
                key={eq.id}
                className="flex justify-between items-center p-4 border rounded-lg hover:shadow-sm transition"
              >
                <div>
                  <p className="font-semibold">{eq.nome}</p>
                  <p className="text-sm text-muted-foreground">{eq.codigo}</p>
                  {!isFuncionario && (
                    <p className="text-xs capitalize">{eq.estado}</p>
                  )}
                </div>

                {/* Botões só para admin */}
                {isAdmin && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => setEditingEquipment(eq)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                      disabled={submitting}
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => handleDelete(eq.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                      disabled={submitting}
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>
            ))}
            {/* PAGINAÇÃO */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center pt-4">
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Anterior
                  </button>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

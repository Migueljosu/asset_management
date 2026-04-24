// src/feature/equipament/EquipmentList.tsx

import { useEffect, useState } from 'react'
import { equipmentService } from './equipmentService'
import { Equipment, CreateEquipmentDTO } from './types'
import EquipmentForm from './EquipmentForm'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { usePagination } from '@/hooks/usePagination'
import Pagination from '@/components/ui/Pagination'

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
  const [estadoFilter, setEstadoFilter] = useState<string>('ALL')
  const [expanded, setExpanded] = useState(true)

  // Funcionário só vê equipamentos disponíveis
  const visibleEquipments = isFuncionario
    ? equipments.filter((eq) => eq.estado === 'disponivel')
    : equipments

  const {
    paginatedData: paginatedEquipments,
    currentPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    goToPrevious,
    goToNext,
  } = usePagination<Equipment>({
    data: visibleEquipments,
    itemsPerPage: 5,
    searchFields: ['nome', 'codigo'],
    searchValue: search,
    filterFn: (eq) => {
      if (estadoFilter === 'ALL') return true
      return eq.estado === estadoFilter
    },
  })

  useEffect(() => {
    loadEquipments()
  }, [token])

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

  const estadoOptions = [
    { value: 'ALL', label: 'Todos os estados' },
    { value: 'disponivel', label: 'Disponível' },
    { value: 'reservado', label: 'Reservado' },
    { value: 'em_uso', label: 'Em uso' },
    { value: 'manutencao', label: 'Manutenção' },
    { value: 'inativo', label: 'Inativo' },
  ]

  const estadoBadge = (estado: string) => {
    const map: Record<string, string> = {
      disponivel: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      reservado: 'bg-amber-100 text-amber-700 border-amber-200',
      em_uso: 'bg-blue-100 text-blue-700 border-blue-200',
      manutencao: 'bg-orange-100 text-orange-700 border-orange-200',
      inativo: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return map[estado] || 'bg-gray-100 text-gray-700'
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

        {/* 🔍 Filtros avançados */}
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Pesquisar por nome ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          {!isFuncionario && (
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-background"
              aria-label="Filtrar por estado"
            >
              {estadoOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {expanded && (
          <div className="space-y-4">
            {totalItems === 0 && (
              <p className="text-sm text-muted-foreground">
                {isFuncionario
                  ? 'Nenhum equipamento disponível no momento.'
                  : 'Nenhum equipamento encontrado.'}
              </p>
            )}

            {paginatedEquipments.map((eq) => (
              <div
                key={eq.id}
                className="flex justify-between items-center p-4 border rounded-lg hover:shadow-md transition bg-background"
              >
                <div className="space-y-1">
                  <p className="font-semibold">{eq.nome}</p>
                  <p className="text-sm text-muted-foreground">{eq.codigo}</p>
                  {!isFuncionario && (
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${estadoBadge(eq.estado)}`}>
                      {eq.estado.replace('_', ' ')}
                    </span>
                  )}
                </div>

                {/* Botões só para admin */}
                {isAdmin && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => setEditingEquipment(eq)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      disabled={submitting}
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => handleDelete(eq.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                      disabled={submitting}
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Paginação */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              startItem={startItem}
              endItem={endItem}
              onPrevious={goToPrevious}
              onNext={goToNext}
            />
          </div>
        )}
      </div>
    </div>
  )
}


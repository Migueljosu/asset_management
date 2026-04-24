import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { sectorService } from './sectorService'
import { CreateSectorDTO, Sector } from './types'
import SectorForm from './SectorForm'
import { Input } from '@/components/ui/input'
import { usePagination } from '@/hooks/usePagination'
import Pagination from '@/components/ui/Pagination'
import { Building2, Pencil, Trash2 } from 'lucide-react'

export default function SectorsPage() {
  const [sectors, setSectors] = useState<Sector[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingSector, setEditingSector] = useState<Sector | null>(null)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(true)

  const { token } = useAuth()

  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    goToPrevious,
    goToNext,
  } = usePagination<Sector>({
    data: sectors,
    itemsPerPage: 5,
    searchFields: ['nome'],
    searchValue: search,
  })

  useEffect(() => {
    loadSectors()
  }, [token])

  async function loadSectors() {
    if (!token) return

    setLoading(true)
    try {
      const data = await sectorService.getAll(token)
      setSectors(data)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar setores')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(data: CreateSectorDTO) {
    if (!token) return

    setSubmitting(true)
    try {
      await sectorService.create(token, data)
      toast.success('Setor criado com sucesso')
      await loadSectors()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar setor')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate(data: CreateSectorDTO) {
    if (!token || !editingSector) return

    setSubmitting(true)
    try {
      await sectorService.update(token, editingSector.id, data)
      setEditingSector(null)
      toast.success('Setor atualizado com sucesso')
      await loadSectors()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar setor')
    } finally {
      setSubmitting(false)
    }
  }

  function handleDelete(id: number, nome: string) {
    toast('Confirmar remoção?', {
      description: `O setor ${nome} será removido.`,
      action: {
        label: 'Confirmar',
        onClick: async () => {
          if (!token) return

          try {
            await sectorService.delete(token, id)
            toast.success('Setor removido com sucesso')
            await loadSectors()
          } catch (error: any) {
            toast.error(error.message || 'Erro ao remover setor')
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
        <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
        A carregar setores...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Setores</h1>
        <p className="text-muted-foreground">Gestão de setores e departamentos</p>
      </div>

      <SectorForm
        onSubmit={editingSector ? handleUpdate : handleCreate}
        initialData={editingSector}
        onCancelEdit={() => setEditingSector(null)}
        loading={submitting}
      />

      <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <h2 className="text-xl font-semibold">Lista</h2>
          <span className="text-sm text-muted-foreground">{totalItems} setor(es)</span>
        </div>

        <Input
          placeholder="Pesquisar setor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {expanded && (
          <div className="space-y-3">
            {totalItems === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum setor encontrado.</p>
            )}

            {paginatedData.map((sector) => (
              <div
                key={sector.id}
                className="flex justify-between items-center p-4 border rounded-lg hover:shadow-md transition bg-background"
              >
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-muted-foreground" />
                  <p className="font-semibold">{sector.nome}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingSector(sector)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
                    disabled={submitting}
                  >
                    <Pencil size={14} />
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(sector.id, sector.nome)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800 font-medium text-sm"
                    disabled={submitting}
                  >
                    <Trash2 size={14} />
                    Remover
                  </button>
                </div>
              </div>
            ))}

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


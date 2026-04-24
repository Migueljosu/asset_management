import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { sectorService } from '../sectors/sectorService'
import { TransferItem, TransferableEquipment } from './types'
import { transferService } from './transferService'
import { Sector } from '../sectors/types'
import { Button } from '@/components/ui/Button'
import { usePagination } from '@/hooks/usePagination'
import Pagination from '@/components/ui/Pagination'
import { ArrowRightLeft, Package, Building2, Calendar } from 'lucide-react'

export default function TransfersPage() {
  const { token } = useAuth()
  const [transfers, setTransfers] = useState<TransferItem[]>([])
  const [transferables, setTransferables] = useState<TransferableEquipment[]>([])
  const [sectors, setSectors] = useState<Sector[]>([])
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('')
  const [selectedSectorId, setSelectedSectorId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadData()
  }, [token])

  async function loadData() {
    if (!token) return

    setLoading(true)
    try {
      const [transferData, transferableData, sectorData] = await Promise.all([
        transferService.getAll(token),
        transferService.getTransferableEquipments(token),
        sectorService.getAll(token),
      ])

      setTransfers(transferData)
      setTransferables(transferableData)
      setSectors(sectorData)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar transferências')
    } finally {
      setLoading(false)
    }
  }

  const selectedEquipment = useMemo(
    () => transferables.find((item) => item.equipmentId === Number(selectedEquipmentId)),
    [transferables, selectedEquipmentId]
  )

  const destinationOptions = useMemo(() => {
    if (!selectedEquipment) return sectors
    return sectors.filter((sector) => sector.id !== selectedEquipment.currentSectorId)
  }, [sectors, selectedEquipment])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedEquipmentId || !selectedSectorId) {
      toast.error('Selecione o equipamento e o setor de destino')
      return
    }

    if (!token) return

    try {
      setSubmitting(true)
      await transferService.create(token, {
        equipmentId: Number(selectedEquipmentId),
        destinationSectorId: Number(selectedSectorId),
      })
      toast.success('Transferência criada com sucesso')
      setSelectedEquipmentId('')
      setSelectedSectorId('')
      await loadData()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao transferir equipamento')
    } finally {
      setSubmitting(false)
    }
  }

  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    goToPrevious,
    goToNext,
  } = usePagination<TransferItem>({
    data: transfers,
    itemsPerPage: 5,
    searchFields: ['equipmentName', 'originSectorName', 'destinationSectorName'],
    searchValue: search,
  })

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
        A carregar transferências...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Transferências</h1>
        <p className="text-muted-foreground">Transferir equipamentos em uso entre setores</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-4">
        <h2 className="text-xl font-semibold">Nova Transferência</h2>

        {transferables.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Não existem equipamentos em uso para transferir.
          </p>
        ) : (
          <>
            <select
              value={selectedEquipmentId}
              onChange={(e) => {
                setSelectedEquipmentId(e.target.value)
                setSelectedSectorId('')
              }}
              className="w-full border rounded px-3 py-2 bg-background"
              aria-label="Selecionar equipamento"
            >
              <option value="">Selecione um equipamento em uso</option>
              {transferables.map((item) => (
                <option key={item.equipmentId} value={item.equipmentId}>
                  {item.equipmentName} - setor atual: {item.currentSectorName}
                </option>
              ))}
            </select>

            <select
              value={selectedSectorId}
              onChange={(e) => setSelectedSectorId(e.target.value)}
              className="w-full border rounded px-3 py-2 bg-background"
              disabled={!selectedEquipmentId}
              aria-label="Selecionar setor de destino"
            >
              <option value="">Selecione o setor de destino</option>
              {destinationOptions.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.nome}
                </option>
              ))}
            </select>

            <Button type="submit" disabled={submitting}>
              {submitting ? 'A transferir...' : 'Transferir'}
            </Button>
          </>
        )}
      </form>

      <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <h2 className="text-xl font-semibold">Histórico</h2>
          <span className="text-sm text-muted-foreground">{totalItems} transferência(s)</span>
        </div>

        <input
          type="text"
          placeholder="Pesquisar por equipamento ou setor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm bg-background"
        />

        {totalItems === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Sem transferências registadas.</p>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedData.map((transfer) => (
                <div
                  key={transfer.id}
                  className="p-4 border rounded-lg hover:shadow-md transition bg-background"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold flex items-center gap-1">
                      <Package size={14} />
                      {transfer.equipmentName}
                    </p>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Building2 size={12} />
                      {transfer.originSectorName}
                    </span>
                    <ArrowRightLeft size={14} className="text-muted-foreground" />
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Building2 size={12} />
                      {transfer.destinationSectorName}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar size={10} />
                    {new Date(transfer.transferredAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              startItem={startItem}
              endItem={endItem}
              onPrevious={goToPrevious}
              onNext={goToNext}
            />
          </>
        )}
      </div>
    </div>
  )
}


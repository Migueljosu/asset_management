import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { sectorService } from '../sectors/sectorService'
import { TransferItem, TransferableEquipment } from './types'
import { transferService } from './transferService'
import { Sector } from '../sectors/types'
import { Button } from '@/components/ui/Button'

export default function TransfersPage() {
  const { token } = useAuth()
  const [transfers, setTransfers] = useState<TransferItem[]>([])
  const [transferables, setTransferables] = useState<TransferableEquipment[]>([])
  const [sectors, setSectors] = useState<Sector[]>([])
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('')
  const [selectedSectorId, setSelectedSectorId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

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

  if (loading) {
    return <div className="text-center py-10">A carregar transferências...</div>
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
              className="w-full border rounded px-3 py-2"
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
              className="w-full border rounded px-3 py-2"
              disabled={!selectedEquipmentId}
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
        <h2 className="text-xl font-semibold">Histórico</h2>

        {transfers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem transferências registadas.</p>
        ) : (
          transfers.map((transfer) => (
            <div key={transfer.id} className="p-4 border rounded-lg">
              <p className="font-semibold">{transfer.equipmentName}</p>
              <p className="text-sm text-muted-foreground">
                {transfer.originSectorName} → {transfer.destinationSectorName}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(transfer.transferredAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

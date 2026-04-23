import { useEffect, useState } from 'react'
import { equipmentService } from '../equipment/equipmentService'
import { sectorService } from '../sectors/sectorService'
import { createLoan } from './loanService'
import { Loan, CreateLoanDTO } from './types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

export default function LoanForm({ onCreated }: { onCreated: (loan: Loan) => void }) {
  const [equipments, setEquipments] = useState<any[]>([])
  const [sectors, setSectors] = useState<any[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState('')
  const [selectedSector, setSelectedSector] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)

  const { token } = useAuth()

  useEffect(() => {
    loadData()
  }, [token])

  async function loadData() {
    if (!token) return

    try {
      const [equipmentData, sectorData] = await Promise.all([
        equipmentService.getAll(token),
        sectorService.getAll(token),
      ])

      setEquipments(equipmentData.filter((equipment: { estado: string }) => equipment.estado === 'disponivel'))
      setSectors(sectorData)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar dados do empréstimo')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedEquipment || !selectedSector || !dueDate) {
      toast.error('Preencha todos os campos')
      return
    }

    if (!token) return

    try {
      setLoading(true)

      const loan = await createLoan(token, {
        equipmentId: Number(selectedEquipment),
        sectorId: Number(selectedSector),
        dueDate,
      } as CreateLoanDTO)

      toast.success('Empréstimo criado')
      onCreated(loan)

      setSelectedEquipment('')
      setSelectedSector('')
      setDueDate('')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-4">
      <h2 className="text-xl font-semibold">Registrar Empréstimo</h2>

      <select
        value={selectedEquipment}
        onChange={(e) => setSelectedEquipment(e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="">Equipamento</option>
        {equipments.map((equipment) => (
          <option key={equipment.id} value={equipment.id}>
            {equipment.nome}
          </option>
        ))}
      </select>

      <select
        value={selectedSector}
        onChange={(e) => setSelectedSector(e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="">Setor destino</option>
        {sectors.map((sector) => (
          <option key={sector.id} value={sector.id}>
            {sector.nome}
          </option>
        ))}
      </select>

      <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

      <Button type="submit" disabled={loading}>
        {loading ? 'Registrando...' : 'Registrar'}
      </Button>
    </form>
  )
}

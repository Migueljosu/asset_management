
import { useEffect, useState } from 'react'
import { getUsers } from '../users/userService'
import { equipmentService } from '../equipment/equipmentService'
import { createLoan } from './loanService'
import { Loan } from './types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

export default function LoanForm({ onCreated }: { onCreated: (loan: Loan) => void }) {
  const { toast } = useToast()

  const [users, setUsers] = useState<any[]>([])
  const [equipments, setEquipments] = useState<any[]>([])

  const [selectedUser, setSelectedUser] = useState<number | ''>('')
  const [selectedEquipment, setSelectedEquipment] = useState<string | ''>('')

  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getUsers().then((users) => {
      setUsers(users.filter((u) => u.status === 'ACTIVE'))
    })

   //equipmentService.getAll().then(setEquipments)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUser || !selectedEquipment || !destination || !startDate || !dueDate) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha todos os campos',
      })
      return
    }

    try {
      setLoading(true)

      const user = users.find((u) => u.id === selectedUser)
      const eq = equipments.find((e) => e.id === selectedEquipment)

      const loan = await createLoan({
        userId: selectedUser as number,
        userName: user.name,
        equipmentId: selectedEquipment as string,
        equipmentName: eq.name,
        destination,
        startDate,
        dueDate,
      })

      toast({
        title: 'Sucesso',
        description: 'Empréstimo criado',
      })

      onCreated(loan)

      setSelectedUser('')
      setSelectedEquipment('')
      setDestination('')
      setStartDate('')
      setDueDate('')
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-4">
      <h2 className="text-xl font-semibold">Registrar Empréstimo</h2>

      <select onChange={(e) => setSelectedUser(Number(e.target.value))} className="border p-2 rounded w-full">
        <option value="">Usuário</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>

      <select onChange={(e) => setSelectedEquipment(e.target.value)} className="border p-2 rounded w-full">
        <option value="">Equipamento</option>
        {equipments.map((e) => (
          <option key={e.id} value={e.id}>{e.name}</option>
        ))}
      </select>

      <Input
        placeholder="Departamento destino"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />

      <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

      <Button type="submit" disabled={loading}>
        {loading ? 'Registrando...' : 'Registrar'}
      </Button>
    </form>
  )
}
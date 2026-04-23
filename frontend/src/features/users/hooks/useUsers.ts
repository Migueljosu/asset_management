//src/feature/users/hooks/useUsers.ts

import { useEffect, useState } from 'react'
import { User } from '../types'
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  type CreateUserInput,
} from '../userService'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export function useUsers() {
  const { token } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('ALL')
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    loadUsers()
  }, [token])

  const loadUsers = async () => {
    if (!token) {
      setUsers([])
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const data = await getUsers(token)
      setUsers(data)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const saveUser = async (data: Omit<User, 'id'> | User) => {
    if (!token) return

    try {
      if ('id' in data) {
        const updated = await updateUser(token, data)
        setUsers((prev) =>
          prev.map((u) => (u.id === updated.id ? updated : u))
        )
        setEditingUser(null)
        toast.success('Usuário atualizado com sucesso')
      } else {
        const created = await createUser(token, data as CreateUserInput)
        setUsers((prev) => [...prev, created])
        toast.success('Usuário cadastrado com sucesso')
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar usuário')
      throw error
    }
  }

  const removeUser = async (id: number) => {
    if (!token) return

    try {
      await deleteUser(token, id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      toast.success('Usuário eliminado com sucesso')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao eliminar usuário')
    }
  }

  const filteredUsers = users
    .filter((u) =>
      `${u.name} ${u.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter((u) =>
      filterRole === 'ALL' ? true : u.role === filterRole
    )

  return {
    users: filteredUsers,
    loading,
    search,
    setSearch,
    filterRole,
    setFilterRole,
    editingUser,
    setEditingUser,
    saveUser,
    removeUser,
  }
}

//src/feature/users/hooks/useUsers.ts

import { useEffect, useState } from 'react'
import { User } from '../types'
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../userService'

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const data = await getUsers()
    setUsers(data)
    setLoading(false)
  }

  const saveUser = async (data: Omit<User, 'id'> | User) => {
    if ('id' in data) {
      const updated = await updateUser(data)
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
      )
      setEditingUser(null)
    } else {
      const created = await createUser(data)
      setUsers((prev) => [...prev, created])
    }
  }

  const removeUser = async (id: number) => {
    await deleteUser(id)
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  const toggleBlock = async (user: User) => {
    const updatedUser = {
      ...user,
      status: user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE',
    }

    const result = await updateUser(updatedUser)

    setUsers((prev) =>
      prev.map((u) => (u.id === result.id ? result : u))
    )
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
    .filter((u) =>
      filterStatus === 'ALL' ? true : u.status === filterStatus
    )

  return {
    users: filteredUsers,
    loading,
    search,
    setSearch,
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,
    editingUser,
    setEditingUser,
    saveUser,
    removeUser,
    toggleBlock,
  }
}
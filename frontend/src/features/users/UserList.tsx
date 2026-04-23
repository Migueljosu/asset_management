//src/feature/users/UserList.tsx

import { User } from './types'

type Props = {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (id: number) => void
  onBlock: (user: User) => void
  search: string
  setSearch: (value: string) => void
  filterRole: string
  setFilterRole: (value: string) => void
  filterStatus: string
  setFilterStatus: (value: string) => void
}

export default function UserList({
  users,
  onEdit,
  onDelete,
  onBlock,
  search,
  setSearch,
  filterRole,
  setFilterRole,
  filterStatus,
  setFilterStatus,
}: Props) {
  const roleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-700'
      case 'MANAGER':
        return 'bg-purple-100 text-purple-700'
      case 'TECHNICIAN':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-blue-100 text-blue-700'
    }
  }

  const statusColor = (status: string) =>
    status === 'ACTIVE'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-200 text-gray-700'

  return (
    <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-6">
      <h2 className="text-xl font-semibold">Lista de Usuários</h2>

      {/* 🔍 Filtros */}
      <div className="flex flex-wrap gap-4">
        {/* Pesquisa */}
        <input
          type="text"
          placeholder="Pesquisar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2"
        />

        {/* Filtro por Role */}
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="ALL">Todos</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="TECHNICIAN">Técnico</option>
          <option value="EMPLOYEE">Funcionário</option>
        </select>

        {/* 🆕 Filtro por Status */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="ALL">Todos Status</option>
          <option value="ACTIVE">Ativo</option>
          <option value="BLOCKED">Bloqueado</option>
        </select>
      </div>

      {/* 📋 Lista */}
      <div className="space-y-4">
        {users.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Nenhum usuário encontrado.
          </p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex justify-between items-center p-4 border rounded-xl hover:shadow-md transition bg-background"
            >
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {user.email}
                </p>

                <div className="flex gap-2 mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${roleColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>

                  <span
                    className={`text-xs px-2 py-1 rounded ${statusColor(
                      user.status
                    )}`}
                  >
                    {user.status}
                  </span>
                </div>
              </div>

              {/* 🎯 Ações */}
              <div className="flex gap-4">
                <button
                  onClick={() => onEdit(user)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
                >
                  Editar
                </button>

                <button
                  onClick={() => onBlock(user)}
                  className="text-yellow-600 hover:text-yellow-800 text-sm font-medium transition"
                >
                  {user.status === 'ACTIVE'
                    ? 'Bloquear'
                    : 'Desbloquear'}
                </button>

                <button
                  onClick={() => {
                    if (
                      confirm(
                        'Tens certeza que quer eliminar este usuário?'
                      )
                    ) {
                      onDelete(user.id)
                    }
                  }}
                  className="text-red-600 hover:text-red-800 text-sm font-medium transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
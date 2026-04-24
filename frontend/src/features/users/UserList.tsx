//src/feature/users/UserList.tsx

import { useState } from 'react'
import { User } from './types'
import { toast } from 'sonner'
import { usePagination } from '@/hooks/usePagination'
import Pagination from '@/components/ui/Pagination'
import { User as UserIcon, Mail, Shield, Pencil, Trash2 } from 'lucide-react'

type Props = {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (id: number) => void
}

export default function UserList({
  users,
  onEdit,
  onDelete,
}: Props) {
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<string>('ALL')

  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    goToPrevious,
    goToNext,
  } = usePagination<User>({
    data: users,
    itemsPerPage: 5,
    searchFields: ['name', 'email'],
    searchValue: search,
    filterFn: (u) => {
      if (filterRole === 'ALL') return true
      return u.role === filterRole
    },
  })

  const roleConfig: Record<string, { label: string; color: string; icon: any }> = {
    admin: { label: 'Admin', color: 'bg-red-100 text-red-700 border-red-200', icon: Shield },
    tecnico: { label: 'Técnico', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Shield },
    funcionario: { label: 'Funcionário', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: UserIcon },
  }

  return (
    <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-xl font-semibold">Lista de Usuários</h2>
        <span className="text-sm text-muted-foreground">{totalItems} usuário(s)</span>
      </div>

      {/* 🔍 Filtros avançados */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Pesquisar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] border rounded-md px-3 py-2 text-sm bg-background"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-background"
          aria-label="Filtrar por perfil"
        >
          <option value="ALL">Todos os perfis</option>
          <option value="admin">Admin</option>
          <option value="tecnico">Técnico</option>
          <option value="funcionario">Funcionário</option>
        </select>
      </div>

      {/* 📋 Lista */}
      <div className="space-y-3">
        {totalItems === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum usuário encontrado.
          </p>
        ) : (
          <>
            {paginatedData.map((user) => {
              const role = roleConfig[user.role] || roleConfig.funcionario
              const RoleIcon = role.icon

              return (
                <div
                  key={user.id}
                  className="flex justify-between items-center p-4 border rounded-xl hover:shadow-md transition bg-background"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold flex items-center gap-1">
                        <UserIcon size={14} />
                        {user.name}
                      </p>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${role.color}`}>
                        <RoleIcon size={10} />
                        {role.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail size={12} />
                      {user.email}
                    </p>
                  </div>

                  {/* 🎯 Ações */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => onEdit(user)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition"
                    >
                      <Pencil size={14} />
                      Editar
                    </button>

                    <button
                      onClick={() =>
                        toast('Confirmar eliminação?', {
                          description: `O usuário ${user.name} será removido.`,
                          action: {
                            label: 'Confirmar',
                            onClick: () => onDelete(user.id),
                          },
                          cancel: {
                            label: 'Cancelar',
                            onClick: () => {
                              toast('Ação cancelada')
                            },
                          },
                        })
                      }
                      className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium transition"
                    >
                      <Trash2 size={14} />
                      Eliminar
                    </button>
                  </div>
                </div>
              )
            })}

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


//src/feature/users/UserPage.tsx

import { useUsers } from './hooks/useUsers'
import UserForm from './UserForm'
import UserList from './UserList'

export default function UsersPage() {
  const {
    users,
    loading,
    search,
    setSearch,
    filterRole,
    setFilterRole,
    editingUser,
    setEditingUser,
    saveUser,
    removeUser,
  } = useUsers()

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
      
        <div className="text-right">
          <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground">
            Administração e controle de acessos
          </p>
        </div>
      </div>

      <UserForm
        onSubmit={saveUser}
        editingUser={editingUser}
      />

      {loading ? (
        <p>Carregando usuários...</p>
      ) : (
        <UserList
          users={users}
          onEdit={setEditingUser}
          onDelete={removeUser}
          search={search}
          setSearch={setSearch}
          filterRole={filterRole}
          setFilterRole={setFilterRole}
        />
      )}
    </div>
  )
}

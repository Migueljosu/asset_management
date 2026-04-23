import { Bell, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ThemeToggle } from '../ui/ThemeToggle'

export default function Topbar() {
  const { user, logout, isLoading } = useAuth()

  if (isLoading || !user) return null
  
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b">
      <h1 className="text-xl font-semibold">Sistema de Gestão de Equipamentos</h1>

      <div className="flex items-center gap-6">
        <ThemeToggle />

        <button className="relative">
          <Bell size={20} />
          <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full px-1">
            3
          </span>
        </button>

        <div className="text-right">
          <p className="text-sm font-medium">{isLoading ? 'Carregando...' : user?.nome}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </div>
  )
}

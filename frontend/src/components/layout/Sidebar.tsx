import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Calendar,
  Wrench,
  AlertTriangle,
  Users,
  BarChart3,
  Settings,
  Building2,
  ClipboardList,
  ArrowRightLeft,
} from 'lucide-react'

import { useAppState } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'

export default function Sidebar() {
  const { theme } = useAppState()
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (!user) return null

  const isDark = theme === 'dark'
  const role = user.role

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200
     ${
       isActive
         ? isDark
           ? 'bg-blue-600 text-white'
           : 'bg-blue-500 text-white'
         : isDark
           ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
           : 'text-gray-600 hover:bg-gray-200 hover:text-black'
     }`

  return (
    <aside
      className={`w-64 h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-black border-r'}`}
    >
      <nav className="space-y-2">
        <NavLink to="/dashboard" className={linkClass}>
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        {/* 🖥️ equipment - admin e funcionário (display só leitura para funcionário) */}
        {(role === 'admin' || role === 'funcionario') && (
          <NavLink to="/equipments" className={linkClass}>
            <Package size={18} />
            Equipamentos
          </NavLink>
        )}

        {/* 💰 loans - só admin */}
        {role === 'admin' && (
          <NavLink to="/loans" className={linkClass}>
            <Calendar size={18} />
            Empréstimos
          </NavLink>
        )}

        {(role === 'admin' || role === 'funcionario') && (
          <NavLink to="/schedules" className={linkClass}>
            <ClipboardList size={18} />
            Agendamentos
          </NavLink>
        )}

        {(role === 'admin' || role === 'tecnico') && (
          <NavLink to="/manutention" className={linkClass}>
            <Wrench size={18} />
            Manutenção
          </NavLink>
        )}

        <NavLink to="/anomalies" className={linkClass}>
          <AlertTriangle size={18} />
          Anomalias
        </NavLink>

        {role === 'admin' && (
          <>
            <NavLink to="/users" className={linkClass}>
              <Users size={18} />
              Utilizadores
            </NavLink>

            <NavLink to="/sectors" className={linkClass}>
              <Building2 size={18} />
              Setores
            </NavLink>

            <NavLink to="/transfers" className={linkClass}>
              <ArrowRightLeft size={18} />
              Transferências
            </NavLink>

            <NavLink to="/reports" className={linkClass}>
              <BarChart3 size={18} />
              Relatórios
            </NavLink>

            <NavLink to="/settings" className={linkClass}>
              <Settings size={18} />
              Configurações
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  )
}

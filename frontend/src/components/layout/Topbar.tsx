import { Bell, LogOut, Check, Trash2, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ThemeToggle } from '../ui/ThemeToggle'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  Notification,
} from '@/features/notifications/notificationService'
import { toast } from 'sonner'

export default function Topbar() {
  const { user, logout, isLoading, token } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [naoLidas, setNaoLidas] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const loadNotifications = useCallback(async () => {
    if (!token) return
    try {
      const res = await getNotifications(token)
      if (res.success) {
        setNotifications(res.data)
        setNaoLidas(res.naoLidas || 0)
      }
    } catch {
      // silencioso — não queremos spam de erro
    }
  }, [token])

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000) // poll a cada 30s
    return () => clearInterval(interval)
  }, [loadNotifications])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAsRead = async (id: number) => {
    if (!token) return
    try {
      await markAsRead(id, token)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
      )
      setNaoLidas((prev) => Math.max(0, prev - 1))
    } catch {
      toast.error('Erro ao marcar como lida')
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!token) return
    try {
      await markAllAsRead(token)
      setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })))
      setNaoLidas(0)
      toast.success('Todas marcadas como lidas')
    } catch {
      toast.error('Erro ao marcar todas como lidas')
    }
  }

  const handleDelete = async (id: number) => {
    if (!token) return
    try {
      await deleteNotification(id, token)
      const removed = notifications.find((n) => n.id === id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      if (removed && !removed.lida) {
        setNaoLidas((prev) => Math.max(0, prev - 1))
      }
    } catch {
      toast.error('Erro ao eliminar notificação')
    }
  }

  if (isLoading || !user) return null

  const tipoCor = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      case 'warning':
        return 'bg-yellow-500'
      default:
        return 'bg-blue-500'
    }
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b">
      <h1 className="text-xl font-semibold">Sistema de Gestão de Equipamentos</h1>

      <div className="flex items-center gap-6">
        <ThemeToggle />

        {/* SININHO DE NOTIFICAÇÕES */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="relative"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <Bell size={20} />
            {naoLidas > 0 && (
              <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {naoLidas}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-10 w-80 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-sm">Notificações</h3>
                {naoLidas > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Check size={12} />
                    Marcar todas
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                  Sem notificações
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 hover:bg-muted/50 transition-colors ${
                        !n.lida ? 'bg-muted/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${tipoCor(n.tipo)}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{n.titulo}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {n.mensagem}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(n.createdAt).toLocaleString('pt-PT')}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          {!n.lida && (
                            <button
                              onClick={() => handleMarkAsRead(n.id)}
                              title="Marcar como lida"
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(n.id)}
                            title="Eliminar"
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

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

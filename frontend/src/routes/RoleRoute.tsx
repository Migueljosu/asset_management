import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function RoleRoute({ children, allowed }: any) {
  const { user, isLoading } = useAuth()

  if (isLoading) return <div>Carregando...</div>

  if (!user) return <Navigate to="/login" replace />

  if (!allowed.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
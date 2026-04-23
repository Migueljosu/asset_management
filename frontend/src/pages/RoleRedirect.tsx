import { useAuth } from "../context/AuthContext"
import { Navigate } from "react-router-dom"

function getRoleFromToken(token: string | null) {
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.role
  } catch {
    return null
  }
}

export default function RoleRedirect() {
  const { token, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const role = getRoleFromToken(token)

  if (role === "admin") {
    return <Navigate to="/dashboard" replace />
  }

  if (role === "technician") {
    return <Navigate to="/dashboardPessoal" replace />
  }

  return <Navigate to="/login" replace />
}
// frontend/src/layouts/RootLayout.tsx
import { useLocation, useNavigate} from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import { Notification } from '../components/ui/Notification'
import { useAuth } from '../context/AuthContext'

export default function RootLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const currentYear = new Date().getFullYear()

  // Esconde menu, topbar e footer na página de login
  const hideDashboardUI = location.pathname === '/login'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <AppProvider>
      <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors">

    
         
        {/* Notificações */}
        <Notification />
      </div>
    </AppProvider>
  )
}
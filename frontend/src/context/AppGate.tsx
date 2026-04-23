import { useAuth } from '@/context/AuthContext'

export function AppGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Carregando sistema...
      </div>
    )
  }

  return <>{children}</>
}
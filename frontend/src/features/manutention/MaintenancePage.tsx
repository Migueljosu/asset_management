import { useState } from 'react'
import MaintenanceForm from './MaintenanceForm'
import MaintenanceList from './MaintenanceList'
import { useAuth } from '@/context/AuthContext'

export default function MaintenancePage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const { user } = useAuth()

  function handleRefresh() {
    setRefreshKey((prev) => prev + 1)
  }

  const canManageMaintenance = user?.role === 'admin' || user?.role === 'tecnico'

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Gestão de Manutenção</h1>
        <p className="text-gray-500">Controle completo das intervenções técnicas.</p>
      </div>

      {canManageMaintenance ? (
        <MaintenanceForm onSuccess={handleRefresh} />
      ) : (
        <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          Apenas administradores e técnicos podem abrir ou gerir manutenções.
        </div>
      )}

      <MaintenanceList refreshKey={refreshKey} />
    </div>
  )
}

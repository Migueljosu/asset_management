import { useState } from 'react'
import MaintenanceForm from './MaintenanceForm'
import MaintenanceList from './MaintenanceList'
import { fakeUser } from '@/utils/fakeAuth'
import BackToHome  from '../../components/ui/BackToHome'

export default function MaintenancePage() {
  const [refreshKey, setRefreshKey] = useState(0)

  function handleRefresh() {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-10">
    

      <div>
        <h1 className="text-2xl font-bold">
          Gestão de Manutenção
        </h1>
        <p className="text-gray-500">
          Controle completo das intervenções técnicas.
        </p>
      </div>

      {/* Apenas admin vê formulário */}
      {fakeUser.role === 'admin' && (
        <MaintenanceForm onSuccess={handleRefresh} />
      )}

      <MaintenanceList refreshKey={refreshKey} />
    </div>
  )
}
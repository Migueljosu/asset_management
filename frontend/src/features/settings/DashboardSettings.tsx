import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/use-toast'
import { SettingsCard } from './SettingsCard'

export default function DashboardSettings() {
  const { toast } = useToast()

  // Estado de cada configuração
  const [showAnomaliesChart, setShowAnomaliesChart] = useState(true)
  const [showMaintenanceChart, setShowMaintenanceChart] = useState(true)
  const [dashboardTitle, setDashboardTitle] = useState('Painel de Controle')
  const [refreshInterval, setRefreshInterval] = useState(15) // minutos

  const handleSave = () => {
    // Simular salvamento via API
    // Aqui poderia ser um call para backend
    setTimeout(() => {
      toast({
        title: 'Configurações salvas!',
        description: 'As alterações do dashboard foram registradas com sucesso.',
      })
    }, 300)
  }

  return (
    <SettingsCard title="Configurações do Dashboard">
      <div className="space-y-4">
        {/* Título do Dashboard */}
        <div className="space-y-2">
          <label>Título do Dashboard</label>
          <Input value={dashboardTitle} onChange={(e) => setDashboardTitle(e.target.value)} />
        </div>

        {/* Mostrar gráficos */}
        <div className="space-y-2">
          <label>
            <input
              type="checkbox"
              checked={showAnomaliesChart}
              onChange={(e) => setShowAnomaliesChart(e.target.checked)}
              className="h-5 w-5 mr-2"
            />
            Mostrar gráfico de anomalias
          </label>

          <label>
            <input
              type="checkbox"
              checked={showMaintenanceChart}
              onChange={(e) => setShowMaintenanceChart(e.target.checked)}
              className="h-5 w-5 mr-2"
            />
            Mostrar gráfico de manutenções
          </label>
        </div>

        {/* Intervalo de atualização */}
        <div className="space-y-2">
          <label>Intervalo de atualização (minutos)</label>
          <Input
            type="number"
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
          />
        </div>

        <Button onClick={handleSave}>Salvar Configurações</Button>
      </div>
    </SettingsCard>
  )
}
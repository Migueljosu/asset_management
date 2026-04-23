import { useState } from 'react'
import BackToHome from '@/components/ui/BackToHome'
import SettingsSidebar from './SettingsSidebar'
import GeneralSettings from './GeneralSettings'
import SecuritySettings from './SecuritySettings'
import SecurityGeneral from './SecurityGeneral'
import NotificationSettings from './NotificationSettings'
import DashboardSettings from './DashboardSettings'
import AppearanceSettings from './AppearanceSettings'

export default function SettingsPage() {
  const [active, setActive] = useState<'general' | 'security'|'appearance' |'notifications'|'dashboard'| 'security-general'>('general')

  function renderContent() {
    switch (active) {
      case 'general':
        return <GeneralSettings />
      case 'security':
        return <SecuritySettings />
      case 'appearance':
        return <AppearanceSettings />
      case 'notifications':
        return <NotificationSettings/>
      case 'dashboard':
        return <DashboardSettings  />
      case 'security-general':
        return <SecurityGeneral />
      default:
        return null
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Botão voltar */}
       {/*<BackToHome />*/}

      {/* Título da página */}
      <h1 className="text-2xl font-bold">Configurações</h1>

      <div className="grid grid-cols-4 gap-8">
        {/* Sidebar */}
        <SettingsSidebar active={active} setActive={setActive} />

        {/* Conteúdo da seção */}
        <div className="col-span-3 space-y-6">{renderContent()}</div>
      </div>
    </div>
  )
}
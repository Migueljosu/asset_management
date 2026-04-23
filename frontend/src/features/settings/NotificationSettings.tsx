import { useAppState, useAppDispatch, showNotification } from '@/context/AppContext'
import { SettingsCard } from './SettingsCard'
import { Button } from '@/components/ui/Button'

export default function NotificationSettings() {
  const state = useAppState()
  const dispatch = useAppDispatch()

  const triggerNotification = () => {
    showNotification(dispatch, 'Essa é uma notificação de teste!', 'info')
  }

  return (
    <SettingsCard title="Notificações">
      <p>Gerenciar notificações do sistema.</p>
      <div className="mt-2">
        <Button onClick={triggerNotification}>Testar Notificação</Button>
      </div>
    </SettingsCard>
  )
}
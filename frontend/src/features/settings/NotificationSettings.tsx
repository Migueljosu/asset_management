import { toast } from 'sonner'
import { SettingsCard } from './SettingsCard'
import { Button } from '@/components/ui/Button'

export default function NotificationSettings() {
  const triggerNotification = () => {
    toast.info('Essa é uma notificação de teste!')
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

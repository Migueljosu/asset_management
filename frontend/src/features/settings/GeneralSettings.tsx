import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { SettingsCard } from './SettingsCard'

export default function GeneralSettings() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')

  const handleSave = () => {
    alert('Configurações gerais salvas!')
  }

  return (
    <SettingsCard title="Configurações Gerais">
      <div className="space-y-4">
        <div className="space-y-2">
          <label>Nome de usuário</label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div className="space-y-2">
          <label>Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <Button onClick={handleSave}>Salvar</Button>
      </div>
    </SettingsCard>
  )
}
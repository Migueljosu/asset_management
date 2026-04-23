import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { SettingsCard } from './SettingsCard'

export default function SecuritySettings() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSave = () => {
    alert('Configurações de segurança salvas!')
  }

  return (
    <SettingsCard title="Segurança">
      <div className="space-y-4">
        <div className="space-y-2">
          <label>Nova senha</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="space-y-2">
          <label>Confirmar senha</label>
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>

        <Button onClick={handleSave}>Salvar</Button>
      </div>
    </SettingsCard>
  )
}
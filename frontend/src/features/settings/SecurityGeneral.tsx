import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { SettingsCard } from './SettingsCard'

export default function SecurityGeneral() {
  const [twoFactor, setTwoFactor] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState(30)

  const handleSave = () => {
    alert('Configurações avançadas de segurança salvas!')
  }

  return (
    <SettingsCard title="Segurança Avançada">
      <div className="space-y-4">
        <div className="space-y-2">
          <label>Autenticação em dois fatores</label>
          <input
            type="checkbox"
            checked={twoFactor}
            onChange={(e) => setTwoFactor(e.target.checked)}
            className="h-5 w-5"
          />
        </div>

        <div className="space-y-2">
          <label>Tempo de expiração da sessão (minutos)</label>
          <Input type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(Number(e.target.value))} />
        </div>

        <Button onClick={handleSave}>Salvar</Button>
      </div>
    </SettingsCard>
  )
}
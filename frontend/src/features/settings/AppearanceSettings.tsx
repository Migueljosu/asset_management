import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SettingsCard } from './SettingsCard'
import { useAppState, useAppDispatch, setTheme } from '@/context/AppContext'

export default function AppearanceSettings() {
  const state = useAppState()
  const dispatch = useAppDispatch()

  const [selectedTheme, setSelectedTheme] = useState(state.theme)

  const handleSave = () => {
    setTheme(dispatch, selectedTheme)
  }

  return (
    <SettingsCard title="Configurações de Aparência">
      <div className="space-y-4">

        {/* Tema */}
        <div className="space-y-2">
          <label className="font-medium">Tema</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="theme"
                value="light"
                checked={selectedTheme === 'light'}
                onChange={() => setSelectedTheme('light')}
              />
              Claro
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={selectedTheme === 'dark'}
                onChange={() => setSelectedTheme('dark')}
              />
              Escuro
            </label>
          </div>
        </div>

        {/* Botão salvar */}
        <Button onClick={handleSave}>Salvar Aparência</Button>
      </div>
    </SettingsCard>
  )
}
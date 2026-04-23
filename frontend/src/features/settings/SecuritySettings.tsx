import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { SettingsCard } from './SettingsCard'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function SecuritySettings() {
  const { token } = useAuth()
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!token) {
      toast.error('Sessão inválida. Faça login novamente.')
      return
    }

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      toast.error('Preencha todos os campos.')
      return
    }

    if (novaSenha.length < 6) {
      toast.error('Nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (novaSenha !== confirmarSenha) {
      toast.error('As senhas não coincidem.')
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/users/me/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ senhaAtual, novaSenha }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao alterar senha')
      }

      toast.success(data.message || 'Senha alterada com sucesso!')
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SettingsCard title="Segurança">
      <div className="space-y-4">
        <div className="space-y-2">
          <label>Senha atual</label>
          <Input
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            placeholder="Digite sua senha atual"
          />
        </div>

        <div className="space-y-2">
          <label>Nova senha</label>
          <Input
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div className="space-y-2">
          <label>Confirmar nova senha</label>
          <Input
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            placeholder="Repita a nova senha"
          />
        </div>

        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Salvando...' : 'Alterar senha'}
        </Button>
      </div>
    </SettingsCard>
  )
}

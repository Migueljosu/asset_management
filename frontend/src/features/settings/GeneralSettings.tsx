import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/Button'
import { useState, useEffect } from 'react'
import { SettingsCard } from './SettingsCard'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function GeneralSettings() {
  const { token, user } = useAuth()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (token) {
      loadProfile()
    }
  }, [token])

  async function loadProfile() {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao carregar perfil')
      }

      setNome(data.data.nome || '')
      setEmail(data.data.email || '')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!token) {
      toast.error('Sessão inválida. Faça login novamente.')
      return
    }

    if (!nome.trim() || !email.trim()) {
      toast.error('Preencha todos os campos.')
      return
    }

    try {
      setSaving(true)
      const res = await fetch(`${API_URL}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome, email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao atualizar perfil')
      }

      // Atualiza localStorage com os novos dados
      if (user) {
        const updatedUser = { ...user, name: data.data.nome, email: data.data.email }
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }

      toast.success('Perfil atualizado com sucesso!')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <SettingsCard title="Configurações Gerais">
        <p>Carregando...</p>
      </SettingsCard>
    )
  }

  return (
    <SettingsCard title="Configurações Gerais">
      <div className="space-y-4">
        <div className="space-y-2">
          <label>Nome de usuário</label>
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome"
          />
        </div>

        <div className="space-y-2">
          <label>Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
          />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </SettingsCard>
  )
}

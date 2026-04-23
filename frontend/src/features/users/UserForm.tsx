//src/feature/users/UserForm.tsx

import { useEffect, useState } from 'react'
import { User, UserRole, UserStatus } from './types'

type Props = {
  onSubmit: (data: Omit<User, 'id'> | User) => void
  editingUser: User | null
}

export default function UserForm({ onSubmit, editingUser }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<UserRole>('EMPLOYEE')
  const [status, setStatus] = useState<UserStatus>('ACTIVE')

  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name)
      setEmail(editingUser.email)
      setRole(editingUser.role)
      setStatus(editingUser.status)
      // NÃO preenchemos senha ao editar
      setPassword('')
      setConfirmPassword('')
    } else {
      resetForm()
    }
  }, [editingUser])

  const resetForm = () => {
    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setRole('EMPLOYEE')
    setStatus('ACTIVE')
    setErrors({})
  }

  const validate = () => {
    const newErrors: typeof errors = {}

    if (!name.trim()) newErrors.name = 'Nome é obrigatório'

    if (!email.trim()) newErrors.email = 'Email é obrigatório'
    else if (!email.includes('@')) newErrors.email = 'Email inválido'

    // Validar senha apenas se estiver criando OU se usuário preencher para alterar
    if (!editingUser || password || confirmPassword) {
      if (!password) newErrors.password = 'Senha é obrigatória'
      else if (password.length < 6)
        newErrors.password = 'Senha deve ter pelo menos 6 caracteres'

      if (password !== confirmPassword)
        newErrors.confirmPassword = 'Senhas não coincidem'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    try {
      const userData: Omit<User, 'id'> | User = editingUser
        ? {
            id: editingUser.id,
            name,
            email,
            role,
            status,
            ...(password ? { password } : {}), // só envia senha se preenchida
          }
        : { name, email, role, status, password }

      await onSubmit(userData)
      resetForm()
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-4">
      <h2 className="text-xl font-semibold">
        {editingUser ? 'Editar Usuário' : 'Cadastrar Usuário'}
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Nome */}
        <div>
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`border rounded px-3 py-2 w-full ${errors.name ? 'border-red-500' : ''}`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`border rounded px-3 py-2 w-full ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Senha */}
        <div>
          <input
            type="password"
            placeholder={editingUser ? 'Nova senha (opcional)' : 'Senha'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`border rounded px-3 py-2 w-full ${errors.password ? 'border-red-500' : ''}`}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        {/* Confirmar Senha */}
        <div>
          <input
            type="password"
            placeholder={editingUser ? 'Confirmar nova senha' : 'Confirmar senha'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`border rounded px-3 py-2 w-full ${errors.confirmPassword ? 'border-red-500' : ''}`}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Role */}
        <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="border rounded px-3 py-2">
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Gestore</option>
          <option value="TECHNICIAN">Técnico de Manutenção</option>
          <option value="EMPLOYEE">Funcionário</option>
        </select>

        {/* Status */}
        <select value={status} onChange={(e) => setStatus(e.target.value as UserStatus)} className="border rounded px-3 py-2">
          <option value="ACTIVE">Ativo</option>
          <option value="BLOCKED">Bloqueado</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`px-4 py-2 rounded text-white transition ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Salvando...' : editingUser ? 'Atualizar' : 'Cadastrar'}
      </button>
    </form>
  )
}

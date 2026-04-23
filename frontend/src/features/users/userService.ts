import { User, UserRole } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type ApiUser = {
  id: number
  nome: string
  email: string
  perfil: UserRole
}

type CreateUserInput = {
  name: string
  email: string
  password: string
  role: UserRole
}

type UpdateUserInput = {
  id: number
  name: string
  email: string
  role: UserRole
  password?: string
}

export type { CreateUserInput, UpdateUserInput }

async function handleResponse(res: Response) {
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Erro na requisição')
  }

  return data
}

function mapUser(user: ApiUser): User {
  return {
    id: user.id,
    name: user.nome,
    email: user.email,
    role: user.perfil,
  }
}

export async function getUsers(token: string): Promise<User[]> {
  const res = await fetch(`${API_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await handleResponse(res)
  return data.data.map(mapUser)
}

export async function createUser(token: string, user: CreateUserInput): Promise<User> {
  const res = await fetch(`${API_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      nome: user.name,
      email: user.email,
      senha: user.password,
      perfil: user.role,
    }),
  })

  const data = await handleResponse(res)
  return mapUser(data.data)
}

export async function updateUser(token: string, updatedUser: UpdateUserInput): Promise<User> {
  const res = await fetch(`${API_URL}/api/users/${updatedUser.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      nome: updatedUser.name,
      email: updatedUser.email,
      perfil: updatedUser.role,
      ...(updatedUser.password ? { senha: updatedUser.password } : {}),
    }),
  })

  const data = await handleResponse(res)
  return mapUser(data.data)
}

export async function deleteUser(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  await handleResponse(res)
}

export const userService = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
}

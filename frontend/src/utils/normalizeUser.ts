import { User } from '@/types/auth'

export function normalizeUser(apiUser: any): User {
  return {
    id: apiUser.id,
    nome: apiUser.nome,
    email: apiUser.email,
    role: apiUser.perfil,
  }
}
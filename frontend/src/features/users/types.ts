//src/feature/users/types.ts

export type UserRole =
  | 'admin'
  | 'tecnico'
  | 'funcionario'

export type User = {
  id: number
  name: string
  email: string
  password?: string
  role: UserRole
}

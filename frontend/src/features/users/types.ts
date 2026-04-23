//src/feature/users/types.ts

export type UserRole =
  | 'ADMIN'
  | 'EMPLOYEE'
  | 'TECHNICIAN'
  | 'MANAGER'

export type UserStatus =
  | 'ACTIVE'
  | 'BLOCKED'

export type User = {
  id: number
  name: string
  email: string
   password?: string
  role: UserRole
  status: UserStatus
}
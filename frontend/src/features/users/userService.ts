//src/feature/users/UserService.ts

import { User } from './types'

let users: User[] = [
  {
    id: 1,
    name: 'Pedro Alfredo',
    email: 'pedro@email.com',
    role: 'ADMIN',
    status: 'ACTIVE',
  },
  {
    id: 2,
    name: 'Carlos Mendes',
    email: 'carlos@email.com',
    role: 'TECHNICIAN',
    status: 'ACTIVE',
  },
]

export function getUsers(): Promise<User[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(users), 500)
  })
}

export function createUser(user: Omit<User, 'id'>): Promise<User> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser = { ...user, id: Date.now() }
      users.push(newUser)
      resolve(newUser)
    }, 500)
  })
}

export function updateUser(updatedUser: User): Promise<User> {
  return new Promise((resolve) => {
    setTimeout(() => {
      users = users.map((u) =>
        u.id === updatedUser.id ? updatedUser : u
      )
      resolve(updatedUser)
    }, 500)
  })
}

export function deleteUser(id: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      users = users.filter((u) => u.id !== id)
      resolve()
    }, 500)
  })
}
export const userService = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
}
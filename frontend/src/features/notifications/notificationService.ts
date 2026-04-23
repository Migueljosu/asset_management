import api from '@/lib/api'

export interface Notification {
  id: number
  userId: number
  titulo: string
  mensagem: string
  tipo: string
  lida: boolean
  createdAt: string
}

export async function getNotifications(token: string) {
  const res = await api.get('/notifications', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function markAsRead(id: number, token: string) {
  const res = await api.put(`/notifications/${id}/read`, null, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function markAllAsRead(token: string) {
  const res = await api.put('/notifications/read-all', null, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function deleteNotification(id: number, token: string) {
  const res = await api.delete(`/notifications/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}


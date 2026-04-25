import { useEffect, useState } from 'react'
import { Package, AlertTriangle, Users, Activity } from 'lucide-react'
import { DashboardStats } from './types'
import StateCard from './StatsCard'
import { useAuth } from '@/context/AuthContext'
import { fetchDashboardStats } from './Api'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

export default function DashboardFeature() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const { user, token } = useAuth()

  useEffect(() => {
    if (!token) return

    fetchDashboardStats(token)
      .then((res) => {
        setData(res)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p>Loading dashboard...</p>
      </div>
    )
  }

  if (!data || !user) return null

  const role = user.role

  // 🔥 CONFIG DOS CARDS
  const cards = [
    {
      title: 'Equipamentos',
      description: `${data.totalEquipments} total`,
      icon: <Package />,
      roles: ['admin', 'tecnico', 'funcionario'],
      extra: (
        <>
          Disponível: {data.byStatus.disponivel} • Em uso: {data.byStatus.em_uso} • Manutenção:{' '}
          {data.byStatus.manutencao}
        </>
      ),
      
    },
    {
      title: 'Anomalias',
      description: `${data.totalAnomalies} ativas`,
      icon: <AlertTriangle />,
      roles: ['admin', 'tecnico'],
    },
    {
      title: 'Utilizadores',
      description: `${data.activeUsers} ativos`,
      icon: <Users />,
      roles: ['admin'],
    },
    {
      title: 'Performance',
      description: `${data.performance}% eficiência`,
      icon: <Activity />,
      roles: ['admin', 'tecnico'],
    },
  ]

  const visibleCards = cards.filter((card) => card.roles.includes(role))

  return (
    <div className="space-y-10">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleCards.map((card) => (
          <StateCard
            key={card.title}
            title={card.title}
            description={card.description}
            icon={card.icon}
            extra={card.extra}
          />
        ))}
      </div>

      {/* Gráfico */}
      {(role === 'admin' || role === 'tecnico') && (
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Performance Mensal</h2>

          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Package, AlertTriangle, Users, Activity } from 'lucide-react'
import { fetchDashboardStats } from '../dashboard/Api'
import { DashboardStats } from '../dashboard/types'
import StateCard from '../dashboard/StatsCard'
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

  useEffect(() => {
    fetchDashboardStats().then((res) => {
      setData(res)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p>Loading dashboard...</p>
      </div>
    )
  }

  if (!data) return null

  return (
  <div className="space-y-10">
  

    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Overview of system metrics
      </p>
    </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StateCard
          title="Equipamentos"
          description={`${data.totalEquipments} registados`}
          icon={<Package />}
        />
        <StateCard
          title="Anomalias"
          description={`${data.totalAnomalies} ativas`}
          icon={<AlertTriangle />}
        />
        <StateCard
          title="Utilizadores"
          description={`${data.activeUsers} ativos`}
          icon={<Users />}
        />
        <StateCard
          title="Performance"
          description={`${data.performance}% eficiência`}
          icon={<Activity />}
        />
      </div>

      {/* Gráfico */}
      <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          Performance Mensal
        </h2>

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
    </div>
  )
}


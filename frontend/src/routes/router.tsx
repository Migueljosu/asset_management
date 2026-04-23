//route
import { createBrowserRouter, redirect } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import DashboardLayout from '@/layouts/DashboardLayout'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'

// Pages
import DashboardPage from '@/pages/DasboardPage'
import RoleRedirect from '@/pages/RoleRedirect'

// Features
import EquipmentList from '@/features/equipment/EquipmentList'
import AnomalyList from '@/features/anomalies/AnomalyList'
import SettingsPage from '@/features/settings/SettingsPage'
import ReportsPage from '@/features/reports/ReportsPage'
import UsersPage from '@/features/users/UsersPage'
import LoansPage from '@/features/saves/LoansPage'
import AnomalyPage from '@/features/anomalies/AnomalyPage'
import MaintenancePage from '@/features/manutention/MaintenancePage'

// Lazy
const Login = lazy(() => import('../pages/Login'))
const Dashboard = lazy(() => import('../features/dashboard/Dashboard'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-10 w-10 border-b-2 border-blue-500"></div>
    </div>
  )
}

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
)

export const router = createBrowserRouter([
  // 🔓 PUBLIC
  {
    path: '/login',
    element: withSuspense(<Login />),
  },

  // 🔐 PROTECTED DASHBOARD
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: withSuspense(<RoleRedirect />) },

      // 📊 dashboards
      { path: 'dashboard', element: withSuspense(<DashboardPage />) },
      { path: 'dashboardPessoal', element: withSuspense(<Dashboard />) },

      // ⚠️ anomalies
      { path: 'anomalies', element: withSuspense(<AnomalyPage />) },
      { path: 'fastactions', element: withSuspense(<AnomalyList />) },

      // 👥 users (admin only)
      {
        path: 'users',
        element: <RoleRoute allowed={['admin']}>{withSuspense(<UsersPage />)}</RoleRoute>,
      },

      // ⚙️ settings (admin)
      {
        path: 'settings',
        element: <RoleRoute allowed={['admin']}>{withSuspense(<SettingsPage />)}</RoleRoute>,
      },

      // 💰 loans
      { path: 'saves', element: withSuspense(<LoansPage />) },

      // 🖥️ equipment
      { path: 'equipments', element: withSuspense(<EquipmentList />) },

      // 🔧 maintenance (tecnico)
      {
        path: 'manutention',
        element: (
          <RoleRoute allowed={['tecnico', 'admin']}>{withSuspense(<MaintenancePage />)}</RoleRoute>
        ),
      },

      // 📊 reports (admin)
      {
        path: 'reports',
        element: <RoleRoute allowed={['admin']}>{withSuspense(<ReportsPage />)}</RoleRoute>,
      },

      { path: '*', loader: () => redirect('/') },
    ],
  },
])

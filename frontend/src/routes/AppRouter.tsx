import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { NotFoundPage } from '@/pages/common/NotFoundPage'
import { SettingsPage } from '@/pages/common/SettingsPage'
import { UnauthorizedPage } from '@/pages/common/UnauthorizedPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { LoginPage } from '@/pages/login/LoginPage'
import { ProjectDetailPage } from '@/pages/projects/ProjectDetailPage'
import { ProjectsPage } from '@/pages/projects/ProjectsPage'
import { ReportsPage } from '@/pages/reports/ReportsPage'
import { UsersPage } from '@/pages/users/UsersPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

function HomeRedirect() {
  const { hasAnyRole } = useAuth()
  if (hasAnyRole('ADMIN', 'CTO')) {
    return <Navigate to="/dashboard" replace />
  }
  return <Navigate to="/reports" replace />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<HomeRedirect />} />
          <Route element={<ProtectedRoute roles={['ADMIN', 'CTO']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Route>
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

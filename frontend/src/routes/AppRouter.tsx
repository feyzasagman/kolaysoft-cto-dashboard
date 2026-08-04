import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AppShell } from '@/layouts/AppShell'
import { NotFoundPage } from '@/pages/common/NotFoundPage'
import { SettingsPage } from '@/pages/common/SettingsPage'
import { UnauthorizedPage } from '@/pages/common/UnauthorizedPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { LoginPage } from '@/pages/login/LoginPage'
import { ProjectDetailPage } from '@/pages/projects/ProjectDetailPage'
import { ProjectsPage } from '@/pages/projects/ProjectsPage'
import { ReportsPage } from '@/pages/reports/ReportsPage'
import { WeeklyReportDetailPage } from '@/pages/reports/WeeklyReportDetailPage'
import { WeeklyReportEditPage } from '@/pages/reports/WeeklyReportEditPage'
import { WeeklyReportNewPage } from '@/pages/reports/WeeklyReportNewPage'
import { UsersPage } from '@/pages/users/UsersPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

function HomeRedirect() {
  const { hasAnyRole } = useAuth()
  if (hasAnyRole('ADMIN', 'CTO')) {
    return <Navigate to="/dashboard" replace />
  }
  return <Navigate to="/projects" replace />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<HomeRedirect />} />

          <Route element={<ProtectedRoute roles={['ADMIN', 'CTO']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={['ADMIN', 'CTO', 'PROJECT_MANAGER']} />}>
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          </Route>

          <Route path="/reports" element={<ReportsPage />} />
          <Route
            element={<ProtectedRoute roles={['ADMIN', 'PROJECT_MANAGER']} />}
          >
            <Route path="/reports/new" element={<WeeklyReportNewPage />} />
            <Route path="/reports/:id/edit" element={<WeeklyReportEditPage />} />
          </Route>
          <Route path="/reports/:id" element={<WeeklyReportDetailPage />} />

          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

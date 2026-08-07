import { Box } from '@mui/material'
import { Navigate, useNavigate } from 'react-router-dom'
import { EmptyState, ErrorState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { ProjectPortfolioSkeleton } from '@/components/portfolio/ProjectPortfolioSkeleton'
import { ProjectList } from '@/components/projects/ProjectList'
import { useAuth } from '@/contexts/AuthContext'
import { useAssignedProjects } from '@/hooks/useApiQueries'
import { getHttpStatus } from '@/utils/errorUtils'
import { AdminProjectsView } from '@/pages/projects/AdminProjectsView'

export function ProjectsPage() {
  const { hasAnyRole } = useAuth()
  const isManagerOnly = hasAnyRole('PROJECT_MANAGER') && !hasAnyRole('ADMIN', 'CTO')
  const isAdminOrCto = hasAnyRole('ADMIN', 'CTO')

  if (isAdminOrCto) {
    return <AdminProjectsView />
  }

  if (!isManagerOnly) {
    return <Navigate to="/unauthorized" replace />
  }

  return <ManagerProjectsView canCreateReport />
}

function ManagerProjectsView({ canCreateReport }: { canCreateReport: boolean }) {
  const navigate = useNavigate()
  const query = useAssignedProjects(true)

  if (query.isLoading && !query.data) {
    return <ProjectPortfolioSkeleton />
  }

  if (query.isError) {
    const status = getHttpStatus(query.error)
    if (status === 403) {
      return <Navigate to="/unauthorized" replace />
    }
    return <ErrorState title="Projeler alınamadı." onRetry={() => void query.refetch()} />
  }

  const projects = query.data ?? []

  return (
    <Box>
      <PageHeader
        title="Projects"
        subtitle="Size atanmış projeler. Haftalık rapor oluşturabilir ve detaya gidebilirsiniz."
      />

      {projects.length === 0 ? (
        <EmptyState
          title="Henüz görünür proje yok"
          description="Backend’de Project Manager için ayrı bir proje listesi endpointi bulunmuyor. Daha önce oluşturduğunuz raporlar veya bilinen proje bağlantıları üzerinden projeler burada listelenir."
          actionLabel="Rapor listesi"
          onAction={() => navigate('/reports')}
        />
      ) : (
        <ProjectList projects={projects} canCreateReport={canCreateReport} />
      )}
    </Box>
  )
}

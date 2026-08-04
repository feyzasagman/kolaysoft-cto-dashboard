import { Box, Skeleton, Stack, Typography } from '@mui/material'
import { Navigate, useNavigate } from 'react-router-dom'
import { EmptyState, ErrorState } from '@/components/common/EmptyState'
import { ProjectList } from '@/components/projects/ProjectList'
import { useAuth } from '@/contexts/AuthContext'
import { useAssignedProjects } from '@/hooks/useApiQueries'
import { getHttpStatus } from '@/utils/errorUtils'
import { AdminProjectsView } from '@/pages/projects/AdminProjectsView'

function ProjectsSkeleton() {
  return (
    <Stack spacing={1.5}>
      <Skeleton width={220} height={32} />
      <Skeleton width="60%" height={20} />
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <Skeleton variant="rounded" height={180} />
        <Skeleton variant="rounded" height={180} />
      </Box>
    </Stack>
  )
}

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
    return <ProjectsSkeleton />
  }

  if (query.isError) {
    const status = getHttpStatus(query.error)
    if (status === 403) {
      return <Navigate to="/unauthorized" replace />
    }
    return (
      <ErrorState
        title="Projeler alınamadı."
        onRetry={() => void query.refetch()}
      />
    )
  }

  const projects = query.data ?? []

  return (
    <Box>
      <Typography variant="h1" sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' } }} mb={0.5}>
        Projelerim
      </Typography>
      <Typography color="text.secondary" mb={2.5}>
        Size atanmış projeler. Haftalık rapor oluşturabilir ve detaya gidebilirsiniz.
      </Typography>

      {projects.length === 0 ? (
        <EmptyState
          title="Henüz görünür proje yok"
          description="Backend’de Project Manager için ayrı bir proje listesi endpointi bulunmuyor. Daha önce oluşturduğunuz raporlar veya bilinen proje bağlantıları üzerinden projeler burada listelenir. İlk rapor için /reports/new?projectId=… kullanın."
          actionLabel="Rapor listesi"
          onAction={() => navigate('/reports')}
        />
      ) : (
        <ProjectList projects={projects} canCreateReport={canCreateReport} />
      )}
    </Box>
  )
}

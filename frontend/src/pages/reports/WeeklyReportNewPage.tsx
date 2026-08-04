import { Box, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { WeeklyReportForm } from '@/components/reports/WeeklyReportForm'
import { useAuth } from '@/contexts/AuthContext'
import { useAssignedProjects, useCreateWeeklyReport, useDashboardProjects } from '@/hooks/useApiQueries'
import type { AssignedProjectRow, WeeklyReportRequest } from '@/types/api'
import { getErrorMessage, getFieldErrors, getHttpStatus } from '@/utils/errorUtils'
import { rememberProjectId } from '@/utils/projectCache'

export function WeeklyReportNewPage() {
  const { hasAnyRole } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projectIdParam = Number(searchParams.get('projectId') || 0) || null
  const [submitError, setSubmitError] = useState<string | null>(null)

  const canWrite = hasAnyRole('ADMIN', 'PROJECT_MANAGER')
  const isCtoOnly = hasAnyRole('CTO') && !hasAnyRole('ADMIN', 'PROJECT_MANAGER')
  const useAdminList = hasAnyRole('ADMIN')

  const assignedQuery = useAssignedProjects(hasAnyRole('PROJECT_MANAGER'))
  const adminProjectsQuery = useDashboardProjects(
    { page: 0, size: 100, sort: 'name,asc' },
    useAdminList,
  )

  const createMutation = useCreateWeeklyReport()

  useEffect(() => {
    if (projectIdParam) rememberProjectId(projectIdParam)
  }, [projectIdParam])

  const projects: AssignedProjectRow[] = useMemo(() => {
    if (useAdminList) {
      return (adminProjectsQuery.data?.content ?? []).map((row) => ({
        projectId: row.projectId,
        code: row.code,
        name: row.name,
        customer: null,
        projectStatus: row.projectStatus,
        startDate: null,
        targetEndDate: null,
        latestReportYear: row.latestReportYear,
        latestReportWeek: row.latestReportWeek,
        hasCurrentWeekReport: row.hasCurrentWeekReport,
      }))
    }

    const list = [...(assignedQuery.data ?? [])]
    if (projectIdParam && !list.some((p) => p.projectId === projectIdParam)) {
      list.push({
        projectId: projectIdParam,
        code: `#${projectIdParam}`,
        name: `Proje ${projectIdParam}`,
        customer: null,
        projectStatus: 'ACTIVE',
        startDate: null,
        targetEndDate: null,
        latestReportYear: null,
        latestReportWeek: null,
        hasCurrentWeekReport: false,
      })
    }
    return list
  }, [useAdminList, adminProjectsQuery.data, assignedQuery.data, projectIdParam])

  if (isCtoOnly || !canWrite) {
    return <Navigate to="/unauthorized" replace />
  }

  const loading = useAdminList
    ? adminProjectsQuery.isLoading && !adminProjectsQuery.data
    : assignedQuery.isLoading && !assignedQuery.data && !projectIdParam

  if (loading) {
    return <LoadingState label="Form hazırlanıyor…" />
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        title="Rapor oluşturulacak proje yok"
        description="Önce size atanmış bir proje görünür olmalıdır. Project Manager için /reports/new?projectId=… bağlantısını kullanabilirsiniz."
        actionLabel="Projelere dön"
        onAction={() => navigate('/projects')}
      />
    )
  }

  return (
    <Box>
      <Typography variant="h1" sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' } }} mb={2}>
        Yeni Haftalık Rapor
      </Typography>
      <WeeklyReportForm
        mode="create"
        projects={projects}
        lockedProjectId={projectIdParam}
        submitError={submitError}
        submitting={createMutation.isPending}
        onCancel={() => navigate(-1)}
        onSubmit={async (payload) => {
          setSubmitError(null)
          try {
            const report = await createMutation.mutateAsync(payload as WeeklyReportRequest)
            toast.success('Haftalık rapor oluşturuldu.')
            if (report?.projectId) rememberProjectId(report.projectId)
            navigate(`/reports/${report.id}`, { replace: true })
          } catch (error) {
            const status = getHttpStatus(error)
            if (status === 403) {
              navigate('/unauthorized')
              return
            }
            const fields = getFieldErrors(error)
            const fieldMsg = Object.values(fields)[0]
            setSubmitError(fieldMsg || getErrorMessage(error, 'Rapor oluşturulamadı.'))
            toast.error(fieldMsg || getErrorMessage(error, 'Rapor oluşturulamadı.'))
          }
        }}
      />
    </Box>
  )
}

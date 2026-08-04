import { Box, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ErrorState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { WeeklyReportForm } from '@/components/reports/WeeklyReportForm'
import { useAuth } from '@/contexts/AuthContext'
import { useAssignedProjects, useUpdateWeeklyReport, useWeeklyReport } from '@/hooks/useApiQueries'
import type { AssignedProjectRow, WeeklyReportUpdateRequest } from '@/types/api'
import { getErrorMessage, getFieldErrors, getHttpStatus } from '@/utils/errorUtils'

export function WeeklyReportEditPage() {
  const { id } = useParams()
  const reportId = Number(id)
  const { hasAnyRole } = useAuth()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const canWrite = hasAnyRole('ADMIN', 'PROJECT_MANAGER')
  const reportQuery = useWeeklyReport(Number.isFinite(reportId) ? reportId : null)
  const assignedQuery = useAssignedProjects(hasAnyRole('PROJECT_MANAGER'))
  const updateMutation = useUpdateWeeklyReport(reportId)

  const projects: AssignedProjectRow[] = useMemo(() => {
    if (reportQuery.data) {
      return [
        {
          projectId: reportQuery.data.projectId,
          code: reportQuery.data.projectCode,
          name: reportQuery.data.projectName,
          customer: null,
          projectStatus: reportQuery.data.projectStatus ?? 'ACTIVE',
          startDate: null,
          targetEndDate: null,
          latestReportYear: reportQuery.data.year,
          latestReportWeek: reportQuery.data.weekNumber,
          hasCurrentWeekReport: true,
        },
      ]
    }
    return assignedQuery.data ?? []
  }, [reportQuery.data, assignedQuery.data])

  if (!canWrite) {
    return <Navigate to="/unauthorized" replace />
  }

  if (!Number.isFinite(reportId)) {
    return <ErrorState title="Geçersiz rapor kimliği." />
  }

  if (reportQuery.isLoading) {
    return <LoadingState label="Rapor yükleniyor…" />
  }

  if (reportQuery.isError || !reportQuery.data) {
    const status = getHttpStatus(reportQuery.error)
    if (status === 403) return <Navigate to="/unauthorized" replace />
    return <ErrorState onRetry={() => void reportQuery.refetch()} />
  }

  return (
    <Box>
      <Typography variant="h1" sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' } }} mb={2}>
        Raporu Düzenle
      </Typography>
      <WeeklyReportForm
        mode="edit"
        projects={projects}
        initial={reportQuery.data}
        submitError={submitError}
        submitting={updateMutation.isPending}
        onCancel={() => navigate(`/reports/${reportId}`)}
        onSubmit={async (payload) => {
          setSubmitError(null)
          try {
            await updateMutation.mutateAsync(payload as WeeklyReportUpdateRequest)
            toast.success('Rapor güncellendi.')
            navigate(`/reports/${reportId}`, { replace: true })
          } catch (error) {
            const status = getHttpStatus(error)
            if (status === 403) {
              navigate('/unauthorized')
              return
            }
            const fields = getFieldErrors(error)
            const fieldMsg = Object.values(fields)[0]
            setSubmitError(fieldMsg || getErrorMessage(error, 'Rapor güncellenemedi.'))
            toast.error(fieldMsg || getErrorMessage(error, 'Rapor güncellenemedi.'))
          }
        }}
      />
    </Box>
  )
}

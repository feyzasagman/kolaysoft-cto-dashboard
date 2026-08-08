import { Box, Button, Skeleton, Stack } from '@mui/material'
import { useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AppErrorState } from '@/components/common/AppErrorState'
import { RiskIssueList } from '@/components/reports/RiskIssueList'
import { WeeklyReportHero } from '@/components/reports/WeeklyReportHero'
import { WeeklyReportSummary } from '@/components/reports/WeeklyReportSummary'
import { WorkItemList } from '@/components/reports/WorkItemList'
import { useAuth } from '@/contexts/AuthContext'
import { useWeeklyReport } from '@/hooks/useApiQueries'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import { getHttpStatus } from '@/utils/errorUtils'
import { rememberProjectId } from '@/utils/projectCache'

function WeeklyReportDetailSkeleton() {
  return (
    <Box aria-busy="true" aria-label="Rapor detayı yükleniyor" className="fade-in">
      <Box sx={{ ...surfaceSx, p: DASH.space3, mb: DASH.space3 }}>
        <Skeleton width={200} height={16} sx={{ mb: 2 }} />
        <Skeleton width="40%" height={36} />
        <Skeleton width="55%" height={22} sx={{ mt: 1 }} />
        <Skeleton variant="rounded" height={100} sx={{ mt: 2, maxWidth: 480 }} />
      </Box>
      <Box sx={{ ...surfaceSx, maxWidth: 880, mx: 'auto', p: DASH.space3 }}>
        <Stack spacing={2}>
          <Skeleton height={80} />
          <Skeleton height={120} />
          <Skeleton height={160} />
          <Skeleton height={160} />
        </Stack>
      </Box>
    </Box>
  )
}

export function WeeklyReportDetailPage() {
  const { id } = useParams()
  const reportId = Number(id)
  const navigate = useNavigate()
  const { hasAnyRole } = useAuth()
  const reportQuery = useWeeklyReport(Number.isFinite(reportId) ? reportId : null)

  const canEdit = hasAnyRole('ADMIN', 'PROJECT_MANAGER')

  useEffect(() => {
    if (reportQuery.data?.projectId) {
      rememberProjectId(reportQuery.data.projectId)
    }
  }, [reportQuery.data?.projectId])

  if (!Number.isFinite(reportId)) {
    return <AppErrorState kind="notFound" title="Geçersiz rapor kimliği." />
  }

  if (reportQuery.isLoading) {
    return <WeeklyReportDetailSkeleton />
  }

  if (reportQuery.isError || !reportQuery.data) {
    const status = getHttpStatus(reportQuery.error)
    if (status === 403) return <Navigate to="/unauthorized" replace />
    if (status === 404) {
      return (
        <AppErrorState
          kind="notFound"
          title="Rapor bulunamadı."
          onRetry={() => void reportQuery.refetch()}
          secondaryAction={
            <Button variant="outlined" onClick={() => navigate('/reports')}>
              Listeye Dön
            </Button>
          }
        />
      )
    }
    if (status === 401) {
      return <AppErrorState kind="unauthorized" onRetry={() => void reportQuery.refetch()} />
    }
    return (
      <AppErrorState
        kind="network"
        title="Rapor bilgileri alınamadı."
        onRetry={() => void reportQuery.refetch()}
      />
    )
  }

  const report = reportQuery.data

  return (
    <Box>
      <WeeklyReportHero
        report={report}
        canEdit={canEdit}
        onEdit={() => navigate(`/reports/${reportId}/edit`)}
      />

      <Box
        sx={{
          maxWidth: 880,
          mx: 'auto',
          ...surfaceSx,
          px: { xs: DASH.space2, md: 4 },
          py: { xs: DASH.space2, md: DASH.space4 },
        }}
        className="fade-in-up"
      >
        <WeeklyReportSummary report={report} />

        <Box
          component="section"
          sx={{
            py: DASH.space3,
            borderTop: DASH.border,
            borderColor: 'divider',
          }}
        >
          <RiskIssueList reportId={reportId} canEdit={canEdit} />
        </Box>

        <Box
          component="section"
          sx={{
            py: DASH.space3,
            borderTop: DASH.border,
            borderColor: 'divider',
          }}
        >
          <WorkItemList reportId={reportId} canEdit={canEdit} />
        </Box>
      </Box>
    </Box>
  )
}

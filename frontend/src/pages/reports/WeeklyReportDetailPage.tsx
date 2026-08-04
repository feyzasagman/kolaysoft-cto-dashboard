import { Box, Button, Stack, Typography } from '@mui/material'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { RiskIssueList } from '@/components/reports/RiskIssueList'
import { WeeklyReportSummary } from '@/components/reports/WeeklyReportSummary'
import { WorkItemList } from '@/components/reports/WorkItemList'
import { useAuth } from '@/contexts/AuthContext'
import { useWeeklyReport } from '@/hooks/useApiQueries'
import { getHttpStatus } from '@/utils/errorUtils'
import { rememberProjectId } from '@/utils/projectCache'
import { useEffect } from 'react'

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
    return <ErrorState title="Geçersiz rapor kimliği." />
  }

  if (reportQuery.isLoading) {
    return <LoadingState label="Rapor detayı yükleniyor…" />
  }

  if (reportQuery.isError || !reportQuery.data) {
    const status = getHttpStatus(reportQuery.error)
    if (status === 403) return <Navigate to="/unauthorized" replace />
    return <ErrorState onRetry={() => void reportQuery.refetch()} />
  }

  const report = reportQuery.data

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={1.5}
        mb={2}
      >
        <Box>
          <Typography variant="h1" sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
            Haftalık Rapor Detayı
          </Typography>
          <Typography color="text.secondary">
            {report.projectCode} · {report.year} / Hafta {report.weekNumber}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Button variant="outlined" onClick={() => navigate('/reports')} aria-label="Rapor listesine dön">
            Listeye Dön
          </Button>
          {canEdit && (
            <Button
              variant="contained"
              onClick={() => navigate(`/reports/${reportId}/edit`)}
              aria-label="Raporu düzenle"
            >
              Düzenle
            </Button>
          )}
        </Stack>
      </Stack>

      <Stack spacing={2}>
        <WeeklyReportSummary report={report} />
        <WorkItemList reportId={reportId} canEdit={canEdit} />
        <RiskIssueList reportId={reportId} canEdit={canEdit} />
      </Stack>
    </Box>
  )
}

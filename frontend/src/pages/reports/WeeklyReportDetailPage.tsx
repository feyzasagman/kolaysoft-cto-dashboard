import { Box, Button, Stack, Typography } from '@mui/material'
import { useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AppErrorState } from '@/components/common/AppErrorState'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { RiskIssueList } from '@/components/reports/RiskIssueList'
import { WeeklyReportSummary } from '@/components/reports/WeeklyReportSummary'
import { WorkItemList } from '@/components/reports/WorkItemList'
import { useAuth } from '@/contexts/AuthContext'
import { useWeeklyReport } from '@/hooks/useApiQueries'
import { getHttpStatus } from '@/utils/errorUtils'
import { rememberProjectId } from '@/utils/projectCache'

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
    return <LoadingState label="Rapor detayı yükleniyor…" />
  }

  if (reportQuery.isError || !reportQuery.data) {
    const status = getHttpStatus(reportQuery.error)
    if (status === 403) return <Navigate to="/unauthorized" replace />
    if (status === 404) {
      return (
        <AppErrorState
          kind="notFound"
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
    return <AppErrorState kind="network" onRetry={() => void reportQuery.refetch()} />
  }

  const report = reportQuery.data

  return (
    <Box>
      <PageHeader
        title="Haftalık Rapor"
        subtitle={`${report.projectCode} · ${report.year} / Hafta ${report.weekNumber}`}
        meta={
          <Typography variant="caption" color="text.secondary">
            Notion tarzı okuma görünümü · salt içerik odaklı
          </Typography>
        }
        actions={
          <>
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
          </>
        }
      />

      <Box
        sx={{
          maxWidth: 880,
          mx: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1.5,
          bgcolor: 'background.paper',
          px: { xs: 2, md: 4 },
          py: { xs: 2.5, md: 4 },
          boxShadow: 1,
        }}
        className="fade-in-up"
      >
        <Stack spacing={2.5}>
          <WeeklyReportSummary report={report} />
          <Box>
            <Typography variant="h5" component="h2" mb={0.5}>
              Issues & Risk
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={1.25}>
              Bu haftaya bağlı risk ve engeller
            </Typography>
            <RiskIssueList reportId={reportId} canEdit={canEdit} />
          </Box>
          <Box>
            <Typography variant="h5" component="h2" mb={0.5}>
              Work Items
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={1.25}>
              Planlanan ve tamamlanan iş kalemleri
            </Typography>
            <WorkItemList reportId={reportId} canEdit={canEdit} />
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}

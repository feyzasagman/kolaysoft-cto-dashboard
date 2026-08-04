import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material'
import { useEffect } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/common/EmptyState'
import { HealthBadge, StatusBadge } from '@/components/common/StatusBadges'
import { LoadingState } from '@/components/common/LoadingState'
import { ProjectActivityCalendar } from '@/components/dashboard/ProjectActivityCalendar'
import { ProjectProgress } from '@/components/dashboard/ProjectProgress'
import { useAuth } from '@/contexts/AuthContext'
import { useProjectDetail } from '@/hooks/useApiQueries'
import { formatShortDate } from '@/utils/labels'
import { rememberProjectId } from '@/utils/projectCache'
import {
  ACTIVITY_EMPTY_MESSAGE,
  buildDerivedActivityFromHistory,
} from '@/utils/projectActivity'

export function ProjectDetailPage() {
  const { projectId } = useParams()
  const id = Number(projectId)
  const { hasAnyRole } = useAuth()
  const canCreateReport = hasAnyRole('ADMIN', 'PROJECT_MANAGER')
  const { data, isLoading, isError, refetch } = useProjectDetail(Number.isFinite(id) ? id : null)

  useEffect(() => {
    if (data?.projectId) rememberProjectId(data.projectId)
  }, [data?.projectId])

  if (isLoading) {
    return <LoadingState label="Proje detayı yükleniyor..." fullHeight />
  }

  if (isError || !data) {
    return <ErrorState onRetry={() => void refetch()} />
  }

  const latestYear = data.latestReport?.year ?? null
  const latestWeek = data.latestReport?.weekNumber ?? null

  const activity = buildDerivedActivityFromHistory(
    data.lastFiveReports ?? [],
    {
      openRiskCount: data.openRisks,
      criticalRiskCount: 0,
      openBlockerCount: data.openBlockers,
      hasCurrentWeekReport: false,
      latestReportDate: data.latestReport?.submittedAt?.slice(0, 10) ?? null,
      latestReportYear: latestYear,
      latestReportWeek: latestWeek,
    },
    26,
  )

  return (
    <Box>
      <Stack direction="row" spacing={1} mb={2} useFlexGap flexWrap="wrap">
        <Button component={RouterLink} to="/projects" aria-label="Proje listesine dön">
          ← Projeler
        </Button>
        {canCreateReport && (
          <Button
            component={RouterLink}
            to={`/reports/new?projectId=${data.projectId}`}
            variant="contained"
            aria-label="Haftalık rapor oluştur"
          >
            Haftalık Rapor Oluştur
          </Button>
        )}
      </Stack>

      <Paper sx={{ p: 2.5, mb: 2 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          spacing={1.5}
          mb={2}
        >
          <Box>
            <Typography variant="h5">{data.name}</Typography>
            <Typography color="text.secondary">{data.code}</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <StatusBadge status={data.projectStatus} />
            <HealthBadge health={data.latestHealth} />
          </Stack>
        </Stack>

        <Typography color="text.secondary" mb={2}>
          {data.description || 'Açıklama bulunmuyor.'}
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap flexWrap="wrap" mb={2}>
          <Typography variant="body2">
            Yönetici: <strong>{data.managerName ?? '—'}</strong>
          </Typography>
          <Typography variant="body2">
            E-posta: <strong>{data.managerEmail ?? '—'}</strong>
          </Typography>
          <Typography variant="body2">
            Başlangıç: <strong>{formatShortDate(data.startDate)}</strong>
          </Typography>
          <Typography variant="body2">
            Hedef bitiş: <strong>{formatShortDate(data.targetEndDate)}</strong>
          </Typography>
        </Stack>

        <ProjectProgress target={data.progressTarget} actual={data.progressActual} />

        <Stack direction="row" spacing={3} mt={2} useFlexGap flexWrap="wrap">
          <Typography variant="body2">
            Açık risk: <strong>{data.openRisks}</strong>
          </Typography>
          <Typography variant="body2">
            Blocker: <strong>{data.openBlockers}</strong>
          </Typography>
          <Typography variant="body2">
            Rapor geçmişi: <strong>{data.reportHistoryCount}</strong>
          </Typography>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2.5, mb: 2 }}>
        <Typography variant="subtitle1" mb={0.5}>
          Proje Aktivitesi
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={1.5}>
          Son 26 haftalık contribution graph benzeri görünüm.
        </Typography>
        <ProjectActivityCalendar
          data={activity}
          emptyMessage={ACTIVITY_EMPTY_MESSAGE}
        />
      </Paper>

      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" mb={1}>
          Son raporlar
        </Typography>
        <Divider sx={{ mb: 1 }} />
        <Stack spacing={1}>
          {(data.lastFiveReports ?? []).length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Rapor geçmişi bulunmuyor.
            </Typography>
          )}
          {(data.lastFiveReports ?? []).map((item) => (
            <Stack
              key={`${item.year}-${item.weekNumber}`}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              justifyContent="space-between"
              sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1 }}
            >
              <Typography variant="body2">
                {item.year}-W{item.weekNumber}
              </Typography>
              <HealthBadge health={item.health} />
              <Typography variant="body2">{item.progressActual ?? 0}%</Typography>
              <Typography variant="caption">{formatShortDate(item.submittedAt)}</Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Box>
  )
}

import {
  Box,
  Breadcrumbs,
  Button,
  Link,
  Stack,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import {
  ProjectStatusBadge,
  ScheduleStatusBadge,
} from '@/components/common/StatusBadges'
import { ReportProgressSummary } from '@/components/reports/ReportProgressSummary'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import type { WeeklyReport } from '@/types/api'
import { formatShortDate } from '@/utils/labels'

interface WeeklyReportHeroProps {
  report: WeeklyReport
  canEdit?: boolean
  onEdit?: () => void
}

export function WeeklyReportHero({
  report,
  canEdit = false,
  onEdit,
}: WeeklyReportHeroProps) {
  return (
    <Box
      component="header"
      className="fade-in"
      sx={{
        ...surfaceSx,
        px: { xs: DASH.space2, md: DASH.space3 },
        py: DASH.space2,
        mb: DASH.space3,
      }}
    >
      <Breadcrumbs aria-label="Sayfa konumu" sx={{ mb: DASH.space2 }}>
        <Link
          component={RouterLink}
          to="/dashboard"
          underline="hover"
          color="text.secondary"
          variant="caption"
          fontWeight={600}
        >
          Kontrol Paneli
        </Link>
        <Link
          component={RouterLink}
          to="/reports"
          underline="hover"
          color="text.secondary"
          variant="caption"
          fontWeight={600}
        >
          Haftalık Raporlar
        </Link>
        <Typography variant="caption" color="text.primary" fontWeight={650} noWrap>
          {report.year} · Hafta {report.weekNumber}
        </Typography>
      </Breadcrumbs>

      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        justifyContent="space-between"
        spacing={DASH.space3}
        alignItems={{ lg: 'flex-start' }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{ fontSize: { xs: '1.5rem', md: '1.875rem' }, mb: 0.75 }}
          >
            {report.year} · {report.weekNumber}. Hafta
          </Typography>
          <Typography variant="h5" component="p" fontWeight={650} mb={0.5}>
            {report.projectName}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={DASH.space2}>
            {report.projectCode} · Rapor tarihi {formatShortDate(report.reportDate)}
          </Typography>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" mb={DASH.space2}>
            {report.projectStatus && <ProjectStatusBadge status={report.projectStatus} />}
            {report.scheduleStatus && <ScheduleStatusBadge status={report.scheduleStatus} />}
          </Stack>

          <ReportProgressSummary
            planned={report.plannedProgress}
            actual={report.actualProgress}
          />
        </Box>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ flexShrink: 0 }}>
          <Button
            component={RouterLink}
            to={`/projects/${report.projectId}?from=reports`}
            variant="outlined"
            aria-label="Projeye dön"
          >
            Projeye Dön
          </Button>
          {canEdit && onEdit && (
            <Button variant="contained" onClick={onEdit} aria-label="Raporu düzenle">
              Düzenle
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  )
}

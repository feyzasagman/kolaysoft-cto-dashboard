import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import {
  ProjectStatusBadge,
  ScheduleStatusBadge,
} from '@/components/common/StatusBadges'
import { DASH } from '@/theme/dashboardTokens'
import type { WeeklyReport } from '@/types/api'
import { formatShortDate } from '@/utils/labels'

interface WeeklyReportListRowProps {
  report: WeeklyReport
}

export function WeeklyReportListRow({ report }: WeeklyReportListRowProps) {
  const navigate = useNavigate()
  const to = `/reports/${report.id}`
  const behind =
    report.actualProgress != null &&
    report.plannedProgress != null &&
    report.actualProgress < report.plannedProgress

  return (
    <Box
      role="row"
      tabIndex={0}
      onClick={() => navigate(to)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(to)
        }
      }}
      aria-label={`${report.projectName}, ${report.year} hafta ${report.weekNumber}`}
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr auto',
          md: 'minmax(180px, 1.8fr) 110px 120px 100px 100px 110px 110px 48px',
        },
        gap: DASH.space2,
        alignItems: 'center',
        px: DASH.space3,
        py: 1.35,
        borderBottom: DASH.border,
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'background-color 140ms ease',
        '&:hover': { bgcolor: 'action.hover' },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: -2,
        },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} noWrap>
          {report.projectName}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap display="block">
          {report.projectCode}
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          sx={{ display: { xs: 'flex', md: 'none' }, mt: 0.75 }}
        >
          <Typography variant="caption" color="text.secondary">
            {report.year} · H{report.weekNumber}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatShortDate(report.reportDate)}
          </Typography>
          {report.scheduleStatus && <ScheduleStatusBadge status={report.scheduleStatus} />}
        </Stack>
      </Box>

      <Typography
        variant="body2"
        fontWeight={650}
        sx={{ display: { xs: 'none', md: 'block' } }}
      >
        {report.year} · H{report.weekNumber}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ display: { xs: 'none', md: 'block' } }}
      >
        {formatShortDate(report.reportDate)}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={650}
        color={behind ? 'warning.dark' : 'text.primary'}
        sx={{ display: { xs: 'none', md: 'block' } }}
      >
        {report.actualProgress != null ? `${report.actualProgress}%` : '—'}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ display: { xs: 'none', md: 'block' } }}
      >
        {report.plannedProgress != null ? `${report.plannedProgress}%` : '—'}
      </Typography>

      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        {report.projectStatus ? (
          <ProjectStatusBadge status={report.projectStatus} />
        ) : (
          <Typography variant="caption" color="text.secondary">
            —
          </Typography>
        )}
      </Box>

      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        {report.scheduleStatus ? (
          <ScheduleStatusBadge status={report.scheduleStatus} />
        ) : (
          <Typography variant="caption" color="text.secondary">
            —
          </Typography>
        )}
      </Box>

      <IconButton
        size="small"
        aria-label="Rapor detayını aç"
        onClick={(e) => {
          e.stopPropagation()
          navigate(to)
        }}
        sx={{ justifySelf: 'end' }}
      >
        <ChevronRightIcon fontSize="small" />
      </IconButton>
    </Box>
  )
}

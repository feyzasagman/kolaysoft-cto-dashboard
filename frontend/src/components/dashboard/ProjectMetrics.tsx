import { Chip, Stack, Typography } from '@mui/material'
import type { ProjectDashboardRow } from '@/types/api'

interface ProjectMetricsProps {
  project: ProjectDashboardRow
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Stack spacing={0.25} sx={{ minWidth: 72 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle2">{value}</Typography>
    </Stack>
  )
}

export function ProjectMetrics({ project }: ProjectMetricsProps) {
  return (
    <Stack spacing={1.25}>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <Metric label="Açık risk" value={project.openRiskCount} />
        <Metric label="Kritik risk" value={project.criticalRiskCount} />
        <Metric label="Blocker" value={project.openBlockerCount} />
        <Metric
          label="Son rapor haftası"
          value={
            project.latestReportYear && project.latestReportWeek
              ? `${project.latestReportYear}-W${project.latestReportWeek}`
              : '—'
          }
        />
      </Stack>
      <Chip
        size="small"
        variant="outlined"
        label={project.hasCurrentWeekReport ? 'Bu hafta rapor: Var' : 'Bu hafta rapor: Yok'}
        aria-label={
          project.hasCurrentWeekReport
            ? 'Mevcut hafta raporu var'
            : 'Mevcut hafta raporu yok'
        }
        sx={{
          alignSelf: 'flex-start',
          bgcolor: project.hasCurrentWeekReport ? '#DAFBE1' : '#F6F8FA',
          borderColor: project.hasCurrentWeekReport ? '#4AC26B' : '#D0D7DE',
          color: project.hasCurrentWeekReport ? '#116329' : '#656D76',
        }}
      />
    </Stack>
  )
}

import { Box, Stack, Typography } from '@mui/material'
import { HealthBadge, StatusBadge } from '@/components/common/StatusBadges'
import type { ProjectDashboardRow } from '@/types/api'
import { formatShortDate } from '@/utils/labels'

interface ProjectCardHeaderProps {
  project: ProjectDashboardRow
}

export function ProjectCardHeader({ project }: ProjectCardHeaderProps) {
  return (
    <Stack spacing={1.25}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" noWrap title={project.name}>
            {project.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {project.code}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap justifyContent="flex-end">
          <StatusBadge status={project.projectStatus} />
          <HealthBadge health={project.latestHealth} />
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Yönetici: <strong>{project.managerName ?? 'Atanmamış'}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Son güncelleme: <strong>{formatShortDate(project.latestReportDate)}</strong>
        </Typography>
      </Stack>
    </Stack>
  )
}

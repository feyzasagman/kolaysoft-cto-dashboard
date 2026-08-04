import { Box, Button, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/common/StatusBadges'
import type { AssignedProjectRow } from '@/types/api'
import { formatShortDate } from '@/utils/labels'
import { rememberProjectId } from '@/utils/projectCache'

interface ProjectListProps {
  projects: AssignedProjectRow[]
  canCreateReport: boolean
}

export function ProjectList({ projects, canCreateReport }: ProjectListProps) {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
      }}
    >
      {projects.map((project) => (
        <Box
          key={project.projectId}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1.5,
            bgcolor: 'background.paper',
            p: 2,
          }}
        >
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" gap={1} alignItems="flex-start">
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" noWrap>
                  {project.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {project.code}
                </Typography>
              </Box>
              <StatusBadge status={project.projectStatus} />
            </Stack>

            <Typography variant="body2" color="text.secondary">
              Müşteri: {project.customer ?? '—'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Başlangıç: {formatShortDate(project.startDate)} · Hedef bitiş:{' '}
              {formatShortDate(project.targetEndDate)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Son rapor haftası:{' '}
              {project.latestReportYear != null && project.latestReportWeek != null
                ? `${project.latestReportYear} / H${project.latestReportWeek}`
                : '—'}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              Bu hafta rapor: {project.hasCurrentWeekReport ? 'Var' : 'Yok'}
            </Typography>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" pt={0.5}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  rememberProjectId(project.projectId)
                  navigate(`/projects/${project.projectId}`)
                }}
                aria-label={`${project.name} detayını aç`}
              >
                Detay
              </Button>
              {canCreateReport && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => {
                    rememberProjectId(project.projectId)
                    navigate(`/reports/new?projectId=${project.projectId}`)
                  }}
                  aria-label={`${project.name} için haftalık rapor oluştur`}
                >
                  Haftalık Rapor Oluştur
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      ))}
    </Box>
  )
}

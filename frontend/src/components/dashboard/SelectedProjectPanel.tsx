import { Box, Button, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { HealthBadge, StatusBadge } from '@/components/common/StatusBadges'
import { ProjectActivityStrip } from '@/components/dashboard/ProjectActivityStrip'
import { ProjectProgress } from '@/components/dashboard/ProjectProgress'
import type { ProjectDashboardRow } from '@/types/api'
import { formatShortDate } from '@/utils/labels'
import { buildActivityStripFromProject } from '@/utils/projectActivity'

interface SelectedProjectPanelProps {
  project: ProjectDashboardRow | null
}

export function SelectedProjectPanel({ project }: SelectedProjectPanelProps) {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        p: 2,
        height: '100%',
      }}
    >
      <Typography variant="h5" mb={0.5}>
        Seçili proje aktivitesi
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
        Tablo satırından seçim yapın. Tam takvim proje detayındadır.
      </Typography>

      {!project ? (
        <Typography variant="body2" color="text.secondary">
          Aktivite paneli için bir proje seçin.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
            <Typography variant="subtitle1">{project.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {project.code}
            </Typography>
            <StatusBadge status={project.projectStatus} />
            <HealthBadge health={project.latestHealth} />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Yönetici: {project.managerName ?? '—'} · Son güncelleme:{' '}
            {formatShortDate(project.latestReportDate)}
          </Typography>
          <ProjectProgress target={project.progressTarget} actual={project.progressActual} />
          <ProjectActivityStrip weeks={buildActivityStripFromProject(project, 12)} />
          <Button
            variant="outlined"
            onClick={() => navigate(`/projects/${project.projectId}`)}
            aria-label="Proje detayını aç"
            sx={{ alignSelf: 'flex-start' }}
          >
            Detayı Gör
          </Button>
        </Stack>
      )}
    </Box>
  )
}

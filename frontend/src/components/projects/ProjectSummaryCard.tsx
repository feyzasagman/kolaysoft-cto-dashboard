import { Box, LinearProgress, Stack, Typography } from '@mui/material'
import {
  HealthBadge,
  ProjectStatusBadge,
  ReportAvailabilityBadge,
} from '@/components/common/StatusBadges'
import { UserAvatar } from '@/components/common/UserAvatar'
import type { ProjectDetailViewModel } from '@/utils/projectDetailMapper'

interface ProjectSummaryCardProps {
  model: ProjectDetailViewModel
}

export function ProjectSummaryCard({ model }: ProjectSummaryCardProps) {
  const behind = model.progressActual < model.progressTarget

  return (
    <Box
      className="fade-in-up"
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        p: { xs: 2, md: 2.5 },
        mb: 2.5,
      }}
    >
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2.5}
        justifyContent="space-between"
        alignItems={{ lg: 'center' }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" mb={1}>
            <Typography variant="overline">Project summary</Typography>
          </Stack>
          <Typography variant="h1" component="h1" sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
            {model.name}
          </Typography>
          <Typography color="text.secondary" mt={0.5}>
            {model.code}
            {' · '}
            Müşteri: {model.customer}
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" mt={1.25}>
            <ProjectStatusBadge status={model.projectStatus} />
            <HealthBadge health={model.health} />
            <ReportAvailabilityBadge available={model.hasCurrentWeekReport} />
          </Stack>
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          useFlexGap
          flexWrap="wrap"
          sx={{ flexShrink: 0 }}
        >
          <Stack direction="row" spacing={1} alignItems="center" minWidth={160}>
            <UserAvatar name={model.managerName} size={36} />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Manager
              </Typography>
              <Typography variant="body2" fontWeight={650} noWrap>
                {model.managerName}
              </Typography>
            </Box>
          </Stack>

          <Box minWidth={140}>
            <Typography variant="caption" color="text.secondary" display="block">
              Son rapor
            </Typography>
            <Typography variant="body2" fontWeight={650}>
              {model.lastUpdateLabel}
            </Typography>
          </Box>

          <Box minWidth={180} flex={1}>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" fontWeight={700} color={behind ? 'warning.dark' : 'text.primary'}>
                {model.progressActual}% / {model.progressTarget}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={model.progressActual}
              aria-label={`İlerleme ${model.progressActual} yüzde`}
              sx={{
                height: 8,
                '& .MuiLinearProgress-bar': {
                  bgcolor: behind ? 'warning.main' : 'success.main',
                },
              }}
            />
          </Box>
        </Stack>
      </Stack>
    </Box>
  )
}

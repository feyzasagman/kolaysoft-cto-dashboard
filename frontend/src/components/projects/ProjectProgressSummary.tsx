import { Box, LinearProgress, Stack, Typography } from '@mui/material'
import { HealthBadge } from '@/components/common/StatusBadges'
import type { ProjectDetailViewModel } from '@/utils/projectDetailMapper'
import { scheduleStatusLabel } from '@/utils/labels'

interface ProjectProgressSummaryProps {
  model: ProjectDetailViewModel
  scheduleStatus?: string | null
}

export function ProjectProgressSummary({ model, scheduleStatus }: ProjectProgressSummaryProps) {
  const behind = model.progressActual < model.progressTarget
  const deltaLabel =
    model.progressDelta === 0
      ? 'Hedefte'
      : model.progressDelta > 0
        ? `+${model.progressDelta} puan`
        : `${model.progressDelta} puan`

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        p: 2,
        height: '100%',
      }}
    >
      <Typography variant="h5" mb={1.5}>
        İlerleme özeti
      </Typography>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2">Hedeflenen</Typography>
          <Typography variant="body2" fontWeight={700}>
            {model.progressTarget}%
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={model.progressTarget}
          aria-label={`Hedeflenen ilerleme ${model.progressTarget}%`}
          aria-valuenow={model.progressTarget}
          aria-valuemin={0}
          aria-valuemax={100}
          sx={{ height: 8, borderRadius: 999, bgcolor: '#EBEDF0' }}
        />
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2">Gerçekleşen</Typography>
          <Typography variant="body2" fontWeight={700} color={behind ? 'warning.dark' : 'success.dark'}>
            {model.progressActual}% ({deltaLabel})
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={model.progressActual}
          aria-label={`Gerçekleşen ilerleme ${model.progressActual}%`}
          aria-valuenow={model.progressActual}
          aria-valuemin={0}
          aria-valuemax={100}
          sx={{
            height: 8,
            borderRadius: 999,
            bgcolor: '#EBEDF0',
            '& .MuiLinearProgress-bar': {
              bgcolor: behind ? 'warning.main' : 'success.main',
            },
          }}
        />
        <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
          <Typography variant="body2">Sağlık:</Typography>
          <HealthBadge health={model.health} />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Takvim durumu: {scheduleStatusLabel(scheduleStatus)}
        </Typography>
      </Stack>
    </Box>
  )
}

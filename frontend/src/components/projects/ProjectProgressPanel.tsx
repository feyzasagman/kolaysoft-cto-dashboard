import { Box, LinearProgress, Stack, Typography } from '@mui/material'
import { HealthBadge } from '@/components/common/StatusBadges'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import {
  progressBarColor,
  type ProjectDetailViewModel,
} from '@/utils/projectDetailMapper'

interface ProjectProgressPanelProps {
  model: ProjectDetailViewModel
  scheduleStatus?: string | null
}

export function ProjectProgressPanel({ model, scheduleStatus }: ProjectProgressPanelProps) {
  const behind = model.progressActual < model.progressTarget
  const delta = model.progressDelta
  const deltaLabel =
    delta === 0 ? '0 puan' : delta > 0 ? `+${delta} puan` : `${delta} puan`
  const statusText = behind ? 'Hedefin gerisinde' : 'Hedefle uyumlu'

  return (
    <Box sx={{ ...surfaceSx, p: DASH.cardPadding }} aria-label="İlerleme paneli">
      <Typography variant="h5" component="h3" mb={0.35}>
        Project Progress
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={DASH.space2}>
        Gerçekleşen ile hedef karşılaştırması
      </Typography>

      <Stack
        direction="row"
        spacing={DASH.space3}
        useFlexGap
        flexWrap="wrap"
        mb={DASH.space2}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">
            Gerçekleşen
          </Typography>
          <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.1 }}>
            {model.progressActual}%
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Hedef
          </Typography>
          <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.1 }}>
            {model.progressTarget}%
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Fark
          </Typography>
          <Typography
            sx={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.2 }}
            color={behind ? 'warning.dark' : 'success.dark'}
          >
            {deltaLabel}
          </Typography>
          <Typography
            variant="caption"
            fontWeight={650}
            color={behind ? 'warning.dark' : 'success.dark'}
          >
            {statusText}
          </Typography>
        </Box>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={model.progressActual}
        aria-label={`İlerleme ${model.progressActual} yüzde`}
        aria-valuenow={model.progressActual}
        aria-valuemin={0}
        aria-valuemax={100}
        sx={{
          height: 8,
          mb: DASH.space2,
          bgcolor: '#EBEDF0',
          '& .MuiLinearProgress-bar': {
            bgcolor: progressBarColor(model.health, behind),
          },
        }}
      />

      <Stack direction="row" spacing={DASH.space2} useFlexGap flexWrap="wrap" alignItems="center">
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Project health
          </Typography>
          <HealthBadge health={model.health} />
        </Box>
        {scheduleStatus && (
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Schedule
            </Typography>
            <Typography variant="body2" fontWeight={650}>
              {scheduleStatus}
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  )
}

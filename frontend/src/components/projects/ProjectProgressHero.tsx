import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { Box, LinearProgress, Stack, Typography } from '@mui/material'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import {
  progressBarColor,
  type ProjectDetailViewModel,
} from '@/utils/projectDetailMapper'

interface ProjectProgressHeroProps {
  model: ProjectDetailViewModel
  scheduleStatus?: string | null
}

export function ProjectProgressHero({ model, scheduleStatus }: ProjectProgressHeroProps) {
  const behind = model.progressActual < model.progressTarget
  const trend =
    model.progressDelta > 0 ? 'up' : model.progressDelta < 0 ? 'down' : 'flat'
  const TrendIcon =
    trend === 'up' ? TrendingUpIcon : trend === 'down' ? TrendingDownIcon : TrendingFlatIcon
  const trendColor =
    trend === 'up' ? 'success.main' : trend === 'down' ? 'warning.main' : 'text.secondary'

  return (
    <Box sx={{ ...surfaceSx, p: DASH.cardPadding }} aria-label="İlerleme paneli">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        spacing={DASH.space2}
        mb={DASH.space3}
      >
        <Box>
          <Typography variant="h5" component="h3">
            Progress
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Hedeflenen ve gerçekleşen tamamlanma
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: trendColor }}>
          <TrendIcon sx={{ fontSize: 18 }} />
          <Typography variant="caption" fontWeight={700} color="inherit">
            {model.progressDelta === 0
              ? 'Hedefte'
              : model.progressDelta > 0
                ? `+${model.progressDelta} puan`
                : `${model.progressDelta} puan`}
          </Typography>
        </Stack>
      </Stack>

      <Typography
        sx={{
          fontSize: { xs: '2.25rem', md: '2.75rem' },
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          mb: 1,
        }}
      >
        {model.progressActual}%
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={DASH.space2}>
        Completed · Target {model.progressTarget}%
        {scheduleStatus ? ` · Takvim: ${scheduleStatus}` : ''}
      </Typography>

      <LinearProgress
        variant="determinate"
        value={model.progressActual}
        aria-label={`Tamamlanma ${model.progressActual} yüzde`}
        sx={{
          height: 12,
          mb: DASH.space2,
          bgcolor: '#EBEDF0',
          '& .MuiLinearProgress-bar': {
            bgcolor: progressBarColor(model.health, behind),
          },
        }}
      />

      <Stack direction="row" spacing={DASH.space3} useFlexGap flexWrap="wrap">
        <Box>
          <Typography variant="caption" color="text.secondary">
            Target
          </Typography>
          <Typography variant="subtitle2">{model.progressTarget}%</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Completed
          </Typography>
          <Typography variant="subtitle2">{model.progressActual}%</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Health tone
          </Typography>
          <Typography variant="subtitle2">{model.healthLabel}</Typography>
        </Box>
      </Stack>
    </Box>
  )
}

import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { Box, Skeleton, Stack, Tooltip, Typography } from '@mui/material'
import type { ReactNode } from 'react'

export type KpiTrend = 'up' | 'down' | 'flat'

interface KpiCardProps {
  label: string
  value: number | string
  secondary?: string
  icon: ReactNode
  tone?: string
  tooltip?: string
  trend?: KpiTrend
  trendLabel?: string
  updatedLabel?: string | null
}

function TrendChip({ trend, label }: { trend: KpiTrend; label?: string }) {
  const config =
    trend === 'up'
      ? { icon: <TrendingUpIcon sx={{ fontSize: 14 }} />, color: 'success.main' }
      : trend === 'down'
        ? { icon: <TrendingDownIcon sx={{ fontSize: 14 }} />, color: 'error.main' }
        : { icon: <TrendingFlatIcon sx={{ fontSize: 14 }} />, color: 'text.secondary' }

  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: config.color }}>
      {config.icon}
      <Typography variant="caption" fontWeight={650} color="inherit">
        {label ?? (trend === 'up' ? 'Yüksek' : trend === 'down' ? 'Düşük' : 'Stabil')}
      </Typography>
    </Stack>
  )
}

export function KpiCard({
  label,
  value,
  secondary,
  icon,
  tone = '#0969DA',
  tooltip,
  trend = 'flat',
  trendLabel,
  updatedLabel,
}: KpiCardProps) {
  const card = (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        p: 2,
        height: '100%',
        transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
        '&:hover': {
          borderColor: '#AFB8C1',
          boxShadow: 1,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start" justifyContent="space-between">
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1,
            display: 'grid',
            placeItems: 'center',
            bgcolor: `${tone}14`,
            color: tone,
            border: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
          aria-hidden
        >
          {icon}
        </Box>
        <TrendChip trend={trend} label={trendLabel} />
      </Stack>

      <Typography
        variant="overline"
        sx={{ display: 'block', mt: 1.5, mb: 0.25, letterSpacing: '0.04em' }}
      >
        {label}
      </Typography>
      <Typography
        sx={{ fontSize: { xs: '1.625rem', md: '1.875rem' }, fontWeight: 700, lineHeight: 1.1 }}
        aria-label={`${label}: ${value ?? '—'}`}
      >
        {value ?? '—'}
      </Typography>
      {secondary && (
        <Typography variant="caption" color="text.secondary" display="block" mt={0.75}>
          {secondary}
        </Typography>
      )}
      {updatedLabel && (
        <Typography variant="caption" color="text.disabled" display="block" mt={0.75}>
          {updatedLabel}
        </Typography>
      )}
    </Box>
  )

  if (!tooltip) return card
  return (
    <Tooltip title={tooltip} enterDelay={200} describeChild>
      <Box sx={{ height: '100%' }}>{card}</Box>
    </Tooltip>
  )
}

export function KpiCardSkeleton() {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        p: 2,
        height: 132,
      }}
      aria-label="KPI yükleniyor"
    >
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Skeleton variant="rounded" width={34} height={34} />
        <Skeleton width={48} height={16} />
      </Stack>
      <Skeleton width="40%" height={14} />
      <Skeleton width="55%" height={36} sx={{ mt: 0.75 }} />
      <Skeleton width="70%" height={14} sx={{ mt: 1 }} />
    </Box>
  )
}

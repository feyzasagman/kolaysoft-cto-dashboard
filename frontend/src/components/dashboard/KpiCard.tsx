import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { Box, Skeleton, Stack, Tooltip, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'

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
}

function TrendChip({ trend, label }: { trend: KpiTrend; label?: string }) {
  const config =
    trend === 'up'
      ? { icon: <TrendingUpIcon sx={{ fontSize: 14 }} />, color: 'success.main' }
      : trend === 'down'
        ? { icon: <TrendingDownIcon sx={{ fontSize: 14 }} />, color: 'error.main' }
        : { icon: <TrendingFlatIcon sx={{ fontSize: 14 }} />, color: 'text.secondary' }

  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      sx={{ color: config.color, flexShrink: 0 }}
      aria-label={`Trend: ${label ?? trend}`}
    >
      {config.icon}
      <Typography variant="caption" fontWeight={650} color="inherit">
        {label ?? (trend === 'up' ? 'İyi' : trend === 'down' ? 'Dikkat' : 'Stabil')}
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
}: KpiCardProps) {
  const card = (
    <Box
      sx={{
        ...surfaceSx,
        p: DASH.cardPadding,
        minHeight: DASH.kpiMinHeight,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
        '&:hover': {
          borderColor: '#AFB8C1',
          boxShadow: 2,
          transform: DASH.hoverLift,
        },
      }}
    >
      <Stack direction="row" spacing={DASH.space2} alignItems="flex-start" justifyContent="space-between">
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1,
            display: 'grid',
            placeItems: 'center',
            bgcolor: `${tone}14`,
            color: tone,
            border: DASH.border,
            borderColor: 'divider',
            flexShrink: 0,
          }}
          aria-hidden
        >
          {icon}
        </Box>
        <TrendChip trend={trend} label={trendLabel} />
      </Stack>

      <Typography variant="overline" sx={{ display: 'block', mt: DASH.space2, mb: 0.5 }}>
        {label}
      </Typography>
      <Typography
        component="p"
        sx={{
          fontSize: { xs: '1.75rem', md: '2rem' },
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          m: 0,
        }}
        aria-label={`${label}: ${value ?? '—'}`}
      >
        {value ?? '—'}
      </Typography>
      {secondary && (
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          mt="auto"
          pt={DASH.space1}
        >
          {secondary}
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
        ...surfaceSx,
        p: DASH.cardPadding,
        minHeight: DASH.kpiMinHeight,
      }}
      aria-label="KPI yükleniyor"
    >
      <Stack direction="row" justifyContent="space-between" mb={DASH.space2}>
        <Skeleton variant="rounded" width={36} height={36} />
        <Skeleton width={52} height={16} />
      </Stack>
      <Skeleton width="45%" height={12} />
      <Skeleton width="40%" height={40} sx={{ mt: 1 }} />
      <Skeleton width="75%" height={14} sx={{ mt: DASH.space2 }} />
    </Box>
  )
}

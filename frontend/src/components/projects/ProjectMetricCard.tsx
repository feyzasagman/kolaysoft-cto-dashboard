import { Box, Tooltip, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'

interface ProjectMetricCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: ReactNode
  tone?: string
}

/** Command Center — dashboard KPI’dan daha kompakt metric. */
export function ProjectMetricCard({
  label,
  value,
  hint,
  icon,
  tone = '#656D76',
}: ProjectMetricCardProps) {
  const card = (
    <Box
      sx={{
        ...surfaceSx,
        p: DASH.space2,
        minHeight: 88,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 160ms ease, box-shadow 160ms ease',
        '&:hover': { borderColor: '#AFB8C1', boxShadow: 1 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {icon && (
          <Box
            sx={{
              width: 26,
              height: 26,
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
        )}
        <Typography variant="caption" fontWeight={700} color="text.secondary" noWrap>
          {label}
        </Typography>
      </Box>
      <Typography
        sx={{ fontSize: '1.375rem', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em' }}
        aria-label={`${label}: ${value}`}
      >
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary" mt={0.5} noWrap>
          {hint}
        </Typography>
      )}
    </Box>
  )

  if (!hint) return card
  return (
    <Tooltip title={hint} describeChild>
      <Box sx={{ height: '100%' }}>{card}</Box>
    </Tooltip>
  )
}

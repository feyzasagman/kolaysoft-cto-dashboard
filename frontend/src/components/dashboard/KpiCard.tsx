import { Box, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface KpiCardProps {
  label: string
  value: number | string
  secondary?: string
  icon: ReactNode
  tone?: string
  trendLabel?: string
}

export function KpiCard({
  label,
  value,
  secondary,
  icon,
  tone = '#0969DA',
  trendLabel,
}: KpiCardProps) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        p: 1.75,
        height: '100%',
        transition: 'border-color 120ms ease',
        '&:hover': { borderColor: '#AFB8C1' },
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <Box
          sx={{
            width: 32,
            height: 32,
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
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" fontWeight={650} color="text.secondary">
            {label}
          </Typography>
          <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.15, my: 0.25 }}>
            {value ?? '—'}
          </Typography>
          {(secondary || trendLabel) && (
            <Typography variant="caption" color="text.secondary" display="block">
              {secondary}
              {secondary && trendLabel ? ' · ' : ''}
              {trendLabel}
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  )
}

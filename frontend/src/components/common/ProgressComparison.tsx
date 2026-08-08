import { Box, LinearProgress, Stack, Typography } from '@mui/material'
import { DASH } from '@/theme/dashboardTokens'

interface ProgressComparisonProps {
  planned: number | null | undefined
  actual: number | null | undefined
  compact?: boolean
}

export function ProgressComparison({
  planned,
  actual,
  compact = false,
}: ProgressComparisonProps) {
  const plannedValue = planned ?? 0
  const actualValue = actual ?? 0
  const hasBoth = planned != null && actual != null
  const delta = hasBoth ? actualValue - plannedValue : null
  const behind = hasBoth && actualValue < plannedValue
  const deltaLabel =
    delta == null ? null : delta === 0 ? '0 puan' : delta > 0 ? `+${delta} puan` : `${delta} puan`
  const statusText =
    delta == null
      ? null
      : behind
        ? `Hedefin ${Math.abs(delta)} puan gerisinde`
        : 'Hedefle uyumlu'

  return (
    <Stack spacing={compact ? 1 : 1.25}>
      <Stack
        direction="row"
        spacing={DASH.space3}
        useFlexGap
        flexWrap="wrap"
        mb={compact ? 0 : 0.5}
      >
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Hedeflenen İlerleme
          </Typography>
          <Typography fontWeight={700} sx={{ fontSize: compact ? '1.125rem' : '1.5rem', lineHeight: 1.2 }}>
            {planned != null ? `${planned}%` : '—'}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Gerçekleşen İlerleme
          </Typography>
          <Typography fontWeight={700} sx={{ fontSize: compact ? '1.125rem' : '1.5rem', lineHeight: 1.2 }}>
            {actual != null ? `${actual}%` : '—'}
          </Typography>
        </Box>
        {deltaLabel && (
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Fark
            </Typography>
            <Typography
              fontWeight={700}
              sx={{ fontSize: compact ? '1rem' : '1.25rem', lineHeight: 1.2 }}
              color={behind ? 'warning.dark' : 'success.dark'}
            >
              {deltaLabel}
            </Typography>
            {statusText && (
              <Typography
                variant="caption"
                fontWeight={650}
                color={behind ? 'warning.dark' : 'success.dark'}
                display="block"
              >
                {statusText}
              </Typography>
            )}
          </Box>
        )}
      </Stack>

      <Box>
        <Stack direction="row" justifyContent="space-between" mb={0.35}>
          <Typography variant="caption" color="text.secondary">
            Gerçekleşen
          </Typography>
          <Typography variant="caption" fontWeight={650}>
            {actual != null ? `${actual}%` : '—'}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, Math.max(0, actualValue))}
          aria-label={`Gerçekleşen ilerleme ${actualValue} yüzde`}
          aria-valuenow={actualValue}
          aria-valuemin={0}
          aria-valuemax={100}
          sx={{
            height: compact ? 6 : 8,
            bgcolor: '#EBEDF0',
            '& .MuiLinearProgress-bar': {
              bgcolor: behind ? '#BF8700' : '#1A7F37',
            },
          }}
        />
        {planned != null && (
          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
            Hedef çizgisi: {planned}%
          </Typography>
        )}
      </Box>
    </Stack>
  )
}

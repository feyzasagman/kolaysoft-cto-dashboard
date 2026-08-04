import { Box, LinearProgress, Stack, Typography } from '@mui/material'

interface ProgressComparisonProps {
  planned: number | null | undefined
  actual: number | null | undefined
}

export function ProgressComparison({ planned, actual }: ProgressComparisonProps) {
  const plannedValue = planned ?? 0
  const actualValue = actual ?? 0

  return (
    <Stack spacing={1.25}>
      <Box>
        <Stack direction="row" justifyContent="space-between" mb={0.5}>
          <Typography variant="caption">Hedeflenen</Typography>
          <Typography variant="caption" fontWeight={700}>
            {planned ?? '—'}%
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, Math.max(0, plannedValue))}
          aria-label={`Hedeflenen ilerleme ${plannedValue}%`}
          sx={{ height: 8, borderRadius: 999, bgcolor: '#EBEDF0' }}
        />
      </Box>
      <Box>
        <Stack direction="row" justifyContent="space-between" mb={0.5}>
          <Typography variant="caption">Gerçekleşen</Typography>
          <Typography variant="caption" fontWeight={700}>
            {actual ?? '—'}%
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, Math.max(0, actualValue))}
          color={actualValue >= plannedValue ? 'success' : 'primary'}
          aria-label={`Gerçekleşen ilerleme ${actualValue}%`}
          sx={{ height: 8, borderRadius: 999, bgcolor: '#EBEDF0' }}
        />
      </Box>
    </Stack>
  )
}

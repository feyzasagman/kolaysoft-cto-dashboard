import { Box, LinearProgress, Stack, Typography } from '@mui/material'

interface ProjectProgressProps {
  target: number | null
  actual: number | null
}

export function ProjectProgress({ target, actual }: ProjectProgressProps) {
  const value = actual ?? 0
  const planned = target ?? 0

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" mb={0.75}>
        <Typography variant="caption">Hedef {planned}%</Typography>
        <Typography variant="caption" fontWeight={700}>
          Gerçekleşen {value}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, value))}
        aria-label={`İlerleme ${value} yüzde, hedef ${planned} yüzde`}
        sx={{
          height: 8,
          borderRadius: 999,
          bgcolor: '#EBEDF0',
          '& .MuiLinearProgress-bar': {
            borderRadius: 999,
            bgcolor: value >= planned ? 'success.main' : 'primary.main',
          },
        }}
      />
    </Box>
  )
}

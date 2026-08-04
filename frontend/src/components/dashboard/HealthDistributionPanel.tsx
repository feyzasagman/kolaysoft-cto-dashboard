import { Box, LinearProgress, Stack, Typography } from '@mui/material'
import type { HealthDistribution } from '@/types/api'

interface HealthDistributionPanelProps {
  data: HealthDistribution
}

function Row({
  label,
  value,
  total,
  color,
}: {
  label: string
  value: number
  total: number
  color: string
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" mb={0.5}>
        <Typography variant="body2" fontWeight={600}>
          {label}
        </Typography>
        <Typography variant="caption">
          {value} · {pct}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={pct}
        aria-label={`${label} ${value}`}
        sx={{
          height: 8,
          borderRadius: 999,
          bgcolor: '#EBEDF0',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 999 },
        }}
      />
    </Box>
  )
}

export function HealthDistributionPanel({ data }: HealthDistributionPanelProps) {
  const total = data.green + data.yellow + data.red + data.noReport

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        p: 2,
        height: '100%',
      }}
    >
      <Typography variant="h5" mb={0.5}>
        Sağlık dağılımı
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={2}>
        Aktif projelerin son rapor sağlığı
      </Typography>
      {total === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Dağılım verisi bulunmuyor.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          <Row label="Sağlıklı" value={data.green} total={total} color="#1A7F37" />
          <Row label="Dikkat" value={data.yellow} total={total} color="#9A6700" />
          <Row label="Kritik" value={data.red} total={total} color="#CF222E" />
          <Row label="Rapor yok" value={data.noReport} total={total} color="#656D76" />
        </Stack>
      )}
    </Box>
  )
}

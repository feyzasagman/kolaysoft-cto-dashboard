import { Box, LinearProgress, Stack, Tooltip, Typography } from '@mui/material'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import type { HealthDistribution } from '@/types/api'
import { mapHealthDistribution } from '@/utils/dashboardMapper'

interface HealthDistributionPanelProps {
  data: HealthDistribution | null | undefined
  loading?: boolean
}

export function HealthDistributionPanel({ data, loading = false }: HealthDistributionPanelProps) {
  const { total, slices } = mapHealthDistribution(data)

  return (
    <SurfaceCard
      title="Health Distribution"
      subtitle="Aktif projelerin son rapor sağlığı"
      aria-label="Sağlık dağılımı paneli"
    >
      {loading ? (
        <Typography variant="body2" color="text.secondary" aria-busy="true">
          Dağılım yükleniyor…
        </Typography>
      ) : total === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Sağlık dağılımı için yeterli veri bulunmuyor.
        </Typography>
      ) : (
        <Stack spacing={1.75}>
          {slices.map((slice) => (
            <Box key={slice.key}>
              <Stack direction="row" justifyContent="space-between" mb={0.5} gap={1}>
                <Typography variant="body2" fontWeight={600}>
                  {slice.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {slice.value} · {slice.percent}%
                </Typography>
              </Stack>
              <Tooltip title={`${slice.label}: ${slice.value} proje (${slice.percent}%)`} describeChild>
                <LinearProgress
                  variant="determinate"
                  value={slice.percent}
                  aria-label={`${slice.label} ${slice.value} proje, yüzde ${slice.percent}`}
                  sx={{
                    height: 8,
                    '& .MuiLinearProgress-bar': { bgcolor: slice.color },
                  }}
                />
              </Tooltip>
            </Box>
          ))}
        </Stack>
      )}
    </SurfaceCard>
  )
}

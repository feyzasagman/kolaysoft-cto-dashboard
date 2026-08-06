import { Box, LinearProgress, Stack, Tooltip, Typography } from '@mui/material'
import type { HealthDistribution } from '@/types/api'
import { mapHealthDistribution } from '@/utils/dashboardMapper'

interface HealthDistributionPanelProps {
  data: HealthDistribution | null | undefined
  loading?: boolean
}

export function HealthDistributionPanel({ data, loading = false }: HealthDistributionPanelProps) {
  const { total, slices } = mapHealthDistribution(data)

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
      aria-label="Sağlık dağılımı paneli"
    >
      <Typography variant="h5" mb={0.5}>
        Sağlık dağılımı
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={2}>
        Aktif projelerin son rapor sağlığı
      </Typography>

      {loading ? (
        <Typography variant="body2" color="text.secondary" aria-busy="true">
          Dağılım yükleniyor…
        </Typography>
      ) : total === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Sağlık dağılımı için yeterli veri bulunmuyor.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
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
                    borderRadius: 999,
                    bgcolor: '#EBEDF0',
                    '& .MuiLinearProgress-bar': { bgcolor: slice.color, borderRadius: 999 },
                  }}
                />
              </Tooltip>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  )
}

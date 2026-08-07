import { Box, LinearProgress, Skeleton, Stack, Tooltip, Typography } from '@mui/material'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
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
        ...surfaceSx,
        p: DASH.cardPadding,
        minHeight: DASH.panelMinHeight,
        height: '100%',
      }}
      aria-label="Sağlık dağılımı paneli"
    >
      <Typography variant="h5" component="h2">
        Health Distribution
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mt={0.5} mb={DASH.space3}>
        Aktif projelerin son rapor sağlığı
      </Typography>

      {loading ? (
        <Stack spacing={DASH.space2} aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <Box key={i}>
              <Stack direction="row" justifyContent="space-between" mb={1}>
                <Skeleton width={100} height={16} />
                <Skeleton width={64} height={14} />
              </Stack>
              <Skeleton variant="rounded" height={8} />
            </Box>
          ))}
        </Stack>
      ) : total === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Sağlık dağılımı için yeterli veri bulunmuyor.
        </Typography>
      ) : (
        <Stack spacing={DASH.space2}>
          {slices.map((slice) => (
            <Box key={slice.key}>
              <Stack direction="row" alignItems="center" spacing={1} mb={0.75} gap={1}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: slice.color,
                    flexShrink: 0,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                  aria-hidden
                />
                <Typography variant="body2" fontWeight={650} sx={{ flex: 1 }}>
                  {slice.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={650}>
                  {slice.percent}%
                </Typography>
                <Typography variant="caption" color="text.secondary" minWidth={48} textAlign="right">
                  {slice.value} proje
                </Typography>
              </Stack>
              <Tooltip title={`${slice.label}: ${slice.value} proje (${slice.percent}%)`} describeChild>
                <LinearProgress
                  variant="determinate"
                  value={slice.percent}
                  aria-label={`${slice.label} ${slice.value} proje, yüzde ${slice.percent}`}
                  sx={{
                    height: 8,
                    bgcolor: '#EBEDF0',
                    '& .MuiLinearProgress-bar': { bgcolor: slice.color },
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

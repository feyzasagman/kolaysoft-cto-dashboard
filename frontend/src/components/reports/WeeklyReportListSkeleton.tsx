import { Box, Skeleton, Stack } from '@mui/material'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'

export function WeeklyReportListSkeleton() {
  return (
    <Box aria-busy="true" aria-label="Haftalık raporlar yükleniyor" className="fade-in">
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        spacing={2}
        mb={DASH.space3}
      >
        <Box sx={{ flex: 1 }}>
          <Skeleton width={220} height={36} />
          <Skeleton width="60%" height={18} sx={{ mt: 1 }} />
        </Box>
        <Skeleton variant="rounded" width={180} height={36} />
      </Stack>

      <Box
        sx={{
          ...surfaceSx,
          p: DASH.space2,
          mb: DASH.space3,
          display: 'grid',
          gap: DASH.space2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '2fr 1.2fr 0.8fr 1fr 1fr',
          },
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={40} />
        ))}
      </Box>

      <Box sx={{ ...surfaceSx, overflow: 'hidden' }}>
        <Skeleton height={48} sx={{ mx: 2, mt: 1 }} />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} height={56} sx={{ mx: 2, my: 0.5 }} />
        ))}
      </Box>
    </Box>
  )
}

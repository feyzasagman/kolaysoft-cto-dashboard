import { Box, Skeleton, Stack } from '@mui/material'
import { KpiCardSkeleton } from '@/components/dashboard/KpiCard'
import { ProjectTableSkeleton } from '@/components/dashboard/ProjectPortfolioTable'

export function DashboardSkeleton() {
  return (
    <Stack spacing={2} aria-busy="true" aria-label="Dashboard yükleniyor">
      <Box>
        <Skeleton width={280} height={36} />
        <Skeleton width="55%" height={20} />
        <Skeleton width={180} height={18} sx={{ mt: 0.5 }} />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', lg: '1.1fr 1fr' },
        }}
      >
        <Skeleton variant="rounded" height={240} />
        <Skeleton variant="rounded" height={240} />
      </Box>

      <ProjectTableSkeleton />
    </Stack>
  )
}

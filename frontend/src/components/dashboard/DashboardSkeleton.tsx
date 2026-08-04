import { Box, Skeleton, Stack } from '@mui/material'

export function DashboardSkeleton() {
  return (
    <Stack spacing={2}>
      <Box>
        <Skeleton width={280} height={36} />
        <Skeleton width="55%" height={20} />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={96} />
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', lg: '1.2fr 1fr' },
        }}
      >
        <Skeleton variant="rounded" height={260} />
        <Skeleton variant="rounded" height={260} />
      </Box>

      <Skeleton variant="rounded" height={48} />
      <Skeleton variant="rounded" height={320} />
    </Stack>
  )
}

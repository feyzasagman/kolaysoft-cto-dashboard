import { Box, Skeleton, Stack } from '@mui/material'

export function ProjectCardSkeleton() {
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
      <Skeleton width="60%" height={28} />
      <Stack direction="row" spacing={1} my={1.25}>
        <Skeleton width={72} height={22} />
        <Skeleton width={72} height={22} />
      </Stack>
      <Skeleton height={10} sx={{ mb: 1.5 }} />
      <Skeleton width="80%" height={18} />
      <Skeleton height={18} sx={{ mt: 1.5, maxWidth: 220 }} />
    </Box>
  )
}

export function DashboardSkeleton() {
  return (
    <Stack spacing={2}>
      <Box>
        <Skeleton width={280} height={36} />
        <Skeleton width="65%" height={22} />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
        }}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={96} />
        ))}
      </Box>

      <Skeleton variant="rounded" height={48} />

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <ProjectCardSkeleton key={index} />
        ))}
      </Box>
    </Stack>
  )
}

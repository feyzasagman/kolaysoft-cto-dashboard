import { Box, Skeleton, Stack } from '@mui/material'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'

export function ProjectPortfolioSkeleton() {
  return (
    <Box aria-busy="true" aria-label="Proje portföyü yükleniyor" className="fade-in">
      <Box
        sx={{
          ...surfaceSx,
          px: { xs: DASH.space2, md: DASH.space3 },
          py: { xs: DASH.space2, md: DASH.space3 },
          mb: DASH.sectionGap,
        }}
      >
        <Skeleton width={160} height={34} />
        <Skeleton width="50%" height={18} sx={{ mt: 1 }} />
        <Skeleton width={260} height={16} sx={{ mt: DASH.space2 }} />
      </Box>

      <Box sx={{ ...surfaceSx, p: DASH.cardPadding, mb: DASH.space2 }}>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" width={140} height={36} />
          ))}
        </Stack>
      </Box>

      <Box sx={{ ...surfaceSx, overflow: 'hidden' }}>
        <Box
          sx={{
            px: DASH.space3,
            py: DASH.space2,
            borderBottom: DASH.border,
            borderColor: 'divider',
          }}
        >
          <Skeleton width={160} height={22} />
          <Skeleton width={80} height={14} sx={{ mt: 0.5 }} />
        </Box>
        {Array.from({ length: 8 }).map((_, i) => (
          <Stack
            key={i}
            direction="row"
            spacing={DASH.space2}
            alignItems="center"
            sx={{
              px: DASH.space3,
              py: 1.5,
              borderBottom: DASH.border,
              borderColor: 'divider',
              minHeight: 64,
            }}
          >
            <Box sx={{ flex: 1.6, minWidth: 0 }}>
              <Skeleton width="48%" height={16} />
              <Skeleton width="22%" height={12} sx={{ mt: 0.5 }} />
            </Box>
            <Skeleton
              variant="circular"
              width={26}
              height={26}
              sx={{ display: { xs: 'none', md: 'block' } }}
            />
            <Skeleton width={72} height={22} sx={{ display: { xs: 'none', md: 'block' } }} />
            <Skeleton width={72} height={22} sx={{ display: { xs: 'none', md: 'block' } }} />
            <Skeleton width={100} height={8} sx={{ display: { xs: 'none', md: 'block' } }} />
            <Skeleton width={88} height={22} />
          </Stack>
        ))}
      </Box>
    </Box>
  )
}

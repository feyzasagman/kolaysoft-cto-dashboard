import { Box, Skeleton, Stack } from '@mui/material'
import { KpiCardSkeleton } from '@/components/dashboard/KpiCard'
import { ProjectTableSkeleton } from '@/components/dashboard/ProjectPortfolioTable'
import { DASH, kpiGridSx, surfaceSx, twoColGridSx } from '@/theme/dashboardTokens'

function HeaderSkeleton() {
  return (
    <Box
      sx={{
        ...surfaceSx,
        px: { xs: DASH.space2, md: DASH.space3 },
        py: { xs: DASH.space2, md: DASH.space3 },
        mb: DASH.sectionGap,
      }}
    >
      <Skeleton width={140} height={14} sx={{ mb: DASH.space2 }} />
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={DASH.space2}>
        <Box sx={{ flex: 1 }}>
          <Skeleton width={180} height={34} />
          <Skeleton width="55%" height={18} sx={{ mt: 1 }} />
          <Skeleton width={220} height={16} sx={{ mt: DASH.space2 }} />
        </Box>
        <Skeleton variant="rounded" width={110} height={36} />
      </Stack>
    </Box>
  )
}

function PanelSkeleton() {
  return (
    <Box sx={{ ...surfaceSx, p: DASH.cardPadding, minHeight: DASH.panelMinHeight }}>
      <Skeleton width={160} height={22} />
      <Skeleton width={220} height={14} sx={{ mt: 0.75, mb: DASH.space3 }} />
      <Stack spacing={DASH.space2}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i}>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Skeleton width={100} height={16} />
              <Skeleton width={70} height={14} />
            </Stack>
            <Skeleton variant="rounded" height={8} />
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

export function DashboardSkeleton() {
  return (
    <Box aria-busy="true" aria-label="Dashboard yükleniyor" className="fade-in">
      <HeaderSkeleton />
      <Stack spacing={DASH.sectionGap}>
        <Box sx={kpiGridSx}>
          {Array.from({ length: 6 }).map((_, i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </Box>

        <Box sx={twoColGridSx}>
          <PanelSkeleton />
          <PanelSkeleton />
        </Box>

        <Box sx={{ ...surfaceSx, p: DASH.cardPadding }}>
          <Skeleton width={100} height={22} />
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" mt={DASH.space2}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" width={140} height={36} />
            ))}
          </Stack>
        </Box>

        <ProjectTableSkeleton />

        <Box sx={{ ...surfaceSx, p: DASH.cardPadding, minHeight: 240 }}>
          <Skeleton width={140} height={22} />
          <Skeleton width={200} height={14} sx={{ mt: 0.75, mb: DASH.space2 }} />
          <Stack spacing={DASH.space1}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={64} />
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}

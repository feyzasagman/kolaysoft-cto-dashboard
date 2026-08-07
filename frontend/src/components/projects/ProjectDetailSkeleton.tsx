import { Box, Button, Skeleton, Stack } from '@mui/material'
import { AppErrorState } from '@/components/common/AppErrorState'
import { DASH, kpiGridSx, surfaceSx } from '@/theme/dashboardTokens'

export function ProjectDetailSkeleton() {
  return (
    <Box aria-busy="true" aria-label="Proje detayı yükleniyor" className="fade-in">
      {/* Hero */}
      <Box
        sx={{
          ...surfaceSx,
          px: { xs: DASH.space2, md: DASH.space3 },
          py: { xs: DASH.space2, md: DASH.space3 },
          mb: DASH.sectionGap,
        }}
      >
        <Skeleton width={180} height={14} sx={{ mb: DASH.space2 }} />
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          spacing={DASH.space3}
        >
          <Box sx={{ flex: 1 }}>
            <Skeleton width={80} height={12} />
            <Skeleton width="45%" height={36} sx={{ mt: 1 }} />
            <Stack direction="row" spacing={1} mt={DASH.space2}>
              <Skeleton width={72} height={22} />
              <Skeleton width={72} height={22} />
              <Skeleton width={88} height={22} />
            </Stack>
            <Stack direction="row" spacing={DASH.space3} mt={DASH.space3}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton width={100} height={32} />
              <Skeleton width={100} height={32} />
            </Stack>
            <Skeleton variant="rounded" height={10} sx={{ mt: DASH.space3, maxWidth: 520 }} />
          </Box>
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rounded" width={88} height={36} />
            <Skeleton variant="rounded" width={110} height={36} />
            <Skeleton variant="rounded" width={40} height={36} />
          </Stack>
        </Stack>
      </Box>

      {/* Metric cards */}
      <Box sx={{ ...kpiGridSx, mb: DASH.sectionGap }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={112} />
        ))}
      </Box>

      {/* Main + sidebar */}
      <Box
        sx={{
          display: 'grid',
          gap: DASH.space3,
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 300px' },
        }}
      >
        <Box sx={{ ...surfaceSx, overflow: 'hidden' }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ px: DASH.space2, py: 1.5, borderBottom: DASH.border, borderColor: 'divider' }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} width={88} height={28} />
            ))}
          </Stack>
          <Box sx={{ p: DASH.space3 }}>
            <Box
              sx={{
                display: 'grid',
                gap: DASH.space3,
                gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' },
                mb: DASH.sectionGap,
              }}
            >
              <Skeleton variant="rounded" height={260} />
              <Skeleton variant="rounded" height={260} />
            </Box>
            <Skeleton width={200} height={22} sx={{ mb: DASH.space2 }} />
            <Stack spacing={DASH.space2}>
              <Skeleton variant="rounded" height={96} />
              <Skeleton variant="rounded" height={96} />
            </Stack>
            <Skeleton width={180} height={22} sx={{ mt: DASH.sectionGap, mb: DASH.space2 }} />
            <Stack spacing={DASH.space2}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={72} />
              ))}
            </Stack>
          </Box>
        </Box>

        <Box sx={{ ...surfaceSx, p: DASH.cardPadding, minHeight: 360 }}>
          <Skeleton width={100} height={22} />
          <Skeleton width={140} height={14} sx={{ mt: 0.75, mb: DASH.space3 }} />
          <Stack spacing={DASH.space2}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height={40} />
            ))}
          </Stack>
          <Skeleton variant="rounded" height={36} sx={{ mt: DASH.space3 }} />
          <Skeleton variant="rounded" height={36} sx={{ mt: 1 }} />
        </Box>
      </Box>
    </Box>
  )
}

interface ProjectDetailErrorStateProps {
  title?: string
  onRetry?: () => void
  onBack?: () => void
}

export function ProjectDetailErrorState({
  title = 'Proje detayları alınamadı. Lütfen tekrar deneyin.',
  onRetry,
  onBack,
}: ProjectDetailErrorStateProps) {
  return (
    <AppErrorState
      kind="network"
      title={title}
      onRetry={onRetry}
      secondaryAction={
        onBack ? (
          <Button variant="outlined" onClick={onBack} aria-label="Geri dön">
            Geri Dön
          </Button>
        ) : undefined
      }
    />
  )
}

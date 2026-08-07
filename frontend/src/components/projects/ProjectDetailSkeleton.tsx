import { Box, Button, Skeleton, Stack } from '@mui/material'
import { AppErrorState } from '@/components/common/AppErrorState'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'

export function ProjectDetailSkeleton() {
  return (
    <Box aria-busy="true" aria-label="Proje komuta merkezi yükleniyor" className="fade-in">
      <Box sx={{ ...surfaceSx, p: DASH.space2, mb: DASH.space3 }}>
        <Skeleton width={220} height={14} sx={{ mb: DASH.space2 }} />
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Skeleton width="40%" height={32} />
            <Stack direction="row" spacing={1} mt={1.5}>
              <Skeleton width={72} height={22} />
              <Skeleton width={72} height={22} />
            </Stack>
            <Skeleton width="55%" height={14} sx={{ mt: 2 }} />
            <Skeleton variant="rounded" height={6} sx={{ mt: 2, maxWidth: 480 }} />
          </Box>
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rounded" width={150} height={36} />
            <Skeleton variant="rounded" width={96} height={36} />
          </Stack>
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: DASH.cardGap,
          gridTemplateColumns: {
            xs: '1fr 1fr',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(6, 1fr)',
          },
          mb: DASH.space3,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={88} />
        ))}
      </Box>

      <Skeleton variant="rounded" height={44} sx={{ mb: 0 }} />
      <Box sx={{ ...surfaceSx, borderTopLeftRadius: 0, borderTopRightRadius: 0, p: DASH.space3 }}>
        <Box
          sx={{
            display: 'grid',
            gap: DASH.space3,
            gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          }}
        >
          <Stack spacing={DASH.space2}>
            <Skeleton variant="rounded" height={180} />
            <Skeleton variant="rounded" height={220} />
            <Skeleton variant="rounded" height={160} />
          </Stack>
          <Skeleton variant="rounded" height={360} />
        </Box>
        <Skeleton variant="rounded" height={140} sx={{ mt: DASH.space3 }} />
        <Skeleton variant="rounded" height={160} sx={{ mt: DASH.space2 }} />
      </Box>
    </Box>
  )
}

interface ProjectDetailErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  onBack?: () => void
}

export function ProjectDetailErrorState({
  title = 'Proje bilgileri alınamadı.',
  description = 'Ağ veya sunucu hatası oluştu. Lütfen tekrar deneyin.',
  onRetry,
  onBack,
}: ProjectDetailErrorStateProps) {
  return (
    <AppErrorState
      kind="network"
      title={title}
      description={description}
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

import { Box, Button, Skeleton, Stack } from '@mui/material'
import { AppErrorState } from '@/components/common/AppErrorState'

export function ProjectDetailSkeleton() {
  return (
    <Stack spacing={2.5} aria-busy="true" aria-label="Proje detayı yükleniyor" className="fade-in">
      <Skeleton width={220} height={18} />
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
        <Box sx={{ flex: 1 }}>
          <Skeleton width={120} height={14} />
          <Skeleton width="40%" height={20} sx={{ mt: 1 }} />
        </Box>
        <Stack direction="row" spacing={1}>
          <Skeleton variant="rounded" width={96} height={32} />
          <Skeleton variant="rounded" width={160} height={32} />
        </Stack>
      </Stack>

      <Skeleton variant="rounded" height={120} />

      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1.5,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width={88} height={28} />
          ))}
        </Stack>
        <Box sx={{ p: 2.5 }}>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            }}
          >
            <Skeleton variant="rounded" height={280} />
            <Skeleton variant="rounded" height={280} />
          </Box>
          <Skeleton variant="rounded" height={180} sx={{ mt: 2 }} />
        </Box>
      </Box>
    </Stack>
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
      kind="generic"
      title={title}
      onRetry={onRetry}
      secondaryAction={
        onBack ? (
          <Button variant="outlined" onClick={onBack} aria-label="Dashboarda dön">
            Dashboard’a Dön
          </Button>
        ) : undefined
      }
    />
  )
}

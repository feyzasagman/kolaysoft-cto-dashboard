import { Box, Button, Skeleton, Stack, Typography } from '@mui/material'

export function ProjectDetailSkeleton() {
  return (
    <Stack spacing={2} aria-busy="true" aria-label="Proje detayı yükleniyor">
      <Skeleton width={320} height={28} />
      <Skeleton width="60%" height={40} />
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        }}
      >
        <Skeleton variant="rounded" height={280} />
        <Skeleton variant="rounded" height={280} />
      </Box>
      <Skeleton variant="rounded" height={200} />
      <Skeleton variant="rounded" height={180} />
      <Skeleton variant="rounded" height={180} />
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
    <Box
      role="alert"
      sx={{
        border: '1px solid',
        borderColor: 'error.light',
        bgcolor: 'error.light',
        borderRadius: 1.5,
        px: 3,
        py: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="h5" color="error.dark" mb={1.5}>
        {title}
      </Typography>
      <Stack direction="row" spacing={1} justifyContent="center" useFlexGap flexWrap="wrap">
        {onRetry && (
          <Button variant="outlined" color="error" onClick={onRetry} aria-label="Tekrar dene">
            Tekrar Dene
          </Button>
        )}
        {onBack && (
          <Button variant="outlined" onClick={onBack} aria-label="Dashboarda dön">
            Dashboard’a Dön
          </Button>
        )}
      </Stack>
    </Box>
  )
}

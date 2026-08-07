import { Alert, Box, Stack, Typography } from '@mui/material'
import { PageHeader } from '@/components/common/PageHeader'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { useAuth } from '@/contexts/AuthContext'

export function SettingsPage() {
  const { user } = useAuth()

  return (
    <Box>
      <PageHeader
        title="Settings"
        subtitle="Hesap özeti. Gelişmiş ayarlar sonraki günlerde eklenecek."
      />

      <SurfaceCard title="Active Session" sx={{ maxWidth: 560 }}>
        <Stack spacing={1.25}>
          <Typography><strong>Name:</strong> {user?.fullName}</Typography>
          <Typography><strong>Email:</strong> {user?.email}</Typography>
          <Typography><strong>Role:</strong> {user?.role}</Typography>
          <Alert severity="info" sx={{ mt: 0.5 }}>
            Token localStorage üzerinde tutulur. Refresh token endpointi henüz yoktur; yapı placeholder olarak hazırdır.
          </Alert>
        </Stack>
      </SurfaceCard>
    </Box>
  )
}

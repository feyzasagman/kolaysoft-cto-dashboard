import { Box, Stack, Typography } from '@mui/material'
import { PageHeader } from '@/components/common/PageHeader'
import { RoleBadge } from '@/components/common/StatusBadges'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { useAuth } from '@/contexts/AuthContext'

export function SettingsPage() {
  const { user } = useAuth()

  return (
    <Box>
      <PageHeader
        title="Ayarlar"
        subtitle="Hesap özeti. Gelişmiş ayarlar sonraki günlerde eklenecek."
      />

      <SurfaceCard title="Aktif Oturum" sx={{ maxWidth: 560 }}>
        <Stack spacing={1.25}>
          <Typography>
            <strong>Ad:</strong> {user?.fullName || '—'}
          </Typography>
          <Typography>
            <strong>E-posta:</strong> {user?.email || '—'}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography component="span">
              <strong>Rol:</strong>
            </Typography>
            <RoleBadge role={user?.role} />
          </Stack>
          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
            Oturum bilgisi tarayıcıda saklanır. Gelişmiş güvenlik ayarları sonraki sürümlerde eklenecektir.
          </Typography>
        </Stack>
      </SurfaceCard>
    </Box>
  )
}

import { Alert, Box, Paper, Stack, Typography } from '@mui/material'
import { useAuth } from '@/contexts/AuthContext'

export function SettingsPage() {
  const { user } = useAuth()

  return (
    <Box>
      <Typography variant="h5" mb={0.5}>
        Settings
      </Typography>
      <Typography color="text.secondary" mb={2.5}>
        Hesap özeti. Gelişmiş ayarlar sonraki günlerde eklenecek.
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 560 }}>
        <Stack spacing={1.5}>
          <Typography variant="subtitle2" color="text.secondary">
            Active Session
          </Typography>
          <Typography><strong>Name:</strong> {user?.fullName}</Typography>
          <Typography><strong>Email:</strong> {user?.email}</Typography>
          <Typography><strong>Role:</strong> {user?.role}</Typography>
          <Alert severity="info" sx={{ mt: 1 }}>
            Token localStorage üzerinde tutulur. Refresh token endpointi henüz yoktur; yapı placeholder olarak hazırdır.
          </Alert>
        </Stack>
      </Paper>
    </Box>
  )
}

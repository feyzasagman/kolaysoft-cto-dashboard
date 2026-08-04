import { Box, Button, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function UnauthorizedPage() {
  const { logout } = useAuth()

  return (
    <Box sx={{ minHeight: '70vh', display: 'grid', placeItems: 'center', textAlign: 'center', px: 2 }}>
      <Box>
        <Typography variant="h2" fontWeight={700}>
          403
        </Typography>
        <Typography variant="h5" mb={1}>
          Unauthorized
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Bu sayfayı görüntülemek için yetkiniz yok.
        </Typography>
        <Button component={RouterLink} to="/dashboard" variant="contained" sx={{ mr: 1 }}>
          Dashboard
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            logout()
            window.location.assign('/login')
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  )
}

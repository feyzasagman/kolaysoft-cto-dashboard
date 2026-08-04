import { Box, Button, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <Box sx={{ minHeight: '70vh', display: 'grid', placeItems: 'center', textAlign: 'center', px: 2 }}>
      <Box>
        <Typography variant="h2" fontWeight={700}>
          404
        </Typography>
        <Typography variant="h5" mb={1}>
          Page Not Found
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Aradığınız sayfa bulunamadı.
        </Typography>
        <Button component={RouterLink} to="/dashboard" variant="contained">
          Dashboard&apos;a dön
        </Button>
      </Box>
    </Box>
  )
}

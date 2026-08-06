import { Box, Button, Typography } from '@mui/material'

interface DashboardErrorStateProps {
  title?: string
  onRetry?: () => void
}

export function DashboardErrorState({
  title = 'Dashboard bilgileri alınamadı. Lütfen bağlantınızı kontrol edip tekrar deneyin.',
  onRetry,
}: DashboardErrorStateProps) {
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
      <Typography variant="h5" color="error.dark" mb={1.25}>
        {title}
      </Typography>
      {onRetry && (
        <Button variant="outlined" color="error" onClick={onRetry} aria-label="Tekrar dene">
          Tekrar Dene
        </Button>
      )}
    </Box>
  )
}

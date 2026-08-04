import { Box, CircularProgress, Typography } from '@mui/material'

interface LoadingStateProps {
  label?: string
  fullHeight?: boolean
}

export function LoadingState({ label = 'Yükleniyor...', fullHeight = false }: LoadingStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        minHeight: fullHeight ? '60vh' : 180,
        py: 4,
      }}
    >
      <CircularProgress size={36} />
      <Typography color="text.secondary">{label}</Typography>
    </Box>
  )
}

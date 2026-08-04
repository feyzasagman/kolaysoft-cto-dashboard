import { Box, Button, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Box
      sx={{
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        px: 3,
        py: 6,
        textAlign: 'center',
      }}
    >
      <Typography variant="h6" mb={0.75}>
        {title}
      </Typography>
      <Typography color="text.secondary" mb={action ? 2 : 0} maxWidth={480} mx="auto">
        {description}
      </Typography>
      {action}
    </Box>
  )
}

interface ErrorStateProps {
  title?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Proje bilgileri alınamadı.',
  onRetry,
}: ErrorStateProps) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'error.light',
        bgcolor: 'error.light',
        borderRadius: 2,
        px: 3,
        py: 4,
        textAlign: 'center',
      }}
    >
      <Typography variant="h6" color="error.dark" mb={1.5}>
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

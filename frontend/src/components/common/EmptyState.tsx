import { Box, Button, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ title, description, action, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Box
      sx={{
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        px: 3,
        py: 4,
        textAlign: 'center',
      }}
    >
      <Typography variant="h5" mb={0.75}>
        {title}
      </Typography>
      <Typography
        color="text.secondary"
        mb={action || actionLabel ? 2 : 0}
        maxWidth={460}
        mx="auto"
      >
        {description}
      </Typography>
      {action}
      {!action && actionLabel && onAction && (
        <Button variant="outlined" onClick={onAction} aria-label={actionLabel}>
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}

interface ErrorStateProps {
  title?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Veriler alınamadı.',
  onRetry,
}: ErrorStateProps) {
  return (
    <Box
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

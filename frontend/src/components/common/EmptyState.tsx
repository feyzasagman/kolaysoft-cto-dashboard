import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import { Box, Button, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description: string
  icon?: ReactNode
  action?: ReactNode
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Box
      className="fade-in"
      sx={{
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        px: 3,
        py: 5,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: 1.5,
          display: 'grid',
          placeItems: 'center',
          mx: 'auto',
          mb: 1.5,
          bgcolor: 'action.hover',
          color: 'text.secondary',
          border: '1px solid',
          borderColor: 'divider',
        }}
        aria-hidden
      >
        {icon ?? <InboxOutlinedIcon />}
      </Box>
      <Typography variant="h5" component="h2" mb={0.75}>
        {title}
      </Typography>
      <Typography
        color="text.secondary"
        mb={action || actionLabel ? 2.25 : 0}
        maxWidth={440}
        mx="auto"
      >
        {description}
      </Typography>
      {action}
      {!action && actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} aria-label={actionLabel}>
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

/** Geriye uyumlu basit hata durumu. */
export function ErrorState({
  title = 'Veriler alınamadı.',
  onRetry,
}: ErrorStateProps) {
  return (
    <Box
      role="alert"
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        borderRadius: 1.5,
        px: 3,
        py: 3.5,
        textAlign: 'center',
      }}
    >
      <Typography variant="h5" mb={1}>
        {title}
      </Typography>
      <Typography color="text.secondary" mb={onRetry ? 2 : 0} maxWidth={400} mx="auto">
        Lütfen bağlantınızı kontrol edip yeniden deneyin.
      </Typography>
      {onRetry && (
        <Button variant="contained" onClick={onRetry} aria-label="Tekrar dene">
          Tekrar Dene
        </Button>
      )}
    </Box>
  )
}

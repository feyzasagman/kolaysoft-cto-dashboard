import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import { Box, Button, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { AppErrorState } from '@/components/common/AppErrorState'
import { DASH } from '@/theme/dashboardTokens'

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
        borderRadius: DASH.radius,
        bgcolor: 'background.paper',
        px: DASH.space3,
        py: 5,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: DASH.radius,
          display: 'grid',
          placeItems: 'center',
          mx: 'auto',
          mb: DASH.space2,
          bgcolor: 'action.hover',
          color: 'text.secondary',
          border: DASH.border,
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
        mb={action || actionLabel ? DASH.space2 : 0}
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

/** Legacy wrapper → AppErrorState (tek hata dili). */
export function ErrorState({
  title = 'Veriler alınamadı.',
  onRetry,
}: ErrorStateProps) {
  return (
    <AppErrorState
      kind="network"
      title={title}
      description="Lütfen bağlantınızı kontrol edip yeniden deneyin."
      onRetry={onRetry}
    />
  )
}

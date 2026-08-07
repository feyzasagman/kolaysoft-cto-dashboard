import { Box, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  meta?: ReactNode
  actions?: ReactNode
}

/** Sayfa başlığı — tüm ekranlarda aynı tipografi hiyerarşisi. */
export function PageHeader({ title, subtitle, meta, actions }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      alignItems={{ md: 'flex-start' }}
      spacing={1.5}
      mb={3}
      className="fade-in"
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h1" component="h1">
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" mt={0.5} maxWidth={720}>
            {subtitle}
          </Typography>
        )}
        {meta && (
          <Box mt={1} sx={{ color: 'text.secondary' }}>
            {meta}
          </Box>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ flexShrink: 0 }}>
          {actions}
        </Stack>
      )}
    </Stack>
  )
}

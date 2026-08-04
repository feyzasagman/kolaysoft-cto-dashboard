import { Box, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  eyebrow?: string
}

export function PageHeader({ title, description, actions, eyebrow }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      alignItems={{ md: 'flex-start' }}
      spacing={1.5}
      mb={2.5}
    >
      <Box sx={{ minWidth: 0 }}>
        {eyebrow && (
          <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.5}>
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h1" sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary" mt={0.5} maxWidth={720}>
            {description}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {actions}
        </Stack>
      )}
    </Stack>
  )
}

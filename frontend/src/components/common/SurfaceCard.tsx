import { Box, type BoxProps, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface SurfaceCardProps extends Omit<BoxProps, 'title'> {
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  padded?: boolean
  hoverable?: boolean
}

/** Tutarlı yüzey kartı — ince border, hafif hover. */
export function SurfaceCard({
  title,
  subtitle,
  action,
  children,
  padded = true,
  hoverable = false,
  sx,
  ...rest
}: SurfaceCardProps) {
  return (
    <Box
      {...rest}
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        height: '100%',
        transition: 'border-color 160ms ease, box-shadow 160ms ease',
        ...(hoverable
          ? {
              '&:hover': {
                borderColor: '#AFB8C1',
                boxShadow: 1,
              },
            }
          : null),
        ...sx,
      }}
    >
      {(title || action) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1.5,
            px: padded ? 2 : 0,
            pt: padded ? 2 : 0,
            pb: subtitle || children ? 1 : padded ? 2 : 0,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            {title && (
              <Typography variant="h5" component="h2">
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary" display="block" mt={0.25}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action}
        </Box>
      )}
      <Box sx={{ px: padded ? 2 : 0, pb: padded ? 2 : 0, pt: title ? 0 : padded ? 2 : 0 }}>
        {children}
      </Box>
    </Box>
  )
}

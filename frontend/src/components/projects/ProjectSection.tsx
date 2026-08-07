import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { DASH } from '@/theme/dashboardTokens'

interface ProjectSectionProps {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}

/** Sekme içi bölüm başlığı — tutarlı hiyerarşi. */
export function ProjectSection({ title, subtitle, action, children }: ProjectSectionProps) {
  return (
    <Box className="fade-in-up">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: DASH.space2,
          mb: DASH.space2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h2" component="h2" sx={{ fontSize: '1.125rem' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" display="block" mt={0.35}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Box>
      {children}
    </Box>
  )
}

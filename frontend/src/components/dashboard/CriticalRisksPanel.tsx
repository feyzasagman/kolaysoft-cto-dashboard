import { Box, Link, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import type { CriticalRisk } from '@/types/api'
import { formatShortDate } from '@/utils/labels'

interface CriticalRisksPanelProps {
  risks: CriticalRisk[]
}

export function CriticalRisksPanel({ risks }: CriticalRisksPanelProps) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h5" mb={0.5}>
        Kritik riskler
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
        Yüksek öncelikli açık riskler
      </Typography>

      {risks.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Kritik risk bulunmuyor.
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ overflowY: 'auto', maxHeight: 280 }}>
          {risks.map((risk) => (
            <Box
              key={risk.riskId}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 1.25,
              }}
            >
              <Stack direction="row" justifyContent="space-between" gap={1} mb={0.5}>
                <Typography variant="body2" fontWeight={650} noWrap title={risk.title}>
                  {risk.title}
                </Typography>
                <Typography variant="caption" color="error.main" fontWeight={700}>
                  {risk.impactLevel}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block">
                <Link
                  component={RouterLink}
                  to={`/projects/${risk.projectId}`}
                  underline="hover"
                  color="inherit"
                  fontWeight={600}
                >
                  {risk.projectCode}
                </Link>
                {' · '}
                {risk.status}
                {' · '}
                {formatShortDate(risk.createdAt)}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  )
}

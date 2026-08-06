import { Box, Link, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import type { CriticalRisk } from '@/types/api'
import { mapCriticalRiskPreview } from '@/utils/dashboardMapper'

interface CriticalRisksPanelProps {
  risks: CriticalRisk[] | null | undefined
  loading?: boolean
}

export function CriticalRisksPanel({ risks, loading = false }: CriticalRisksPanelProps) {
  const items = mapCriticalRiskPreview(risks)

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
      aria-label="Kritik risk önizlemesi"
    >
      <Typography variant="h5" mb={0.5}>
        Kritik riskler
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
        Yüksek öncelikli açık riskler
      </Typography>

      {loading ? (
        <Typography variant="body2" color="text.secondary" aria-busy="true">
          Riskler yükleniyor…
        </Typography>
      ) : items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Kritik risk bulunmuyor.
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ overflowY: 'auto', maxHeight: 280 }}>
          {items.map((risk) => (
            <Box
              key={risk.id}
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
                {risk.createdAtLabel}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  )
}

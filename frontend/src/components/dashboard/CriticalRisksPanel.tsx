import { Box, Link, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import type { CriticalRisk } from '@/types/api'
import { mapCriticalRiskPreview } from '@/utils/dashboardMapper'

interface CriticalRisksPanelProps {
  risks: CriticalRisk[] | null | undefined
  loading?: boolean
}

export function CriticalRisksPanel({ risks, loading = false }: CriticalRisksPanelProps) {
  const items = mapCriticalRiskPreview(risks)

  return (
    <SurfaceCard
      title="Recent Risks"
      subtitle="Yüksek öncelikli açık riskler"
      aria-label="Kritik risk önizlemesi"
    >
      {loading ? (
        <Typography variant="body2" color="text.secondary" aria-busy="true">
          Riskler yükleniyor…
        </Typography>
      ) : items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Kritik risk bulunmuyor.
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ overflowY: 'auto', maxHeight: 300 }}>
          {items.map((risk) => (
            <Box
              key={risk.id}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 1.25,
                transition: 'border-color 160ms ease, background-color 160ms ease',
                '&:hover': { borderColor: '#AFB8C1', bgcolor: 'action.hover' },
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
    </SurfaceCard>
  )
}

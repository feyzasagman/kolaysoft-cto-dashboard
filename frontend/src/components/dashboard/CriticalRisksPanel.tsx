import { Box, Link, Skeleton, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
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
        ...surfaceSx,
        p: DASH.cardPadding,
        minHeight: 240,
      }}
      aria-label="Kritik risk önizlemesi"
    >
      <Typography variant="h5" component="h2">
        Recent Risks
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mt={0.5} mb={DASH.space2}>
        Yüksek öncelikli açık riskler
      </Typography>

      {loading ? (
        <Stack spacing={DASH.space1} aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={64} />
          ))}
        </Stack>
      ) : items.length === 0 ? (
        <EmptyState
          title="Kritik risk bulunmuyor"
          description="Açık kritik risk oluştuğunda burada listelenir."
        />
      ) : (
        <Stack spacing={DASH.space1} sx={{ overflowY: 'auto', maxHeight: 320 }}>
          {items.map((risk) => (
            <Box
              key={risk.id}
              sx={{
                border: DASH.border,
                borderColor: 'divider',
                borderRadius: 1,
                px: DASH.space2,
                py: 1.25,
                transition: 'border-color 160ms ease, background-color 160ms ease',
                '&:hover': { borderColor: '#AFB8C1', bgcolor: 'action.hover' },
              }}
            >
              <Stack direction="row" justifyContent="space-between" gap={DASH.space1} mb={0.5}>
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

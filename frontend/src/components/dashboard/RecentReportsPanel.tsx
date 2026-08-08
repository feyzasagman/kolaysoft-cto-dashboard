import { Box, Link, Skeleton, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { HealthBadge } from '@/components/common/StatusBadges'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import { formatRelativeTime } from '@/utils/formatRelative'
import type { PortfolioRow } from '@/utils/dashboardTypes'

interface RecentReportsPanelProps {
  rows: PortfolioRow[]
  loading?: boolean
  detailQuerySuffix?: string
}

export function RecentReportsPanel({
  rows,
  loading = false,
  detailQuerySuffix = '',
}: RecentReportsPanelProps) {
  const items = [...rows]
    .filter((r) => r.latestReportDate)
    .sort((a, b) => {
      const ta = a.latestReportDate ? new Date(a.latestReportDate).getTime() : 0
      const tb = b.latestReportDate ? new Date(b.latestReportDate).getTime() : 0
      return tb - ta
    })
    .slice(0, 6)

  return (
    <Box
      sx={{
        ...surfaceSx,
        p: DASH.cardPadding,
        minHeight: DASH.panelMinHeight,
        height: '100%',
      }}
      aria-label="Son raporlar"
    >
      <Typography variant="h5" component="h2">
        Son Raporlar
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mt={0.5} mb={DASH.space2}>
        Portföydeki en güncel haftalık raporlar
      </Typography>

      {loading ? (
        <Stack spacing={DASH.space1} aria-busy="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={52} />
          ))}
        </Stack>
      ) : items.length === 0 ? (
        <EmptyState
          title="Henüz rapor yok"
          description="Projeler haftalık rapor gönderdiğinde burada listelenir."
        />
      ) : (
        <Stack spacing={DASH.space1}>
          {items.map((row) => (
            <Box
              key={row.projectId}
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
              <Stack direction="row" justifyContent="space-between" gap={DASH.space1} alignItems="center">
                <Box sx={{ minWidth: 0 }}>
                  <Link
                    component={RouterLink}
                    to={`/projects/${row.projectId}${detailQuerySuffix}`}
                    underline="hover"
                    color="inherit"
                    fontWeight={650}
                    variant="body2"
                    noWrap
                    display="block"
                  >
                    {row.name}
                  </Link>
                  <Typography variant="caption" color="text.secondary">
                    {row.code} · {formatRelativeTime(row.latestReportDate)}
                  </Typography>
                </Box>
                <HealthBadge health={row.latestHealth} />
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  )
}

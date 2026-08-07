import { Box, Link, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { HealthBadge } from '@/components/common/StatusBadges'
import { SurfaceCard } from '@/components/common/SurfaceCard'
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
    <SurfaceCard
      title="Recent Reports"
      subtitle="Portföydeki en güncel raporlar"
      aria-label="Son raporlar"
    >
      {loading ? (
        <Typography variant="body2" color="text.secondary" aria-busy="true">
          Raporlar yükleniyor…
        </Typography>
      ) : items.length === 0 ? (
        <EmptyState
          title="Henüz rapor yok"
          description="Projeler haftalık rapor gönderdiğinde burada listelenir."
        />
      ) : (
        <Stack spacing={1}>
          {items.map((row) => (
            <Box
              key={row.projectId}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 1.25,
                transition: 'border-color 160ms ease, background-color 160ms ease',
                '&:hover': { borderColor: '#AFB8C1', bgcolor: 'action.hover' },
              }}
            >
              <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
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
    </SurfaceCard>
  )
}

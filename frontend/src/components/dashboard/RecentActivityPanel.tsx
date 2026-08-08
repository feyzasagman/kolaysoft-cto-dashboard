import { Box, Link, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import { formatRelativeTime } from '@/utils/formatRelative'
import type { CriticalRisk } from '@/types/api'
import type { PortfolioRow } from '@/utils/dashboardTypes'

interface ActivityItem {
  id: string
  title: string
  meta: string
  to: string
  tone: 'neutral' | 'warning' | 'danger'
}

interface RecentActivityPanelProps {
  risks: CriticalRisk[] | null | undefined
  rows: PortfolioRow[]
  loading?: boolean
}

export function RecentActivityPanel({
  risks,
  rows,
  loading = false,
}: RecentActivityPanelProps) {
  const riskItems: ActivityItem[] = (risks ?? []).slice(0, 4).map((risk) => ({
    id: `risk-${risk.riskId}`,
    title: risk.title ?? 'Risk',
    meta: `${risk.projectCode ?? '—'} · ${risk.impactLevel ?? '—'} · ${formatRelativeTime(risk.createdAt)}`,
    to: `/projects/${risk.projectId}`,
    tone: risk.impactLevel === 'CRITICAL' ? 'danger' : 'warning',
  }))

  const reportItems: ActivityItem[] = [...rows]
    .filter((r) => r.latestReportDate)
    .sort((a, b) => {
      const ta = a.latestReportDate ? new Date(a.latestReportDate).getTime() : 0
      const tb = b.latestReportDate ? new Date(b.latestReportDate).getTime() : 0
      return tb - ta
    })
    .slice(0, 3)
    .map((row) => ({
      id: `report-${row.projectId}`,
      title: `${row.name} raporu güncellendi`,
      meta: `${row.code} · ${formatRelativeTime(row.latestReportDate)}`,
      to: `/projects/${row.projectId}`,
      tone: 'neutral' as const,
    }))

  const items = [...riskItems, ...reportItems].slice(0, 7)

  return (
    <SurfaceCard
      title="Son Aktivite"
      subtitle="Risk ve rapor hareketleri"
      aria-label="Son aktivite"
    >
      {loading ? (
        <Typography variant="body2" color="text.secondary" aria-busy="true">
          Aktivite yükleniyor…
        </Typography>
      ) : items.length === 0 ? (
        <EmptyState
          title="Henüz aktivite yok"
          description="Risk ve rapor güncellemeleri burada görünecek."
        />
      ) : (
        <Stack spacing={1}>
          {items.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                gap: 1.25,
                alignItems: 'flex-start',
                p: 1,
                borderRadius: 1,
                transition: 'background-color 160ms ease',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  mt: 0.75,
                  flexShrink: 0,
                  bgcolor:
                    item.tone === 'danger'
                      ? 'error.main'
                      : item.tone === 'warning'
                        ? 'warning.main'
                        : 'text.disabled',
                }}
                aria-hidden
              />
              <Box sx={{ minWidth: 0 }}>
                <Link
                  component={RouterLink}
                  to={item.to}
                  underline="hover"
                  color="inherit"
                  variant="body2"
                  fontWeight={650}
                >
                  {item.title}
                </Link>
                <Typography variant="caption" color="text.secondary" display="block">
                  {item.meta}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </SurfaceCard>
  )
}

import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import { Box, Link, Skeleton, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { RiskLevelBadge, RiskStatusBadge } from '@/components/common/StatusBadges'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import { countRisksByLevel, mapRiskPreview } from '@/utils/projectDetailMapper'
import type { RiskIssue } from '@/types/api'

interface ProjectRiskPanelProps {
  risks: RiskIssue[] | null | undefined
  openRiskCount: number
  loading?: boolean
  dense?: boolean
}

export function ProjectRiskPanel({
  risks,
  openRiskCount,
  loading = false,
  dense = false,
}: ProjectRiskPanelProps) {
  const counts = countRisksByLevel(risks)
  const items = mapRiskPreview(risks)
    .filter((item) => item.status === 'OPEN' || item.status === 'IN_PROGRESS')
    .sort((a, b) => {
      const rank = (level: string) =>
        level === 'CRITICAL' ? 0 : level === 'HIGH' ? 1 : level === 'MEDIUM' ? 2 : 3
      return rank(String(a.riskLevel)) - rank(String(b.riskLevel))
    })

  if (loading) {
    return (
      <Stack spacing={1} aria-busy="true" aria-label="Riskler yükleniyor">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={72} />
        ))}
      </Stack>
    )
  }

  return (
    <Box>
      <Typography variant="h5" component="h3" mb={0.35}>
        Risks & Blockers
      </Typography>
      <Stack direction="row" spacing={DASH.space2} useFlexGap flexWrap="wrap" mb={DASH.space2}>
        <Typography variant="caption" color="text.secondary">
          Open Risks <strong>{openRiskCount}</strong>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Critical <strong>{counts.critical}</strong>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Resolved <strong>{counts.resolvedTotal}</strong>
        </Typography>
      </Stack>

      {items.length === 0 ? (
        <EmptyState
          icon={<ReportProblemOutlinedIcon />}
          title="Açık risk veya engel bulunmuyor."
          description="Son haftalık raporda açık risk kaydı yok."
        />
      ) : (
        <Stack spacing={DASH.space1}>
          {items.slice(0, dense ? 4 : undefined).map((item) => {
            const priority =
              item.riskLevel === 'CRITICAL' || item.riskLevel === 'HIGH'
            return (
              <Box
                key={item.id}
                sx={{
                  ...surfaceSx,
                  p: DASH.space2,
                  borderLeft: priority ? '3px solid' : DASH.border,
                  borderLeftColor: priority
                    ? item.riskLevel === 'CRITICAL'
                      ? 'error.main'
                      : 'warning.main'
                    : 'divider',
                  transition: 'background-color 160ms ease',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  spacing={1}
                  mb={0.75}
                >
                  <Typography variant="subtitle2" fontWeight={700}>
                    {item.title}
                  </Typography>
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    <RiskLevelBadge level={item.riskLevel} />
                    <RiskStatusBadge status={item.status} />
                  </Stack>
                </Stack>
                {(item.description || item.impact !== '—') && (
                  <Typography variant="body2" color="text.secondary" mb={0.75}>
                    {item.description || item.impact}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  Aksiyon: {item.actionPlan}
                </Typography>
                <Link
                  component={RouterLink}
                  to={`/reports/${item.reportId}`}
                  underline="hover"
                  variant="caption"
                  fontWeight={650}
                >
                  Related report
                </Link>
              </Box>
            )
          })}
        </Stack>
      )}
    </Box>
  )
}

/** Sprint 2 uyumluluk alias */
export { ProjectRiskPanel as ProjectRisksPanel }

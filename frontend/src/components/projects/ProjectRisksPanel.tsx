import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Box, Link, Skeleton, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { RiskLevelBadge, RiskStatusBadge } from '@/components/common/StatusBadges'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import {
  countRisksByLevel,
  mapRiskPreview,
} from '@/utils/projectDetailMapper'
import type { RiskIssue } from '@/types/api'

interface ProjectRisksPanelProps {
  risks: RiskIssue[] | null | undefined
  openRiskCount: number
  openBlockerCount: number
  loading?: boolean
}

const LEVEL_META = [
  { key: 'critical' as const, label: 'Critical', color: '#CF222E', icon: <ErrorOutlineIcon fontSize="small" /> },
  { key: 'high' as const, label: 'High', color: '#9A6700', icon: <ReportProblemOutlinedIcon fontSize="small" /> },
  { key: 'medium' as const, label: 'Medium', color: '#BF8700', icon: <WarningAmberOutlinedIcon fontSize="small" /> },
  { key: 'low' as const, label: 'Low', color: '#1A7F37', icon: <InfoOutlinedIcon fontSize="small" /> },
]

export function ProjectRisksPanel({
  risks,
  openRiskCount,
  openBlockerCount,
  loading = false,
}: ProjectRisksPanelProps) {
  const counts = countRisksByLevel(risks)
  const items = mapRiskPreview(risks).filter(
    (item) => item.status === 'OPEN' || item.status === 'IN_PROGRESS',
  )

  if (loading) {
    return (
      <Stack spacing={DASH.space2} aria-busy="true" aria-label="Riskler yükleniyor">
        <Box sx={{ display: 'grid', gap: DASH.cardGap, gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' } }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={88} />
          ))}
        </Box>
        <Skeleton variant="rounded" height={120} />
      </Stack>
    )
  }

  return (
    <Stack spacing={DASH.space3}>
      <Box
        sx={{
          display: 'grid',
          gap: DASH.cardGap,
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
        }}
      >
        {LEVEL_META.map((level) => (
          <Box
            key={level.key}
            sx={{
              ...surfaceSx,
              p: DASH.space2,
              transition: 'border-color 160ms ease, box-shadow 160ms ease',
              '&:hover': { borderColor: '#AFB8C1', boxShadow: 1 },
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={1} sx={{ color: level.color }}>
              {level.icon}
              <Typography variant="caption" fontWeight={700} color="inherit">
                {level.label}
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>
              {counts[level.key]}
            </Typography>
          </Box>
        ))}
      </Box>

      <Typography variant="caption" color="text.secondary">
        Açık risk: {openRiskCount} · Blocker: {openBlockerCount} · Önizleme son rapordan
      </Typography>

      {items.length === 0 ? (
        <EmptyState
          icon={<ReportProblemOutlinedIcon />}
          title="Açık risk bulunmuyor"
          description="Kritik veya yüksek risk oluştuğunda burada listelenir."
        />
      ) : (
        <Stack spacing={DASH.space2}>
          {items.map((item) => (
            <Box
              key={item.id}
              sx={{
                ...surfaceSx,
                p: DASH.cardPadding,
                transition: 'border-color 160ms ease, background-color 160ms ease',
                '&:hover': { borderColor: '#AFB8C1', bgcolor: 'action.hover' },
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={1}
                mb={1}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  {item.title}
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <RiskLevelBadge level={item.riskLevel} />
                  <RiskStatusBadge status={item.status} />
                </Stack>
              </Stack>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {item.impact !== '—' ? item.impact : item.actionPlan}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.75}>
                Aksiyon: {item.actionPlan}
              </Typography>
              <Link
                component={RouterLink}
                to={`/reports/${item.reportId}`}
                underline="hover"
                variant="caption"
                fontWeight={650}
              >
                Rapora git
              </Link>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  )
}

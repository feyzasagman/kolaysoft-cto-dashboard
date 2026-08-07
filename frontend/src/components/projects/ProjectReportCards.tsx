import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import {
  Box,
  Button,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { HealthBadge } from '@/components/common/StatusBadges'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import { mapHistoryWithIds } from '@/utils/projectDetailMapper'
import type { ReportHistoryItem, WeeklyReport } from '@/types/api'

interface ProjectReportCardsProps {
  history: ReportHistoryItem[] | null | undefined
  reports: WeeklyReport[] | null | undefined
  canCreateReport?: boolean
  projectId: number
  limit?: number
}

export function ProjectReportCards({
  history,
  reports,
  canCreateReport = false,
  projectId,
  limit,
}: ProjectReportCardsProps) {
  const navigate = useNavigate()
  const rows = mapHistoryWithIds(history, reports)
  const visible = typeof limit === 'number' ? rows.slice(0, limit) : rows

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={<AssessmentOutlinedIcon />}
        title="Henüz haftalık rapor yok"
        description="İlk haftalık raporu oluşturarak proje sağlığını ve ilerlemeyi izlemeye başlayın."
        actionLabel={canCreateReport ? 'Haftalık Rapor Oluştur' : undefined}
        onAction={
          canCreateReport
            ? () => navigate(`/reports/new?projectId=${projectId}`)
            : undefined
        }
      />
    )
  }

  return (
    <Stack spacing={DASH.space2}>
      {visible.map((row) => (
        <Box
          key={`${row.year}-${row.weekNumber}`}
          sx={{
            ...surfaceSx,
            p: DASH.cardPadding,
            transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
            '&:hover': {
              borderColor: '#AFB8C1',
              boxShadow: 2,
              transform: DASH.hoverLift,
            },
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            spacing={DASH.space2}
            alignItems={{ md: 'center' }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center" mb={1}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {row.year} · Hafta {row.weekNumber}
                </Typography>
                <HealthBadge health={row.health} />
                <Typography
                  variant="caption"
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: 999,
                    border: DASH.border,
                    borderColor: 'divider',
                    bgcolor: '#F6F8FA',
                    fontWeight: 650,
                  }}
                >
                  {row.status}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" mb={1.25}>
                {row.summary}
              </Typography>
              <Stack direction="row" spacing={DASH.space2} useFlexGap flexWrap="wrap" mb={1}>
                <Typography variant="caption" color="text.secondary">
                  Progress {row.progressActual}% / {row.progressTarget}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Updated {row.dateLabel}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={row.progressActual}
                aria-label={`Hafta ${row.weekNumber} ilerleme ${row.progressActual}`}
                sx={{ height: 6, maxWidth: 280 }}
              />
            </Box>
            {row.reportId ? (
              <Button
                component={RouterLink}
                to={`/reports/${row.reportId}`}
                variant="outlined"
                endIcon={<OpenInNewIcon />}
                aria-label={`${row.year} hafta ${row.weekNumber} raporunu aç`}
              >
                Open
              </Button>
            ) : (
              <Typography variant="caption" color="text.secondary">
                Detay eşleşmedi
              </Typography>
            )}
          </Stack>
        </Box>
      ))}
    </Stack>
  )
}

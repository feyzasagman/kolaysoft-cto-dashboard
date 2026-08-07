import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined'
import { Box, Button, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { HealthBadge } from '@/components/common/StatusBadges'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import { mapHistoryWithIds } from '@/utils/projectDetailMapper'
import type { ReportHistoryItem, WeeklyReport } from '@/types/api'

interface ProjectReportTimelineProps {
  history: ReportHistoryItem[] | null | undefined
  reports: WeeklyReport[] | null | undefined
  limit?: number
  title?: string
}

export function ProjectReportTimeline({
  history,
  reports,
  limit,
  title = 'Report History',
}: ProjectReportTimelineProps) {
  const rows = mapHistoryWithIds(history, reports)
  const visible = typeof limit === 'number' ? rows.slice(0, limit) : rows

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={<TimelineOutlinedIcon />}
        title="Rapor geçmişi bulunmuyor."
        description="Haftalık raporlar gönderildikçe burada zaman çizelgesi olarak listelenir."
      />
    )
  }

  return (
    <Box>
      <Typography variant="h5" component="h3" mb={0.35}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={DASH.space2}>
        En yeni üstte · gerçek rapor kayıtları
      </Typography>

      <Box
        component="ol"
        aria-label="Rapor geçmişi zaman çizelgesi"
        sx={{ m: 0, p: 0, listStyle: 'none', position: 'relative' }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: 15,
            top: 8,
            bottom: 8,
            width: 2,
            bgcolor: 'divider',
            display: { xs: 'none', sm: 'block' },
          }}
        />
        <Stack spacing={DASH.space1}>
          {visible.map((row) => (
            <Box
              key={`${row.year}-${row.weekNumber}`}
              component="li"
              sx={{
                ...surfaceSx,
                p: DASH.space2,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '32px 1fr auto' },
                gap: DASH.space2,
                alignItems: 'center',
                transition: 'border-color 160ms ease',
                '&:hover': { borderColor: '#AFB8C1' },
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: 'background.paper',
                  border: DASH.border,
                  borderColor: 'divider',
                  display: { xs: 'none', sm: 'grid' },
                  placeItems: 'center',
                  zIndex: 1,
                }}
                aria-hidden
              >
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center" mb={0.35}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {row.year} · Hafta {row.weekNumber}
                  </Typography>
                  <HealthBadge health={row.health} />
                  <Typography variant="caption" color="text.secondary">
                    {row.status}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {row.dateLabel} · Actual {row.progressActual}% · Target {row.progressTarget}%
                </Typography>
              </Box>
              {row.reportId ? (
                <Button
                  component={RouterLink}
                  to={`/reports/${row.reportId}`}
                  size="small"
                  variant="outlined"
                  endIcon={<OpenInNewIcon />}
                  aria-label={`${row.year} hafta ${row.weekNumber} raporunu gör`}
                >
                  View
                </Button>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  —
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}

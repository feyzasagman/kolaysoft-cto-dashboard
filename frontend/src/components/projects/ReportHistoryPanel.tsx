import { Box, Button, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { HealthBadge } from '@/components/common/StatusBadges'
import { mapHistoryWithIds } from '@/utils/projectDetailMapper'
import type { ReportHistoryItem, WeeklyReport } from '@/types/api'

interface ReportHistoryPanelProps {
  history: ReportHistoryItem[] | null | undefined
  reports: WeeklyReport[] | null | undefined
}

export function ReportHistoryPanel({ history, reports }: ReportHistoryPanelProps) {
  const rows = mapHistoryWithIds(history, reports)

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        p: 2,
      }}
    >
      <Typography variant="h5" mb={1.5}>
        Son beş rapor
      </Typography>

      {rows.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Rapor geçmişi bulunmuyor.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {rows.map((row) => (
            <Stack
              key={`${row.year}-${row.weekNumber}`}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ sm: 'center' }}
              sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1 }}
            >
              <Typography variant="body2" fontWeight={650}>
                {row.year} / Hafta {row.weekNumber}
              </Typography>
              <HealthBadge health={row.health} />
              <Typography variant="body2">
                {row.progressActual}% / {row.progressTarget}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.dateLabel}
              </Typography>
              {row.reportId ? (
                <Button
                  component={RouterLink}
                  to={`/reports/${row.reportId}`}
                  size="small"
                  variant="outlined"
                  aria-label={`${row.year} hafta ${row.weekNumber} rapor detayı`}
                >
                  Detay
                </Button>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  —
                </Typography>
              )}
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  )
}

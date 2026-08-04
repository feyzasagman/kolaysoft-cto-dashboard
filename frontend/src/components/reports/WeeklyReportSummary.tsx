import { Box, Stack, Typography } from '@mui/material'
import { ProgressComparison } from '@/components/common/ProgressComparison'
import type { WeeklyReport } from '@/types/api'
import { formatShortDate } from '@/utils/labels'

interface WeeklyReportSummaryProps {
  report: WeeklyReport
}

export function WeeklyReportSummary({ report }: WeeklyReportSummaryProps) {
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
      <Typography variant="h5" mb={0.5}>
        {report.projectCode} — {report.projectName}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        {report.year} / Hafta {report.weekNumber} · {formatShortDate(report.reportDate)}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        }}
      >
        <ProgressComparison planned={report.plannedProgress} actual={report.actualProgress} />
        <Stack spacing={1}>
          <Typography variant="body2">
            <strong>Proje durumu:</strong> {report.projectStatus || '—'}
          </Typography>
          <Typography variant="body2">
            <strong>Takvim durumu:</strong> {report.scheduleStatus || '—'}
          </Typography>
        </Stack>
      </Box>

      <Stack spacing={1.25} mt={2}>
        <Typography variant="subtitle2">Yapılanlar</Typography>
        <Typography variant="body2" color="text.secondary" whiteSpace="pre-wrap">
          {report.completedWork || '—'}
        </Typography>
        <Typography variant="subtitle2">Yapılacaklar</Typography>
        <Typography variant="body2" color="text.secondary" whiteSpace="pre-wrap">
          {report.plannedWork || '—'}
        </Typography>
        <Typography variant="subtitle2">Genel not</Typography>
        <Typography variant="body2" color="text.secondary" whiteSpace="pre-wrap">
          {report.overallNote || '—'}
        </Typography>
      </Stack>
    </Box>
  )
}

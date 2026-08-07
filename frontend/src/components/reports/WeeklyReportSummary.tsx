import { Box, Divider, Stack, Typography } from '@mui/material'
import { ProgressComparison } from '@/components/common/ProgressComparison'
import { SurfaceCard } from '@/components/common/SurfaceCard'
import type { WeeklyReport } from '@/types/api'
import { formatShortDate } from '@/utils/labels'

interface WeeklyReportSummaryProps {
  report: WeeklyReport
}

function NoteBlock({ title, body }: { title: string; body?: string | null }) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.25,
        bgcolor: '#FBFCFD',
        p: 2,
      }}
    >
      <Typography variant="overline" display="block" mb={1}>
        {title}
      </Typography>
      <Typography
        variant="body1"
        color="text.primary"
        whiteSpace="pre-wrap"
        sx={{ lineHeight: 1.7 }}
      >
        {body?.trim() || '—'}
      </Typography>
    </Box>
  )
}

export function WeeklyReportSummary({ report }: WeeklyReportSummaryProps) {
  return (
    <Stack spacing={2} className="fade-in-up">
      <SurfaceCard title="Summary" subtitle={`${report.projectCode} — ${report.projectName}`}>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            {report.year} / Hafta {report.weekNumber} · {formatShortDate(report.reportDate)}
          </Typography>
          <Divider />
          <Stack spacing={0.75} mt={0.5}>
            <Typography variant="body2">
              <strong>Proje durumu:</strong> {report.projectStatus || '—'}
            </Typography>
            <Typography variant="body2">
              <strong>Takvim durumu:</strong> {report.scheduleStatus || '—'}
            </Typography>
          </Stack>
        </Stack>
      </SurfaceCard>

      <SurfaceCard title="Progress" subtitle="Hedeflenen ve gerçekleşen ilerleme">
        <ProgressComparison planned={report.plannedProgress} actual={report.actualProgress} />
      </SurfaceCard>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        }}
      >
        <NoteBlock title="Completed" body={report.completedWork} />
        <NoteBlock title="Next Week" body={report.plannedWork} />
      </Box>

      <NoteBlock title="Notes" body={report.overallNote} />
    </Stack>
  )
}

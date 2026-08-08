import { Box, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { ProgressComparison } from '@/components/common/ProgressComparison'
import {
  ProjectStatusBadge,
  ScheduleStatusBadge,
} from '@/components/common/StatusBadges'
import { DASH } from '@/theme/dashboardTokens'
import type { WeeklyReport } from '@/types/api'
import { formatShortDate } from '@/utils/labels'

interface WeeklyReportSummaryProps {
  report: WeeklyReport
}

function DocumentSection({
  title,
  children,
  id,
}: {
  title: string
  children: ReactNode
  id?: string
}) {
  return (
    <Box
      component="section"
      id={id}
      sx={{
        py: DASH.space3,
        borderBottom: DASH.border,
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 0 },
      }}
    >
      <Typography
        variant="h5"
        component="h2"
        sx={{ mb: DASH.space2, fontWeight: 700, letterSpacing: '-0.01em' }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  )
}

function Prose({ text }: { text?: string | null }) {
  const value = text?.trim()
  if (!value) {
    return (
      <Typography variant="body1" color="text.secondary" fontStyle="italic">
        Bu bölüm için kayıtlı metin bulunmuyor.
      </Typography>
    )
  }
  return (
    <Typography
      variant="body1"
      color="text.primary"
      whiteSpace="pre-wrap"
      sx={{
        lineHeight: 1.75,
        maxWidth: '68ch',
        fontSize: '1.0125rem',
      }}
    >
      {value}
    </Typography>
  )
}

export function WeeklyReportSummary({ report }: WeeklyReportSummaryProps) {
  return (
    <Stack className="fade-in-up">
      <DocumentSection title="Özet" id="report-summary">
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            {report.projectCode} — {report.projectName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {report.year} / Hafta {report.weekNumber} · {formatShortDate(report.reportDate)}
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" mt={0.5}>
            {report.projectStatus && <ProjectStatusBadge status={report.projectStatus} />}
            {report.scheduleStatus && <ScheduleStatusBadge status={report.scheduleStatus} />}
          </Stack>
        </Stack>
      </DocumentSection>

      <DocumentSection title="İlerleme" id="report-progress">
        <ProgressComparison
          planned={report.plannedProgress}
          actual={report.actualProgress}
        />
      </DocumentSection>

      <DocumentSection title="✓ Bu Hafta Yapılanlar" id="report-completed">
        <Prose text={report.completedWork} />
      </DocumentSection>

      <DocumentSection title="→ Gelecek Hafta" id="report-planned">
        <Prose text={report.plannedWork} />
      </DocumentSection>

      <DocumentSection title="Genel Not" id="report-notes">
        <Prose text={report.overallNote} />
      </DocumentSection>
    </Stack>
  )
}

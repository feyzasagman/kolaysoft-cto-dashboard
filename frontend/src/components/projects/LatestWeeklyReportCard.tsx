import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import { Box, Button, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { HealthBadge } from '@/components/common/StatusBadges'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import {
  enrichLatestFromReport,
  mapLatestReport,
} from '@/utils/projectDetailMapper'
import type { LatestReportSummary, WeeklyReport } from '@/types/api'

interface LatestWeeklyReportCardProps {
  latest: LatestReportSummary | null | undefined
  fullReport?: WeeklyReport | null
  canCreateReport?: boolean
  projectId: number
}

function TruncatedNote({ title, text }: { title: string; text?: string | null }) {
  const [open, setOpen] = useState(false)
  const value = text?.trim() || '—'
  const long = value.length > 160 && value !== '—'

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.35}>
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.primary"
        whiteSpace="pre-wrap"
        sx={
          long && !open
            ? {
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }
            : undefined
        }
      >
        {value}
      </Typography>
      {long && (
        <Button size="small" onClick={() => setOpen((v) => !v)} sx={{ mt: 0.5, px: 0.5 }}>
          {open ? 'Daralt' : 'Devamını Gör'}
        </Button>
      )}
    </Box>
  )
}

export function LatestWeeklyReportCard({
  latest,
  fullReport,
  canCreateReport = false,
  projectId,
}: LatestWeeklyReportCardProps) {
  const navigate = useNavigate()
  const model = enrichLatestFromReport(mapLatestReport(latest), fullReport)

  if (!model) {
    return (
      <EmptyState
        icon={<AssessmentOutlinedIcon />}
        title="Bu proje için henüz haftalık rapor bulunmuyor."
        description="Haftalık rapor eklendiğinde özet burada görünür."
        actionLabel={canCreateReport ? 'Haftalık Rapor Oluştur' : undefined}
        onAction={
          canCreateReport ? () => navigate(`/reports/new?projectId=${projectId}`) : undefined
        }
      />
    )
  }

  return (
    <Box sx={{ ...surfaceSx, p: DASH.cardPadding }} aria-label="Son haftalık rapor">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        spacing={1}
        mb={DASH.space2}
      >
        <Box>
          <Typography variant="h5" component="h3">
            Son Haftalık Rapor
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {model.year} · Hafta {model.weekNumber} · {model.reportDateLabel}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
          <HealthBadge health={model.health} />
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
            {model.reportStatus}
          </Typography>
          <Button
            component={RouterLink}
            to={`/reports/${model.reportId}`}
            size="small"
            variant="outlined"
            aria-label="Rapor detayını aç"
          >
            Raporu Aç
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={DASH.space3} useFlexGap flexWrap="wrap" mb={DASH.space2}>
        <Typography variant="body2">
          <strong>Hedef:</strong> {model.progressTarget}%
        </Typography>
        <Typography variant="body2">
          <strong>Gerçekleşen:</strong> {model.progressActual}%
        </Typography>
        <Typography variant="body2">
          <strong>Açık risk:</strong> {model.openRiskCount}
        </Typography>
        <Typography variant="body2">
          <strong>Engel:</strong> {model.openBlockerCount}
        </Typography>
      </Stack>

      <Stack spacing={DASH.space2}>
        <TruncatedNote title="Bu Hafta Yapılanlar" text={model.completedWork} />
        <TruncatedNote title="Gelecek Hafta" text={model.plannedWork} />
        <TruncatedNote title="Genel Not" text={model.overallNote} />
      </Stack>
    </Box>
  )
}

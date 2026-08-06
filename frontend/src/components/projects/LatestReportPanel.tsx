import { Box, Button, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { HealthBadge } from '@/components/common/StatusBadges'
import { enrichLatestFromReport, mapLatestReport } from '@/utils/projectDetailMapper'
import type { LatestReportSummary, WeeklyReport } from '@/types/api'

interface LatestReportPanelProps {
  latest: LatestReportSummary | null | undefined
  fullReport?: WeeklyReport | null
  canCreateReport?: boolean
  projectId: number
  readOnly?: boolean
}

export function LatestReportPanel({
  latest,
  fullReport,
  canCreateReport = false,
  projectId,
  readOnly = false,
}: LatestReportPanelProps) {
  const base = mapLatestReport(latest)
  const model = enrichLatestFromReport(base, fullReport)

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
        Son haftalık rapor
      </Typography>

      {!model ? (
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            Bu proje için henüz haftalık rapor bulunmuyor.
          </Typography>
          {!readOnly && canCreateReport && (
            <Button
              component={RouterLink}
              to={`/reports/new?projectId=${projectId}`}
              variant="contained"
              sx={{ alignSelf: 'flex-start' }}
              aria-label="Haftalık rapor oluştur"
            >
              Haftalık Rapor Oluştur
            </Button>
          )}
        </Stack>
      ) : (
        <Stack spacing={1.25}>
          <Typography variant="body2">
            <strong>
              {model.year} / Hafta {model.weekNumber}
            </strong>
            {' · '}
            {model.reportDateLabel}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">Sağlık:</Typography>
            <HealthBadge health={model.health} />
          </Stack>
          <Typography variant="body2">
            İlerleme: {model.progressActual}% / hedef {model.progressTarget}%
          </Typography>
          <Typography variant="body2">Rapor durumu: {model.reportStatus}</Typography>
          <Typography variant="body2">
            Açık risk: {model.openRiskCount} · Blocker: {model.openBlockerCount}
          </Typography>
          <Typography variant="subtitle2">Yapılanlar</Typography>
          <Typography variant="body2" color="text.secondary" whiteSpace="pre-wrap">
            {model.completedWork || '—'}
          </Typography>
          <Typography variant="subtitle2">Yapılacaklar</Typography>
          <Typography variant="body2" color="text.secondary" whiteSpace="pre-wrap">
            {model.plannedWork || '—'}
          </Typography>
          <Typography variant="subtitle2">Genel not</Typography>
          <Typography variant="body2" color="text.secondary" whiteSpace="pre-wrap">
            {model.overallNote || '—'}
          </Typography>
          <Button
            component={RouterLink}
            to={`/reports/${model.reportId}`}
            variant="outlined"
            sx={{ alignSelf: 'flex-start' }}
            aria-label="Raporu görüntüle"
          >
            Raporu Görüntüle
          </Button>
        </Stack>
      )}
    </Box>
  )
}

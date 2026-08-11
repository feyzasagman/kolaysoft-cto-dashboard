import {
  Box,
  Stack,
  Typography,
} from '@mui/material'
import { useMemo } from 'react'
import { HealthBadge } from '@/components/common/StatusBadges'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import {
  buildExecutiveProjectInsight,
  type ExecutiveInsightSignal,
  type InsightSeverity,
} from '@/utils/executiveInsight'

interface ExecutiveProjectInsightProps {
  progressTarget: number
  progressActual: number
  health: string | null | undefined
  openRiskCount: number
  criticalRiskCount: number
  openWorkItems: number
  hasCurrentWeekReport: boolean
  hasAnyReport: boolean
}

const severityCopy: Record<InsightSeverity, { label: string; color: string; bg: string; border: string }> = {
  ok: { label: 'Kontrollü', color: '#1A7F37', bg: '#DAFBE1', border: '#B4EFC4' },
  attention: { label: 'Dikkat', color: '#9A6700', bg: '#FFF8C5', border: '#F0E09A' },
  critical: { label: 'Kritik', color: '#CF222E', bg: '#FFEBE9', border: '#FFCECB' },
}

function SignalCard({ signal }: { signal: ExecutiveInsightSignal }) {
  const tone = severityCopy[signal.tone]
  return (
    <Box
      sx={{
        border: DASH.border,
        borderColor: 'divider',
        borderRadius: 1,
        px: DASH.space2,
        py: 1.5,
        bgcolor: DASH.subtleBg,
        minWidth: 0,
      }}
      aria-label={`${signal.label}: ${signal.value}`}
    >
      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
        {signal.label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={700}
        sx={{ color: tone.color, wordBreak: 'break-word' }}
      >
        {signal.value}
      </Typography>
    </Box>
  )
}

/**
 * Project Detail — Yönetici Özeti (deterministik, UI-only).
 */
export function ExecutiveProjectInsight({
  progressTarget,
  progressActual,
  health,
  openRiskCount,
  criticalRiskCount,
  openWorkItems,
  hasCurrentWeekReport,
  hasAnyReport,
}: ExecutiveProjectInsightProps) {
  const insight = useMemo(
    () =>
      buildExecutiveProjectInsight({
        progressTarget,
        progressActual,
        health,
        openRiskCount,
        criticalRiskCount,
        openWorkItems,
        hasCurrentWeekReport,
        hasAnyReport,
      }),
    [
      progressTarget,
      progressActual,
      health,
      openRiskCount,
      criticalRiskCount,
      openWorkItems,
      hasCurrentWeekReport,
      hasAnyReport,
    ],
  )

  const sev = severityCopy[insight.severity]

  return (
    <Box
      sx={{
        ...surfaceSx,
        p: { xs: DASH.space2, md: DASH.cardPadding },
        mb: DASH.space3,
      }}
      aria-label={`Yönetici özeti: ${insight.headline}`}
      className="fade-in"
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'flex-start' }}
        spacing={DASH.space2}
        mb={DASH.space2}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="overline" color="text.secondary" letterSpacing={0.6}>
            Yönetici Özeti
          </Typography>
          <Typography variant="h5" component="h2" mt={0.25}>
            {insight.headline}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1} maxWidth={720}>
            {insight.summary}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 1.25,
              py: 0.5,
              borderRadius: 1,
              border: DASH.border,
              borderColor: sev.border,
              bgcolor: sev.bg,
              color: sev.color,
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
            aria-label={`Önem seviyesi: ${sev.label}`}
          >
            {sev.label}
          </Box>
          <HealthBadge health={health} />
        </Stack>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: DASH.space1,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))',
          },
        }}
      >
        {insight.signals.map((signal) => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
      </Box>
    </Box>
  )
}

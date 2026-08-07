import { Box, Button, LinearProgress, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { HealthBadge, ProjectStatusBadge } from '@/components/common/StatusBadges'
import { UserAvatar } from '@/components/common/UserAvatar'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import { formatRelativeTime } from '@/utils/formatRelative'
import {
  progressBarColor,
  type ProjectDetailViewModel,
} from '@/utils/projectDetailMapper'

interface ProjectQuickSidebarProps {
  model: ProjectDetailViewModel
  canCreateReport?: boolean
  backTo: string
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
        {label}
      </Typography>
      {children}
    </Box>
  )
}

export function ProjectQuickSidebar({
  model,
  canCreateReport = false,
  backTo,
}: ProjectQuickSidebarProps) {
  const behind = model.progressActual < model.progressTarget

  return (
    <Box
      component="aside"
      aria-label="Hızlı proje bilgisi"
      sx={{
        ...surfaceSx,
        p: DASH.cardPadding,
        position: { lg: 'sticky' },
        top: { lg: 72 },
      }}
    >
      <Typography variant="h5" component="h2" mb={0.5}>
        Quick Info
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={DASH.space3}>
        Anlık proje özeti
      </Typography>

      <Stack spacing={DASH.space2}>
        <InfoRow label="Health">
          <HealthBadge health={model.health} />
        </InfoRow>
        <InfoRow label="Status">
          <ProjectStatusBadge status={model.projectStatus} />
        </InfoRow>
        <InfoRow label="Progress">
          <Typography variant="body2" fontWeight={700} mb={0.75}>
            {model.progressActual}% / {model.progressTarget}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={model.progressActual}
            aria-label="Kenar çubuğu ilerleme"
            sx={{
              height: 8,
              '& .MuiLinearProgress-bar': {
                bgcolor: progressBarColor(model.health, behind),
              },
            }}
          />
        </InfoRow>
        <InfoRow label="Manager">
          <Stack direction="row" spacing={1} alignItems="center">
            <UserAvatar name={model.managerName} size={28} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={650} noWrap>
                {model.managerName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {model.managerEmail}
              </Typography>
            </Box>
          </Stack>
        </InfoRow>
        <InfoRow label="Started">
          <Typography variant="body2" fontWeight={650}>
            {model.startDateLabel}
          </Typography>
        </InfoRow>
        <InfoRow label="Updated">
          <Typography variant="body2" fontWeight={650}>
            {model.lastUpdateRaw
              ? formatRelativeTime(model.lastUpdateRaw, new Date(), 'en')
              : model.lastUpdateLabel}
          </Typography>
        </InfoRow>
        <InfoRow label="Target end">
          <Typography variant="body2" fontWeight={650}>
            {model.targetEndDateLabel}
          </Typography>
        </InfoRow>
      </Stack>

      <Stack spacing={1} mt={DASH.space3}>
        <Button component={RouterLink} to={backTo} variant="outlined" fullWidth>
          Geri Dön
        </Button>
        {model.latestReportId && (
          <Button
            component={RouterLink}
            to={`/reports/${model.latestReportId}`}
            variant="outlined"
            fullWidth
          >
            Son Raporu Gör
          </Button>
        )}
        {canCreateReport && (
          <Button
            component={RouterLink}
            to={`/reports/new?projectId=${model.projectId}`}
            variant="contained"
            fullWidth
          >
            Haftalık Rapor Oluştur
          </Button>
        )}
      </Stack>
    </Box>
  )
}

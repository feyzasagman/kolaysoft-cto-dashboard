import { Box, Breadcrumbs, Button, Link, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import {
  HealthBadge,
  ProjectStatusBadge,
  ReportAvailabilityBadge,
} from '@/components/common/StatusBadges'
import type { ProjectDetailViewModel } from '@/utils/projectDetailMapper'

interface ProjectDetailHeaderProps {
  model: ProjectDetailViewModel
  fromDashboard?: boolean
  dashboardQuery?: string
  canCreateReport?: boolean
  canOpenLatestReport?: boolean
  latestReportId?: number | null
  isCto?: boolean
}

export function ProjectDetailHeader({
  model,
  fromDashboard = false,
  dashboardQuery = '',
  canCreateReport = false,
  canOpenLatestReport = false,
  latestReportId = null,
  isCto = false,
}: ProjectDetailHeaderProps) {
  const backTo = fromDashboard ? `/dashboard${dashboardQuery}` : '/projects'

  return (
    <Box mb={2}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1.5 }}>
        <Link
          component={RouterLink}
          to={fromDashboard ? `/dashboard${dashboardQuery}` : '/dashboard'}
          underline="hover"
          color="inherit"
          variant="caption"
        >
          Dashboard
        </Link>
        <Link component={RouterLink} to={backTo} underline="hover" color="inherit" variant="caption">
          Projeler
        </Link>
        <Typography variant="caption" color="text.primary" fontWeight={650}>
          {model.name}
        </Typography>
      </Breadcrumbs>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ md: 'flex-start' }}
        spacing={1.5}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h1" sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
            {model.name}
          </Typography>
          <Typography color="text.secondary">
            {model.code} · Müşteri: {model.customer}
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" mt={1}>
            <ProjectStatusBadge status={model.projectStatus} />
            <HealthBadge health={model.health} />
            <ReportAvailabilityBadge available={model.hasCurrentWeekReport} />
          </Stack>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Yönetici: <strong>{model.managerName}</strong>
            {' · '}
            Son güncelleme: {model.lastUpdateLabel}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Button component={RouterLink} to={backTo} variant="outlined" aria-label="Geri dön">
            Geri Dön
          </Button>
          {canCreateReport && (
            <Button
              component={RouterLink}
              to={`/reports/new?projectId=${model.projectId}`}
              variant="contained"
              aria-label="Haftalık rapor oluştur"
            >
              Haftalık Rapor Oluştur
            </Button>
          )}
          {canOpenLatestReport && latestReportId && (
            <Button
              component={RouterLink}
              to={`/reports/${latestReportId}`}
              variant="outlined"
              aria-label="Son raporu görüntüle"
            >
              Son Raporu Gör
            </Button>
          )}
          {isCto ? (
            <Typography variant="caption" color="text.secondary" alignSelf="center">
              Salt okunur görünüm
            </Typography>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  )
}

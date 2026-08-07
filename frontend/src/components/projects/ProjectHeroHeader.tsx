import RefreshIcon from '@mui/icons-material/Refresh'
import {
  Box,
  Breadcrumbs,
  Button,
  LinearProgress,
  Link,
  Stack,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import {
  HealthBadge,
  ProjectStatusBadge,
  ReportAvailabilityBadge,
} from '@/components/common/StatusBadges'
import { UserAvatar } from '@/components/common/UserAvatar'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import { formatRelativeTime } from '@/utils/formatRelative'
import {
  progressBarColor,
  type ProjectDetailViewModel,
} from '@/utils/projectDetailMapper'

interface ProjectHeroHeaderProps {
  model: ProjectDetailViewModel
  fromDashboard?: boolean
  dashboardQuery?: string
  canCreateReport?: boolean
  canViewLatestReport?: boolean
  /** Proje edit route yok — false bırakın. */
  canEditProject?: boolean
  refreshing?: boolean
  onRefresh: () => void
}

export function ProjectHeroHeader({
  model,
  fromDashboard = false,
  dashboardQuery = '',
  canCreateReport = false,
  canViewLatestReport = false,
  canEditProject = false,
  refreshing = false,
  onRefresh,
}: ProjectHeroHeaderProps) {
  const projectsTo = fromDashboard ? `/dashboard${dashboardQuery}` : '/projects'
  const behind = model.progressActual < model.progressTarget

  return (
    <Box
      component="header"
      className="fade-in"
      sx={{
        ...surfaceSx,
        px: { xs: DASH.space2, md: DASH.space3 },
        py: DASH.space2,
        mb: DASH.space3,
      }}
    >
      <Breadcrumbs aria-label="Sayfa konumu" sx={{ mb: DASH.space2 }}>
        <Link
          component={RouterLink}
          to={fromDashboard ? `/dashboard${dashboardQuery}` : '/dashboard'}
          underline="hover"
          color="text.secondary"
          variant="caption"
          fontWeight={600}
        >
          Dashboard
        </Link>
        <Link
          component={RouterLink}
          to={projectsTo}
          underline="hover"
          color="text.secondary"
          variant="caption"
          fontWeight={600}
        >
          Projeler
        </Link>
        <Typography variant="caption" color="text.primary" fontWeight={650} noWrap>
          {model.name}
        </Typography>
      </Breadcrumbs>

      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        justifyContent="space-between"
        alignItems={{ lg: 'flex-start' }}
        spacing={DASH.space2}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="baseline" useFlexGap flexWrap="wrap" mb={0.75}>
            <Typography
              variant="h1"
              component="h1"
              sx={{ fontSize: { xs: '1.375rem', md: '1.625rem' } }}
            >
              {model.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              {model.code}
            </Typography>
            {model.customer !== '—' && (
              <Typography variant="caption" color="text.secondary">
                · {model.customer}
              </Typography>
            )}
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" mb={DASH.space2}>
            <ProjectStatusBadge status={model.projectStatus} />
            <HealthBadge health={model.health} />
            <ReportAvailabilityBadge available={model.hasCurrentWeekReport} />
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.25, sm: DASH.space3 }}
            useFlexGap
            flexWrap="wrap"
            alignItems={{ sm: 'center' }}
            mb={DASH.space2}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <UserAvatar name={model.managerName} size={28} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Project Manager
                </Typography>
                <Typography variant="body2" fontWeight={650}>
                  {model.managerName}
                </Typography>
              </Box>
            </Stack>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Last Updated
              </Typography>
              <Typography variant="body2" fontWeight={650}>
                {model.lastUpdateRaw
                  ? formatRelativeTime(model.lastUpdateRaw, new Date(), 'en')
                  : model.lastUpdateLabel}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Start
              </Typography>
              <Typography variant="body2" fontWeight={650}>
                {model.startDateLabel}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Target End
              </Typography>
              <Typography variant="body2" fontWeight={650}>
                {model.targetEndDateLabel}
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ maxWidth: 480 }}>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" color="text.secondary" fontWeight={650}>
                Gerçekleşen {model.progressActual}%
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={650}>
                Hedef {model.progressTarget}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={model.progressActual}
              aria-label={`Gerçekleşen ilerleme ${model.progressActual} yüzde`}
              aria-valuenow={model.progressActual}
              aria-valuemin={0}
              aria-valuemax={100}
              sx={{
                height: 6,
                bgcolor: '#EBEDF0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: progressBarColor(model.health, behind),
                },
              }}
            />
          </Box>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          sx={{ flexShrink: 0 }}
        >
          {canEditProject && (
            <Button variant="outlined" disabled aria-label="Düzenle">
              Düzenle
            </Button>
          )}
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
          {canViewLatestReport && model.latestReportId && (
            <Button
              component={RouterLink}
              to={`/reports/${model.latestReportId}`}
              variant="outlined"
              aria-label="Son raporu gör"
            >
              Raporu Gör
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Yenile"
          >
            {refreshing ? 'Yenileniyor…' : 'Yenile'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}

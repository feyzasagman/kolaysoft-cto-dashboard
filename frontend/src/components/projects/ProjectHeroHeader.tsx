import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import RefreshIcon from '@mui/icons-material/Refresh'
import {
  Box,
  Breadcrumbs,
  Button,
  IconButton,
  LinearProgress,
  Link,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
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
  canEditLatestReport?: boolean
  isCto?: boolean
  refreshing?: boolean
  onRefresh: () => void
}

export function ProjectHeroHeader({
  model,
  fromDashboard = false,
  dashboardQuery = '',
  canCreateReport = false,
  canEditLatestReport = false,
  isCto = false,
  refreshing = false,
  onRefresh,
}: ProjectHeroHeaderProps) {
  const navigate = useNavigate()
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const backTo = fromDashboard ? `/dashboard${dashboardQuery}` : '/projects'
  const behind = model.progressActual < model.progressTarget
  const barColor = progressBarColor(model.health, behind)

  return (
    <Box
      component="header"
      className="fade-in"
      sx={{
        ...surfaceSx,
        px: { xs: DASH.space2, md: DASH.space3 },
        py: { xs: DASH.space2, md: DASH.space3 },
        mb: DASH.sectionGap,
      }}
    >
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: DASH.space2 }}>
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
        <Link component={RouterLink} to={backTo} underline="hover" color="text.secondary" variant="caption" fontWeight={600}>
          Projects
        </Link>
        <Typography variant="caption" color="text.primary" fontWeight={650} noWrap>
          {model.name}
        </Typography>
      </Breadcrumbs>

      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        justifyContent="space-between"
        alignItems={{ lg: 'flex-start' }}
        spacing={DASH.space3}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center" mb={1}>
            <Typography variant="overline">Project</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              {model.code}
            </Typography>
          </Stack>

          <Typography
            variant="h1"
            component="h1"
            sx={{ fontSize: { xs: '1.5rem', md: '1.875rem' }, mb: 1 }}
          >
            {model.name}
          </Typography>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" mb={DASH.space2}>
            <ProjectStatusBadge status={model.projectStatus} />
            <HealthBadge health={model.health} />
            <ReportAvailabilityBadge available={model.hasCurrentWeekReport} />
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: DASH.space2, sm: DASH.space3 }}
            useFlexGap
            flexWrap="wrap"
            alignItems={{ sm: 'center' }}
            mb={DASH.space3}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <UserAvatar name={model.managerName} size={32} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Manager
                </Typography>
                <Typography variant="body2" fontWeight={650}>
                  {model.managerName}
                </Typography>
              </Box>
            </Stack>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Last updated
              </Typography>
              <Typography variant="body2" fontWeight={650}>
                {model.lastUpdateRaw
                  ? formatRelativeTime(model.lastUpdateRaw, new Date(), 'en')
                  : model.lastUpdateLabel}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Started
              </Typography>
              <Typography variant="body2" fontWeight={650}>
                {model.startDateLabel}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Current week
              </Typography>
              <Typography variant="body2" fontWeight={650}>
                {model.currentWeekLabel}
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ maxWidth: 520 }}>
            <Stack direction="row" justifyContent="space-between" mb={0.75}>
              <Typography variant="caption" color="text.secondary" fontWeight={650}>
                Progress
              </Typography>
              <Typography variant="caption" fontWeight={700}>
                {model.progressActual}% · target {model.progressTarget}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={model.progressActual}
              aria-label={`İlerleme ${model.progressActual} yüzde`}
              sx={{
                height: 10,
                bgcolor: '#EBEDF0',
                '& .MuiLinearProgress-bar': { bgcolor: barColor },
              }}
            />
          </Box>
        </Box>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ flexShrink: 0 }}>
          <Tooltip
            title={
              canEditLatestReport
                ? 'Son raporu düzenle'
                : 'Düzenlenecek rapor yok'
            }
          >
            <span>
              <Button
                variant="outlined"
                startIcon={<EditOutlinedIcon />}
                disabled={!canEditLatestReport}
                onClick={() => {
                  if (model.latestReportId) navigate(`/reports/${model.latestReportId}/edit`)
                }}
                aria-label="Düzenle"
              >
                Edit
              </Button>
            </span>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Yenile"
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
          <Tooltip title="More actions">
            <IconButton
              aria-label="Daha fazla işlem"
              aria-haspopup="menu"
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              sx={{ border: DASH.border, borderColor: 'divider', borderRadius: 1 }}
            >
              <MoreHorizIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem
              onClick={() => {
                setMenuAnchor(null)
                navigate(backTo)
              }}
            >
              <ListItemText>Geri dön</ListItemText>
            </MenuItem>
            {model.latestReportId && (
              <MenuItem
                onClick={() => {
                  setMenuAnchor(null)
                  navigate(`/reports/${model.latestReportId}`)
                }}
              >
                <ListItemText>Son raporu gör</ListItemText>
              </MenuItem>
            )}
            {canCreateReport && (
              <MenuItem
                onClick={() => {
                  setMenuAnchor(null)
                  navigate(`/reports/new?projectId=${model.projectId}`)
                }}
              >
                <ListItemText>Haftalık rapor oluştur</ListItemText>
              </MenuItem>
            )}
            {isCto && (
              <MenuItem disabled>
                <ListItemText>Salt okunur görünüm</ListItemText>
              </MenuItem>
            )}
          </Menu>
        </Stack>
      </Stack>
    </Box>
  )
}

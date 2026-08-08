import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import {
  Box,
  IconButton,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HealthBadge,
  ProjectStatusBadge,
  ReportAvailabilityBadge,
} from '@/components/common/StatusBadges'
import { UserAvatar } from '@/components/common/UserAvatar'
import { DASH } from '@/theme/dashboardTokens'
import { formatRelativeTime } from '@/utils/formatRelative'
import { progressBarColor } from '@/utils/projectDetailMapper'
import { rememberProjectId } from '@/utils/projectCache'
import type { PortfolioRow } from '@/utils/dashboardTypes'

export type PortfolioListItem = Pick<
  PortfolioRow,
  | 'projectId'
  | 'name'
  | 'code'
  | 'managerName'
  | 'projectStatus'
  | 'latestHealth'
  | 'progressTarget'
  | 'progressActual'
  | 'hasCurrentWeekReport'
  | 'latestReportDate'
  | 'latestReportLabel'
>

interface ProjectPortfolioRowProps {
  row: PortfolioListItem
  canCreateReport?: boolean
  showActionsAlways?: boolean
}

const ProgressCell = memo(function ProgressCell({
  actual,
  target,
  health,
}: {
  actual: number
  target: number
  health: string | null
}) {
  const behind = actual < target
  return (
    <Box sx={{ minWidth: 100, maxWidth: 140 }}>
      <Typography
        variant="body2"
        fontWeight={700}
        sx={{ fontSize: '0.9375rem', lineHeight: 1.2, mb: 0.5 }}
        aria-label={`İlerleme ${actual} yüzde`}
      >
        {actual}%
      </Typography>
      <LinearProgress
        variant="determinate"
        value={actual}
        aria-valuenow={actual}
        aria-valuemin={0}
        aria-valuemax={100}
        sx={{
          height: 4,
          bgcolor: '#EBEDF0',
          '& .MuiLinearProgress-bar': {
            bgcolor: progressBarColor(health, behind),
          },
        }}
      />
      <Typography variant="caption" color="text.secondary" display="block" mt={0.35}>
        hedef {target}%
      </Typography>
    </Box>
  )
})

export const ProjectPortfolioRow = memo(function ProjectPortfolioRow({
  row,
  canCreateReport = false,
  showActionsAlways = false,
}: ProjectPortfolioRowProps) {
  const navigate = useNavigate()
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

  const openDetail = () => {
    rememberProjectId(row.projectId)
    navigate(`/projects/${row.projectId}`)
  }

  return (
    <Box
      role="row"
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openDetail()
        }
      }}
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr auto',
          md: 'minmax(180px, 1.6fr) 140px 100px 100px 130px 120px 90px 120px',
        },
        gap: { xs: 1, md: DASH.space2 },
        alignItems: 'center',
        px: { xs: DASH.space2, md: DASH.space3 },
        py: 1.5,
        borderBottom: DASH.border,
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'background-color 120ms ease',
        '&:hover': { bgcolor: 'rgba(208, 215, 222, 0.28)' },
        '&:hover .row-actions, &:focus-within .row-actions': { opacity: 1 },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: -2,
        },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} noWrap>
          {row.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap display="block">
          {row.code}
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          mt={0.75}
          sx={{ display: { xs: 'flex', md: 'none' } }}
        >
          <ProjectStatusBadge status={row.projectStatus} />
          <HealthBadge health={row.latestHealth} />
          <ReportAvailabilityBadge available={row.hasCurrentWeekReport} />
        </Stack>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ display: { xs: 'none', md: 'flex' }, minWidth: 0 }}
      >
        <UserAvatar name={row.managerName} size={26} />
        <Typography variant="body2" noWrap>
          {row.managerName}
        </Typography>
      </Stack>

      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <ProjectStatusBadge status={row.projectStatus} />
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <HealthBadge health={row.latestHealth} />
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <ProgressCell
          actual={row.progressActual}
          target={row.progressTarget}
          health={row.latestHealth}
        />
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <ReportAvailabilityBadge available={row.hasCurrentWeekReport} />
        <Typography variant="caption" color="text.secondary" display="block" mt={0.35}>
          {row.latestReportLabel}
        </Typography>
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: { xs: 'none', md: 'block' } }}
      >
        {formatRelativeTime(row.latestReportDate)}
      </Typography>

      <Stack
        className="row-actions"
        direction="row"
        spacing={0.25}
        justifyContent="flex-end"
        onClick={(e) => e.stopPropagation()}
        sx={{
          opacity: { xs: 1, md: showActionsAlways ? 1 : 0 },
          transition: 'opacity 120ms ease',
        }}
      >
        <Tooltip title="Görüntüle">
          <IconButton size="small" aria-label={`${row.name} görüntüle`} onClick={openDetail}>
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Düzenle (yakında)">
          <span>
            <IconButton size="small" aria-label="Düzenle" disabled>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Raporlar">
          <IconButton
            size="small"
            aria-label={`${row.name} raporları`}
            onClick={() => {
              rememberProjectId(row.projectId)
              navigate(`/projects/${row.projectId}`)
            }}
          >
            <AssessmentOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Daha fazla">
          <IconButton
            size="small"
            aria-label={`${row.name} daha fazla`}
            aria-haspopup="menu"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
          >
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem
            onClick={() => {
              setMenuAnchor(null)
              openDetail()
            }}
          >
            <ListItemIcon>
              <OpenInNewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Detayı aç</ListItemText>
          </MenuItem>
          {canCreateReport && (
            <MenuItem
              onClick={() => {
                setMenuAnchor(null)
                rememberProjectId(row.projectId)
                navigate(`/reports/new?projectId=${row.projectId}`)
              }}
            >
              <ListItemText>Haftalık rapor oluştur</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </Stack>
    </Box>
  )
})

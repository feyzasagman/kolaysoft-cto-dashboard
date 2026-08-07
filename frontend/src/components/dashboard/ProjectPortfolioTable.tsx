import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
import { formatRelativeTime } from '@/utils/formatRelative'
import type { PortfolioRow } from '@/utils/dashboardTypes'

interface ProjectPortfolioTableProps {
  rows: PortfolioRow[]
  page: number
  size: number
  totalPages: number
  totalElements: number
  loading?: boolean
  detailQuerySuffix?: string
  onPageChange: (page: number) => void
  onSizeChange?: (size: number) => void
}

const ProgressCell = memo(function ProgressCell({
  target,
  actual,
}: {
  target: number
  actual: number
}) {
  const behind = actual < target
  return (
    <Box sx={{ minWidth: 110, maxWidth: 140 }}>
      <Stack direction="row" justifyContent="space-between" mb={0.5}>
        <Typography variant="caption" fontWeight={650} color={behind ? 'warning.dark' : 'text.primary'}>
          {actual}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          / {target}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={actual}
        aria-label={`Gerçekleşen ${actual} yüzde, hedef ${target} yüzde`}
        aria-valuenow={actual}
        aria-valuemin={0}
        aria-valuemax={100}
        sx={{
          height: 6,
          bgcolor: '#EBEDF0',
          '& .MuiLinearProgress-bar': {
            bgcolor: behind ? 'warning.main' : 'success.main',
          },
        }}
      />
    </Box>
  )
})

function RowActions({
  row,
  detailQuerySuffix,
}: {
  row: PortfolioRow
  detailQuerySuffix: string
}) {
  const navigate = useNavigate()
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)

  return (
    <>
      <Tooltip title="İşlemler">
        <IconButton
          size="small"
          aria-label={`${row.name} işlem menüsü`}
          aria-haspopup="menu"
          aria-expanded={Boolean(anchor)}
          onClick={(e) => {
            e.stopPropagation()
            setAnchor(e.currentTarget)
          }}
        >
          <MoreHorizIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            setAnchor(null)
            navigate(`/projects/${row.projectId}${detailQuerySuffix}`)
          }}
        >
          <ListItemIcon>
            <OpenInNewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Detayı aç</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}

export function ProjectPortfolioTable({
  rows,
  page,
  size,
  totalPages,
  totalElements,
  loading = false,
  detailQuerySuffix = '',
  onPageChange,
  onSizeChange,
}: ProjectPortfolioTableProps) {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
      className="fade-in-up"
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={1}
        sx={{ px: 2, py: 1.75, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Box>
          <Typography variant="h5" component="h2">
            Project Portfolio
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {totalElements} proje
            {loading ? ' · güncelleniyor…' : ''}
          </Typography>
        </Box>
        {onSizeChange && (
          <FormControl size="small" sx={{ minWidth: 90 }}>
            <InputLabel id="table-size-label">Boyut</InputLabel>
            <Select
              labelId="table-size-label"
              label="Boyut"
              value={size}
              onChange={(e) => onSizeChange(Number(e.target.value))}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
        )}
      </Stack>

      <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
        <Table size="small" stickyHeader aria-label="Proje portföy tablosu" aria-busy={loading}>
          <TableHead>
            <TableRow>
              <TableCell>Project</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Health</TableCell>
              <TableCell>Manager</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Latest report</TableCell>
              <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Updated</TableCell>
              <TableCell align="right" width={48} />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.projectId}
                hover
                onClick={() => navigate(`/projects/${row.projectId}${detailQuerySuffix}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Stack spacing={0.15}>
                    <Typography variant="body2" fontWeight={650} noWrap>
                      {row.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {row.code}
                      {row.criticalRiskCount > 0
                        ? ` · ${row.criticalRiskCount} kritik risk`
                        : row.openRiskCount > 0
                          ? ` · ${row.openRiskCount} açık risk`
                          : ''}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <ProjectStatusBadge status={row.projectStatus} />
                </TableCell>
                <TableCell>
                  <HealthBadge health={row.latestHealth} />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <UserAvatar name={row.managerName} size={26} />
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ display: { xs: 'none', sm: 'block' }, maxWidth: 120 }}
                    >
                      {row.managerName}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <ProgressCell target={row.progressTarget} actual={row.progressActual} />
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <Stack spacing={0.25}>
                    <ReportAvailabilityBadge available={row.hasCurrentWeekReport} />
                    <Typography variant="caption" color="text.secondary">
                      {row.latestReportLabel}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatRelativeTime(row.latestReportDate)}
                  </Typography>
                </TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <RowActions row={row} detailQuerySuffix={detailQuerySuffix} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Stack alignItems="center" py={1.75}>
          <Pagination
            page={page + 1}
            count={totalPages}
            onChange={(_, next) => onPageChange(next - 1)}
            color="primary"
            size="small"
            aria-label="Proje portföy sayfaları"
          />
        </Stack>
      )}
    </Box>
  )
}

export function ProjectTableSkeleton() {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
      aria-busy="true"
      aria-label="Proje tablosu yükleniyor"
    >
      <Box sx={{ px: 2, py: 1.75, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Skeleton width={160} height={22} />
        <Skeleton width={80} height={14} sx={{ mt: 0.5 }} />
      </Box>
      <Stack spacing={0}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Stack
            key={i}
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Box sx={{ flex: 1.4 }}>
              <Skeleton width="55%" height={16} />
              <Skeleton width="30%" height={12} sx={{ mt: 0.5 }} />
            </Box>
            <Skeleton width={64} height={20} />
            <Skeleton width={64} height={20} />
            <Skeleton variant="circular" width={26} height={26} />
            <Skeleton width={100} height={10} sx={{ display: { xs: 'none', md: 'block' } }} />
          </Stack>
        ))}
      </Stack>
    </Box>
  )
}

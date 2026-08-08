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
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
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
    <Box sx={{ minWidth: 120, maxWidth: 160 }}>
      <Stack direction="row" justifyContent="space-between" mb={0.5}>
        <Typography
          variant="caption"
          fontWeight={700}
          color={behind ? 'warning.dark' : 'text.primary'}
        >
          {actual}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          hedef {target}%
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
          height: 7,
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
      <Tooltip title="Actions">
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
    <Box sx={{ ...surfaceSx, overflow: 'hidden' }} className="fade-in-up">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={DASH.space1}
        sx={{
          px: DASH.space3,
          py: DASH.space2,
          borderBottom: DASH.border,
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography variant="h5" component="h2">
            Proje Portföyü
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {totalElements} proje
            {loading ? ' · güncelleniyor…' : ''}
          </Typography>
        </Box>
        {onSizeChange && (
          <FormControl size="small" sx={{ minWidth: 96 }}>
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
              <TableCell>Proje Adı</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Kod</TableCell>
              <TableCell>Yönetici</TableCell>
              <TableCell>Sağlık</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>İlerleme</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Son Rapor</TableCell>
              <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Güncelleme</TableCell>
              <TableCell align="right" width={52}>
                İşlem
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.projectId}
                hover
                onClick={() => navigate(`/projects/${row.projectId}${detailQuerySuffix}`)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(208, 215, 222, 0.28)' },
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={700} noWrap>
                    {row.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{ display: { xs: 'block', sm: 'none' } }}
                  >
                    {row.code}
                  </Typography>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {row.code}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <UserAvatar name={row.managerName} size={26} />
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ display: { xs: 'none', md: 'block' }, maxWidth: 128 }}
                    >
                      {row.managerName}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <HealthBadge health={row.latestHealth} />
                </TableCell>
                <TableCell>
                  <ProjectStatusBadge status={row.projectStatus} />
                </TableCell>
                <TableCell>
                  <ProgressCell target={row.progressTarget} actual={row.progressActual} />
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <Stack spacing={0.5} alignItems="flex-start">
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
        <Stack alignItems="center" py={DASH.space2}>
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
    <Box sx={{ ...surfaceSx, overflow: 'hidden' }} aria-busy="true" aria-label="Proje tablosu yükleniyor">
      <Box
        sx={{
          px: DASH.space3,
          py: DASH.space2,
          borderBottom: DASH.border,
          borderColor: 'divider',
        }}
      >
        <Skeleton width={170} height={22} />
        <Skeleton width={90} height={14} sx={{ mt: 0.75 }} />
      </Box>
      {Array.from({ length: 7 }).map((_, i) => (
        <Stack
          key={i}
          direction="row"
          spacing={DASH.space2}
          alignItems="center"
          sx={{
            px: DASH.space3,
            py: DASH.space2,
            borderBottom: DASH.border,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ flex: 1.6, minWidth: 0 }}>
            <Skeleton width="58%" height={16} />
            <Skeleton width="28%" height={12} sx={{ mt: 0.5 }} />
          </Box>
          <Skeleton variant="circular" width={26} height={26} />
          <Skeleton width={72} height={22} />
          <Skeleton width={72} height={22} />
          <Skeleton width={110} height={10} sx={{ display: { xs: 'none', md: 'block' } }} />
          <Skeleton width={28} height={28} />
        </Stack>
      ))}
    </Box>
  )
}

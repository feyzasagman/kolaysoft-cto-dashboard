import {
  Box,
  Button,
  LinearProgress,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import {
  HealthBadge,
  ProjectStatusBadge,
  ReportAvailabilityBadge,
} from '@/components/common/StatusBadges'
import type { PortfolioRow } from '@/utils/dashboardTypes'

interface ProjectPortfolioTableProps {
  rows: PortfolioRow[]
  page: number
  totalPages: number
  totalElements: number
  loading?: boolean
  onPageChange: (page: number) => void
}

function ProgressCell({ target, actual }: { target: number; actual: number }) {
  const behind = actual < target
  return (
    <Box sx={{ minWidth: 120 }}>
      <Stack direction="row" justifyContent="space-between" mb={0.5}>
        <Typography variant="caption" color={behind ? 'warning.dark' : 'text.secondary'}>
          {actual}% / {target}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={actual}
        aria-label={`Gerçekleşen ${actual} yüzde, hedef ${target} yüzde`}
        sx={{
          height: 6,
          borderRadius: 999,
          bgcolor: '#EBEDF0',
          '& .MuiLinearProgress-bar': {
            borderRadius: 999,
            bgcolor: behind ? 'warning.main' : 'success.main',
          },
        }}
      />
    </Box>
  )
}

export function ProjectPortfolioTable({
  rows,
  page,
  totalPages,
  totalElements,
  loading = false,
  onPageChange,
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
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={1}
        sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Typography variant="h5">Proje portföyü</Typography>
        <Typography variant="caption" color="text.secondary">
          {totalElements} proje
        </Typography>
      </Stack>

      <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
        <Table size="small" stickyHeader aria-label="Proje portföy tablosu" aria-busy={loading}>
          <TableHead>
            <TableRow>
              <TableCell>Proje</TableCell>
              <TableCell>Kod</TableCell>
              <TableCell>Proje Yöneticisi</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Sağlık</TableCell>
              <TableCell>İlerleme</TableCell>
              <TableCell>Açık Risk</TableCell>
              <TableCell>Kritik Risk</TableCell>
              <TableCell>Mevcut Hafta Raporu</TableCell>
              <TableCell>Son Rapor Tarihi</TableCell>
              <TableCell align="right">İşlem</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.projectId} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={650} noWrap>
                    {row.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display={{ xs: 'block', md: 'none' }}>
                    {row.code}
                  </Typography>
                </TableCell>
                <TableCell>{row.code}</TableCell>
                <TableCell>{row.managerName}</TableCell>
                <TableCell>
                  <ProjectStatusBadge status={row.projectStatus} />
                </TableCell>
                <TableCell>
                  <HealthBadge health={row.latestHealth} />
                </TableCell>
                <TableCell>
                  <ProgressCell target={row.progressTarget} actual={row.progressActual} />
                </TableCell>
                <TableCell>{row.openRiskCount}</TableCell>
                <TableCell>{row.criticalRiskCount}</TableCell>
                <TableCell>
                  <ReportAvailabilityBadge available={row.hasCurrentWeekReport} />
                </TableCell>
                <TableCell>{row.latestReportLabel}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/projects/${row.projectId}`)}
                    aria-label={`${row.name} detayını gör`}
                  >
                    Detayı Gör
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Stack alignItems="center" py={1.5}>
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
        p: 2,
        minHeight: 280,
      }}
      aria-busy="true"
      aria-label="Proje tablosu yükleniyor"
    >
      <Typography variant="body2" color="text.secondary">
        Proje portföyü yükleniyor…
      </Typography>
    </Box>
  )
}

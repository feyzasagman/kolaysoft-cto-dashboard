import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { WeeklyReportListRow } from '@/components/reports/WeeklyReportListRow'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import type { WeeklyReport } from '@/types/api'

interface WeeklyReportListProps {
  rows: WeeklyReport[]
  page: number
  size: number
  totalPages: number
  totalElements: number
  loading?: boolean
  onPageChange: (page: number) => void
  onSizeChange: (size: number) => void
}

const HEADERS = [
  'Proje',
  'Dönem',
  'Tarih',
  'Gerçekleşen',
  'Hedef',
  'Durum',
  'Takvim',
  '',
] as const

export function WeeklyReportList({
  rows,
  page,
  size,
  totalPages,
  totalElements,
  loading = false,
  onPageChange,
  onSizeChange,
}: WeeklyReportListProps) {
  return (
    <Box sx={{ ...surfaceSx, overflow: 'hidden' }} className="fade-in-up">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={1}
        sx={{
          px: DASH.space3,
          py: DASH.space2,
          borderBottom: DASH.border,
          borderColor: 'divider',
          bgcolor: '#FBFCFD',
        }}
      >
        <Box>
          <Typography variant="h5" component="h2">
            Rapor listesi
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {totalElements} kayıt
            {loading ? ' · güncelleniyor…' : ''}
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 96 }}>
          <InputLabel id="report-list-size">Boyut</InputLabel>
          <Select
            labelId="report-list-size"
            label="Boyut"
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Box
        role="row"
        aria-hidden
        sx={{
          display: { xs: 'none', md: 'grid' },
          gridTemplateColumns: 'minmax(180px, 1.8fr) 110px 120px 100px 100px 110px 110px 48px',
          gap: DASH.space2,
          px: DASH.space3,
          py: 1,
          borderBottom: DASH.border,
          borderColor: 'divider',
          bgcolor: '#F6F8FA',
        }}
      >
        {HEADERS.map((label) => (
          <Typography key={label || 'action'} variant="caption" fontWeight={700} color="text.secondary">
            {label}
          </Typography>
        ))}
      </Box>

      <Box role="table" aria-label="Haftalık rapor listesi" aria-busy={loading}>
        {rows.map((report) => (
          <WeeklyReportListRow key={report.id} report={report} />
        ))}
      </Box>

      {totalPages > 1 && (
        <Stack alignItems="center" py={DASH.space2}>
          <Pagination
            page={page + 1}
            count={totalPages}
            onChange={(_, next) => onPageChange(next - 1)}
            color="primary"
            aria-label="Rapor listesi sayfalama"
          />
        </Stack>
      )}
    </Box>
  )
}

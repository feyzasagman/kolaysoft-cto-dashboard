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
import { ProjectPortfolioRow, type PortfolioListItem } from '@/components/portfolio/ProjectPortfolioRow'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'

interface ProjectPortfolioListProps {
  rows: PortfolioListItem[]
  page: number
  size: number
  totalPages: number
  totalElements: number
  loading?: boolean
  canCreateReport?: boolean
  showSizeSelect?: boolean
  onPageChange: (page: number) => void
  onSizeChange?: (size: number) => void
}

export function ProjectPortfolioList({
  rows,
  page,
  size,
  totalPages,
  totalElements,
  loading = false,
  canCreateReport = false,
  showSizeSelect = true,
  onPageChange,
  onSizeChange,
}: ProjectPortfolioListProps) {
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
            Proje Portföyü
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {totalElements} proje
            {loading ? ' · güncelleniyor…' : ''}
          </Typography>
        </Box>
        {showSizeSelect && onSizeChange && (
          <FormControl size="small" sx={{ minWidth: 96 }}>
            <InputLabel id="portfolio-size">Boyut</InputLabel>
            <Select
              labelId="portfolio-size"
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

      {/* Column headers — desktop */}
      <Box
        role="row"
        aria-hidden
        sx={{
          display: { xs: 'none', md: 'grid' },
          gridTemplateColumns: 'minmax(180px, 1.6fr) 140px 100px 100px 130px 120px 90px 120px',
          gap: DASH.space2,
          px: DASH.space3,
          py: 1,
          borderBottom: DASH.border,
          borderColor: 'divider',
          bgcolor: '#F6F8FA',
        }}
      >
        {['Proje', 'Yönetici', 'Durum', 'Sağlık', 'İlerleme', 'Son Rapor', 'Güncelleme', 'İşlem'].map(
          (label) => (
            <Typography key={label} variant="caption" fontWeight={700} color="text.secondary">
              {label}
            </Typography>
          ),
        )}
      </Box>

      <Box role="table" aria-label="Proje portföy listesi" aria-busy={loading}>
        {rows.map((row) => (
          <ProjectPortfolioRow
            key={row.projectId}
            row={row}
            canCreateReport={canCreateReport}
          />
        ))}
      </Box>

      {totalPages > 1 && (
        <Stack alignItems="center" py={DASH.space2}>
          <Pagination
            page={page + 1}
            count={totalPages}
            onChange={(_, next) => onPageChange(next - 1)}
            color="primary"
            size="small"
            aria-label="Portföy sayfaları"
          />
        </Stack>
      )}
    </Box>
  )
}

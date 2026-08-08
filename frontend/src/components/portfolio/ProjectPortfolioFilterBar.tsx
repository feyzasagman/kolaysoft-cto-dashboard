import CloseIcon from '@mui/icons-material/Close'
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { ProjectStatus, ReportHealth, UserRow } from '@/types/api'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import { DASHBOARD_SORT_OPTIONS } from '@/utils/dashboardFilterMapper'
import type { PortfolioFilterState } from '@/utils/portfolioFilterState'

export type { PortfolioFilterState }

interface ProjectPortfolioFilterBarProps {
  value: PortfolioFilterState
  managers?: UserRow[]
  onChange: (next: PortfolioFilterState) => void
  onClear: () => void
}

function isActive(value: PortfolioFilterState) {
  return Boolean(
    value.search.trim() ||
      value.projectStatus ||
      value.health ||
      value.managerId ||
      value.hasCurrentWeekReport,
  )
}

export function ProjectPortfolioFilterBar({
  value,
  managers = [],
  onChange,
  onClear,
}: ProjectPortfolioFilterBarProps) {
  const patch = (partial: Partial<PortfolioFilterState>) => onChange({ ...value, ...partial })
  const active = isActive(value)
  const managerName =
    managers.find((m) => String(m.id) === value.managerId)?.fullName ?? value.managerId

  return (
    <Box
      sx={{
        ...surfaceSx,
        p: DASH.cardPadding,
        mb: DASH.space2,
        borderColor: active ? 'primary.light' : 'divider',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        mb={DASH.space2}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <FilterListIcon fontSize="small" color="action" aria-hidden />
          <Typography variant="h5" component="h2">
            Filtreler
          </Typography>
          {active && (
            <Chip size="small" color="primary" label="Aktif" sx={{ height: 20, fontWeight: 700 }} />
          )}
        </Stack>
        <Button
          variant={active ? 'contained' : 'outlined'}
          startIcon={<CloseIcon />}
          onClick={onClear}
          disabled={!active}
          aria-label="Filtreleri temizle"
        >
          Filtreleri Temizle
        </Button>
      </Stack>

      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        alignItems={{ lg: 'center' }}
        mb={active ? DASH.space2 : 0}
      >
        <TextField
          placeholder="Proje ara…"
          value={value.search}
          onChange={(e) => patch({ search: e.target.value })}
          sx={{ minWidth: { xs: '100%', lg: 220 }, flex: { lg: '1 1 200px' } }}
          inputProps={{ 'aria-label': 'Proje ara' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" htmlColor="#656D76" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 130 }}>
          <InputLabel id="pf-status">Durum</InputLabel>
          <Select
            labelId="pf-status"
            label="Durum"
            value={value.projectStatus}
            onChange={(e) => patch({ projectStatus: e.target.value as ProjectStatus | '' })}
          >
            <MenuItem value="">Tümü</MenuItem>
            <MenuItem value="PLANNED">Planlandı</MenuItem>
            <MenuItem value="ACTIVE">Aktif</MenuItem>
            <MenuItem value="ON_HOLD">Beklemede</MenuItem>
            <MenuItem value="COMPLETED">Tamamlandı</MenuItem>
            <MenuItem value="CANCELLED">İptal</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 130 }}>
          <InputLabel id="pf-health">Sağlık</InputLabel>
          <Select
            labelId="pf-health"
            label="Sağlık"
            value={value.health}
            onChange={(e) => patch({ health: e.target.value as ReportHealth | '' })}
          >
            <MenuItem value="">Tümü</MenuItem>
            <MenuItem value="GREEN">Sağlıklı</MenuItem>
            <MenuItem value="YELLOW">Dikkat</MenuItem>
            <MenuItem value="RED">Kritik</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="pf-manager">Yönetici</InputLabel>
          <Select
            labelId="pf-manager"
            label="Yönetici"
            value={value.managerId}
            onChange={(e) => patch({ managerId: String(e.target.value) })}
          >
            <MenuItem value="">Tümü</MenuItem>
            {managers.map((m) => (
              <MenuItem key={m.id} value={String(m.id)}>
                {m.fullName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 140 }}>
          <InputLabel id="pf-week">Hafta</InputLabel>
          <Select
            labelId="pf-week"
            label="Hafta"
            value={value.hasCurrentWeekReport}
            onChange={(e) =>
              patch({ hasCurrentWeekReport: e.target.value as '' | 'true' | 'false' })
            }
          >
            <MenuItem value="">Tümü</MenuItem>
            <MenuItem value="true">Rapor var</MenuItem>
            <MenuItem value="false">Rapor eksik</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 170 }}>
          <InputLabel id="pf-sort">Sırala</InputLabel>
          <Select
            labelId="pf-sort"
            label="Sırala"
            value={value.sort}
            onChange={(e) => patch({ sort: e.target.value })}
          >
            {DASHBOARD_SORT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {active && (
        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
          {value.search.trim() && (
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={`Search: ${value.search.trim()}`}
              onDelete={() => patch({ search: '' })}
            />
          )}
          {value.projectStatus && (
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={`Status: ${value.projectStatus}`}
              onDelete={() => patch({ projectStatus: '' })}
            />
          )}
          {value.health && (
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={`Health: ${value.health}`}
              onDelete={() => patch({ health: '' })}
            />
          )}
          {value.managerId && (
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={`Manager: ${managerName}`}
              onDelete={() => patch({ managerId: '' })}
            />
          )}
          {value.hasCurrentWeekReport && (
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={
                value.hasCurrentWeekReport === 'true' ? 'Week: rapor var' : 'Week: rapor eksik'
              }
              onDelete={() => patch({ hasCurrentWeekReport: '' })}
            />
          )}
        </Stack>
      )}
    </Box>
  )
}

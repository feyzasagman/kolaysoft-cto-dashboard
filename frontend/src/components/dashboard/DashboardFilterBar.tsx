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
import type { ProjectStatus, ReportHealth, RiskLevel, UserRow } from '@/types/api'
import {
  DASHBOARD_SORT_OPTIONS,
  hasActiveFilters,
  type DashboardFilterState,
} from '@/utils/dashboardFilterMapper'

interface DashboardFilterBarProps {
  value: DashboardFilterState
  managers?: UserRow[]
  onChange: (next: DashboardFilterState) => void
  onClear: () => void
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <Chip
      label={label}
      onClick={onClick}
      clickable
      variant={active ? 'filled' : 'outlined'}
      color={active ? 'primary' : 'default'}
      size="small"
      sx={{
        fontWeight: 650,
        bgcolor: active ? 'primary.main' : 'background.paper',
        color: active ? 'primary.contrastText' : 'text.secondary',
        borderColor: active ? 'primary.main' : 'divider',
        '&:hover': {
          bgcolor: active ? 'primary.dark' : 'action.hover',
        },
      }}
    />
  )
}

export function DashboardFilterBar({
  value,
  managers = [],
  onChange,
  onClear,
}: DashboardFilterBarProps) {
  const patch = (partial: Partial<DashboardFilterState>) => {
    onChange({ ...value, ...partial, page: 0 })
  }

  const active = hasActiveFilters(value)
  const managerName =
    managers.find((m) => String(m.id) === value.managerId)?.fullName ?? value.managerId

  return (
    <Box
      id="dashboard-filters"
      sx={{
        border: '1px solid',
        borderColor: active ? 'primary.light' : 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        p: 2,
        transition: 'border-color 160ms ease',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        mb={1.5}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <FilterListIcon fontSize="small" color="action" />
          <Typography variant="h5" component="h2">
            Filtreler
          </Typography>
          {active && (
            <Chip size="small" color="primary" label="Aktif" sx={{ height: 20, fontSize: '0.7rem' }} />
          )}
        </Stack>
        <Button
          variant={active ? 'contained' : 'outlined'}
          onClick={onClear}
          disabled={!active}
          aria-label="Filtreleri temizle"
        >
          Clear Filters
        </Button>
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        alignItems={{ md: 'center' }}
        mb={1.5}
      >
        <TextField
          placeholder="Proje adı veya kod"
          value={value.search}
          onChange={(e) => patch({ search: e.target.value })}
          sx={{ minWidth: { xs: '100%', md: 220 } }}
          inputProps={{ 'aria-label': 'Proje ara' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" htmlColor="#656D76" />
              </InputAdornment>
            ),
          }}
        />

        <FormControl sx={{ minWidth: 140 }}>
          <InputLabel id="filter-status-label">Status</InputLabel>
          <Select
            labelId="filter-status-label"
            label="Status"
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

        <FormControl sx={{ minWidth: 140 }}>
          <InputLabel id="filter-health-label">Health</InputLabel>
          <Select
            labelId="filter-health-label"
            label="Health"
            value={value.health}
            onChange={(e) => patch({ health: e.target.value as ReportHealth | '' })}
          >
            <MenuItem value="">Tümü</MenuItem>
            <MenuItem value="GREEN">Sağlıklı</MenuItem>
            <MenuItem value="YELLOW">Dikkat</MenuItem>
            <MenuItem value="RED">Kritik</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel id="filter-manager-label">Manager</InputLabel>
          <Select
            labelId="filter-manager-label"
            label="Manager"
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

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="filter-week-label">Week report</InputLabel>
          <Select
            labelId="filter-week-label"
            label="Week report"
            value={value.hasCurrentWeekReport}
            onChange={(e) =>
              patch({ hasCurrentWeekReport: e.target.value as '' | 'true' | 'false' })
            }
          >
            <MenuItem value="">Tümü</MenuItem>
            <MenuItem value="true">Rapor Var</MenuItem>
            <MenuItem value="false">Rapor Eksik</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 140 }}>
          <InputLabel id="filter-risk-label">Risk</InputLabel>
          <Select
            labelId="filter-risk-label"
            label="Risk"
            value={value.riskLevel}
            onChange={(e) => patch({ riskLevel: e.target.value as RiskLevel | '' })}
          >
            <MenuItem value="">Tümü</MenuItem>
            <MenuItem value="CRITICAL">Kritik</MenuItem>
            <MenuItem value="HIGH">Yüksek</MenuItem>
            <MenuItem value="MEDIUM">Orta</MenuItem>
            <MenuItem value="LOW">Düşük</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 170 }}>
          <InputLabel id="filter-sort-label">Sıralama</InputLabel>
          <Select
            labelId="filter-sort-label"
            label="Sıralama"
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

      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
        <Typography variant="caption" color="text.secondary" mr={0.5}>
          Hızlı seçim:
        </Typography>
        <FilterChip
          label="Aktif"
          active={value.projectStatus === 'ACTIVE'}
          onClick={() =>
            patch({ projectStatus: value.projectStatus === 'ACTIVE' ? '' : 'ACTIVE' })
          }
        />
        <FilterChip
          label="Kritik sağlık"
          active={value.health === 'RED'}
          onClick={() => patch({ health: value.health === 'RED' ? '' : 'RED' })}
        />
        <FilterChip
          label="Rapor eksik"
          active={value.hasCurrentWeekReport === 'false'}
          onClick={() =>
            patch({
              hasCurrentWeekReport: value.hasCurrentWeekReport === 'false' ? '' : 'false',
            })
          }
        />
        <FilterChip
          label="Kritik risk"
          active={value.riskLevel === 'CRITICAL'}
          onClick={() =>
            patch({ riskLevel: value.riskLevel === 'CRITICAL' ? '' : 'CRITICAL' })
          }
        />
        {value.search && (
          <Chip
            size="small"
            label={`Search: ${value.search}`}
            onDelete={() => patch({ search: '' })}
            color="primary"
            variant="outlined"
          />
        )}
        {value.managerId && (
          <Chip
            size="small"
            label={`Manager: ${managerName}`}
            onDelete={() => patch({ managerId: '' })}
            color="primary"
            variant="outlined"
          />
        )}
      </Stack>
    </Box>
  )
}

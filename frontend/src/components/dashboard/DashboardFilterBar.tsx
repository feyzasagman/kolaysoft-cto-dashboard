import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import type { ProjectStatus, ReportHealth, RiskLevel, UserRow } from '@/types/api'
import {
  DASHBOARD_SORT_OPTIONS,
  type DashboardFilterState,
} from '@/utils/dashboardFilterMapper'

interface DashboardFilterBarProps {
  value: DashboardFilterState
  managers?: UserRow[]
  onChange: (next: DashboardFilterState) => void
  onClear: () => void
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

  return (
    <Box
      id="dashboard-filters"
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        p: 1.5,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        alignItems={{ md: 'center' }}
      >
        <TextField
          label="Ara"
          placeholder="Proje adı veya kod"
          value={value.search}
          onChange={(e) => patch({ search: e.target.value })}
          sx={{ minWidth: { xs: '100%', md: 200 } }}
          inputProps={{ 'aria-label': 'Proje ara' }}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="filter-status-label">Durum</InputLabel>
          <Select
            labelId="filter-status-label"
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

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="filter-health-label">Sağlık</InputLabel>
          <Select
            labelId="filter-health-label"
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

        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel id="filter-week-label">Bu hafta rapor</InputLabel>
          <Select
            labelId="filter-week-label"
            label="Bu hafta rapor"
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

        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel id="filter-manager-label">Yönetici</InputLabel>
          <Select
            labelId="filter-manager-label"
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
          <InputLabel id="filter-risk-label">Risk seviyesi</InputLabel>
          <Select
            labelId="filter-risk-label"
            label="Risk seviyesi"
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

        <FormControl sx={{ minWidth: 180 }}>
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

        <FormControl sx={{ minWidth: 110 }}>
          <InputLabel id="filter-size-label">Sayfa boyutu</InputLabel>
          <Select
            labelId="filter-size-label"
            label="Sayfa boyutu"
            value={value.size}
            onChange={(e) => patch({ size: Number(e.target.value), page: 0 })}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>

        <Button variant="outlined" onClick={onClear} aria-label="Filtreleri temizle">
          Filtreleri Temizle
        </Button>
      </Stack>
    </Box>
  )
}

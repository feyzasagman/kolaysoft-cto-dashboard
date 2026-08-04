import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import type { ProjectFiltersState, ProjectStatus, ReportHealth } from '@/types/api'

interface FilterBarProps {
  value: ProjectFiltersState
  onChange: (next: ProjectFiltersState) => void
}

export function FilterBar({ value, onChange }: FilterBarProps) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1}
      useFlexGap
      flexWrap="wrap"
      alignItems={{ md: 'center' }}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        p: 1.25,
      }}
    >
      <TextField
        label="Proje ara"
        placeholder="Ad veya kod"
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
        sx={{ minWidth: { xs: '100%', md: 200 } }}
      />
      <FormControl sx={{ minWidth: 140 }}>
        <InputLabel>Durum</InputLabel>
        <Select
          label="Durum"
          value={value.projectStatus}
          onChange={(event) =>
            onChange({ ...value, projectStatus: event.target.value as ProjectStatus | '' })
          }
        >
          <MenuItem value="">Tümü</MenuItem>
          <MenuItem value="ACTIVE">Aktif</MenuItem>
          <MenuItem value="PLANNED">Planlandı</MenuItem>
          <MenuItem value="ON_HOLD">Beklemede</MenuItem>
          <MenuItem value="COMPLETED">Tamamlandı</MenuItem>
          <MenuItem value="CANCELLED">İptal</MenuItem>
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 140 }}>
        <InputLabel>Sağlık</InputLabel>
        <Select
          label="Sağlık"
          value={value.health}
          onChange={(event) =>
            onChange({ ...value, health: event.target.value as ReportHealth | '' })
          }
        >
          <MenuItem value="">Tümü</MenuItem>
          <MenuItem value="GREEN">Sağlıklı</MenuItem>
          <MenuItem value="YELLOW">Dikkat</MenuItem>
          <MenuItem value="RED">Kritik</MenuItem>
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 170 }}>
        <InputLabel>Bu hafta rapor</InputLabel>
        <Select
          label="Bu hafta rapor"
          value={value.hasCurrentWeekReport}
          onChange={(event) =>
            onChange({
              ...value,
              hasCurrentWeekReport: event.target.value as '' | 'true' | 'false',
            })
          }
        >
          <MenuItem value="">Tümü</MenuItem>
          <MenuItem value="true">Var</MenuItem>
          <MenuItem value="false">Yok</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  )
}

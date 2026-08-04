import FilterListIcon from '@mui/icons-material/FilterList'
import {
  Box,
  Button,
  Collapse,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useState } from 'react'
import type { ProjectFiltersState, ProjectStatus, ReportHealth, RiskLevel } from '@/types/api'

interface ProjectFiltersProps {
  value: ProjectFiltersState
  onChange: (next: ProjectFiltersState) => void
}

export function ProjectFilters({ value, onChange }: ProjectFiltersProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [open, setOpen] = useState(false)

  const fields = (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1.25}
      useFlexGap
      flexWrap="wrap"
      alignItems={{ md: 'center' }}
    >
      <TextField
        label="Proje ara"
        placeholder="Ad veya kod"
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
        sx={{ minWidth: { xs: '100%', md: 200 } }}
      />
      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel>Durum</InputLabel>
        <Select
          label="Durum"
          value={value.projectStatus}
          onChange={(event) =>
            onChange({ ...value, projectStatus: event.target.value as ProjectStatus | '' })
          }
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
      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel>Risk</InputLabel>
        <Select
          label="Risk"
          value={value.riskLevel}
          onChange={(event) =>
            onChange({ ...value, riskLevel: event.target.value as RiskLevel | '' })
          }
        >
          <MenuItem value="">Tümü</MenuItem>
          <MenuItem value="LOW">LOW</MenuItem>
          <MenuItem value="MEDIUM">MEDIUM</MenuItem>
          <MenuItem value="HIGH">HIGH</MenuItem>
          <MenuItem value="CRITICAL">CRITICAL</MenuItem>
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 180 }}>
        <InputLabel>Bu hafta rapor</InputLabel>
        <Select
          label="Bu hafta rapor"
          value={value.hasCurrentWeekReport}
          onChange={(event) =>
            onChange({
              ...value,
              hasCurrentWeekReport: event.target.value as '' | 'true' | 'false',
              missingReport: false,
            })
          }
        >
          <MenuItem value="">Tümü</MenuItem>
          <MenuItem value="true">Var</MenuItem>
          <MenuItem value="false">Yok</MenuItem>
        </Select>
      </FormControl>
      <FormControlLabel
        control={
          <Switch
            checked={value.missingReport}
            onChange={(event) =>
              onChange({
                ...value,
                missingReport: event.target.checked,
                hasCurrentWeekReport: event.target.checked ? 'false' : value.hasCurrentWeekReport,
              })
            }
          />
        }
        label="Raporu olmayanlar"
      />
    </Stack>
  )

  if (!isMobile) {
    return (
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          p: 1.5,
        }}
      >
        {fields}
      </Box>
    )
  }

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        p: 1.5,
      }}
    >
      <Button
        startIcon={<FilterListIcon />}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="Filtre panelini aç"
      >
        Filtreler
      </Button>
      <Collapse in={open}>{fields}</Collapse>
    </Box>
  )
}

import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined'
import ViewModuleOutlinedIcon from '@mui/icons-material/ViewModuleOutlined'
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material'
import type { DashboardViewMode } from '@/types/api'

interface ProjectViewToggleProps {
  value: DashboardViewMode
  onChange: (value: DashboardViewMode) => void
}

export function ProjectViewToggle({ value, onChange }: ProjectViewToggleProps) {
  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={value}
      onChange={(_, next: DashboardViewMode | null) => {
        if (next) onChange(next)
      }}
      aria-label="Proje görünüm seçici"
    >
      <ToggleButton value="cards" aria-label="Kart görünümü">
        <Tooltip title="Kart görünümü">
          <ViewModuleOutlinedIcon fontSize="small" />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="list" aria-label="Liste görünümü">
        <Tooltip title="Liste görünümü">
          <ViewListOutlinedIcon fontSize="small" />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

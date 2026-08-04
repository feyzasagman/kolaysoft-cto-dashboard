import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import { Button, Stack, Typography } from '@mui/material'

interface DashboardHeaderProps {
  fullName?: string | null
  onRefresh: () => void
}

export function DashboardHeader({ fullName, onRefresh }: DashboardHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      justifyContent="space-between"
      alignItems={{ lg: 'flex-start' }}
      spacing={2}
      mb={2.5}
    >
      <Stack spacing={0.5}>
        <Typography variant="h5">Proje Genel Görünümü</Typography>
        <Typography color="text.secondary">
          Projelerin sağlık, ilerleme, risk ve haftalık aktivite durumlarının güncel özeti.
        </Typography>
        {fullName && (
          <Typography variant="body2" fontWeight={600}>
            Hoş geldiniz, {fullName}
          </Typography>
        )}
      </Stack>

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        <Button
          variant="outlined"
          startIcon={<FilterAltOutlinedIcon />}
          aria-label="Filtrelere git"
          onClick={() => {
            document.getElementById('dashboard-filters')?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          Filtre
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          aria-label="Dashboard verilerini yenile"
        >
          Yenile
        </Button>
      </Stack>
    </Stack>
  )
}

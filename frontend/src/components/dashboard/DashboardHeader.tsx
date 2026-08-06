import RefreshIcon from '@mui/icons-material/Refresh'
import { Button, Stack, Typography } from '@mui/material'
import type { RoleType } from '@/types/api'
import { mapDashboardHeader } from '@/utils/dashboardMapper'

interface DashboardHeaderProps {
  role?: RoleType
  fullName?: string | null
  lastRefreshedAt?: Date | null
  refreshing?: boolean
  onRefresh: () => void
}

export function DashboardHeader({
  role,
  fullName,
  lastRefreshedAt,
  refreshing = false,
  onRefresh,
}: DashboardHeaderProps) {
  const model = mapDashboardHeader(role, fullName)
  const refreshedLabel = lastRefreshedAt
    ? lastRefreshedAt.toLocaleString('tr-TR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      alignItems={{ md: 'flex-start' }}
      spacing={1.5}
      mb={2.5}
    >
      <Stack spacing={0.5} sx={{ minWidth: 0 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
          {model.title}
        </Typography>
        <Typography color="text.secondary" maxWidth={720}>
          {model.description}
        </Typography>
        {model.welcome && (
          <Typography variant="body2" fontWeight={650}>
            {model.welcome}
          </Typography>
        )}
        {refreshedLabel && (
          <Typography variant="caption" color="text.secondary">
            Son yenilenme: {refreshedLabel}
          </Typography>
        )}
      </Stack>

      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={onRefresh}
        disabled={refreshing}
        aria-label="Dashboard verilerini yenile"
        sx={{ alignSelf: { xs: 'stretch', md: 'flex-start' }, minHeight: 36 }}
      >
        {refreshing ? 'Yenileniyor…' : 'Yenile'}
      </Button>
    </Stack>
  )
}

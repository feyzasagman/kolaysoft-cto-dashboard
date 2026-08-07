import RefreshIcon from '@mui/icons-material/Refresh'
import { Button, Typography } from '@mui/material'
import { PageHeader } from '@/components/common/PageHeader'
import type { RoleType } from '@/types/api'
import { formatRelativeTime } from '@/utils/formatRelative'
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

  return (
    <PageHeader
      title={model.title}
      subtitle={model.description}
      meta={
        <>
          {model.welcome && (
            <Typography variant="body2" fontWeight={650} color="text.primary" display="block">
              {model.welcome}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            {lastRefreshedAt
              ? `Updated ${formatRelativeTime(lastRefreshedAt)}`
              : 'Veriler henüz yenilenmedi'}
          </Typography>
        </>
      }
      actions={
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Dashboard verilerini yenile"
          sx={{ minHeight: 36 }}
        >
          {refreshing ? 'Yenileniyor…' : 'Yenile'}
        </Button>
      }
    />
  )
}

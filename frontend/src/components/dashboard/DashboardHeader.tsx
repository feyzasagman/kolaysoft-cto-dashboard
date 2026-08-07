import RefreshIcon from '@mui/icons-material/Refresh'
import {
  Box,
  Breadcrumbs,
  Button,
  Link,
  Stack,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import type { RoleType } from '@/types/api'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
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
  const updatedText = lastRefreshedAt
    ? `Last updated ${formatRelativeTime(lastRefreshedAt, new Date(), 'en')}`
    : 'Last updated —'

  return (
    <Box
      component="header"
      className="fade-in"
      sx={{
        ...surfaceSx,
        px: { xs: DASH.space2, md: DASH.space3 },
        py: { xs: DASH.space2, md: DASH.space3 },
        mb: DASH.sectionGap,
      }}
    >
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: DASH.space2 }}>
        <Link
          component={RouterLink}
          to="/dashboard"
          underline="hover"
          color="text.secondary"
          variant="caption"
          fontWeight={600}
        >
          Ana Sayfa
        </Link>
        <Typography variant="caption" color="text.primary" fontWeight={650}>
          Dashboard
        </Typography>
      </Breadcrumbs>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ md: 'flex-start' }}
        spacing={DASH.space2}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h1" component="h1">
            {model.title}
          </Typography>
          <Typography color="text.secondary" mt={1} maxWidth={640}>
            {model.description}
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.5, sm: DASH.space2 }}
            alignItems={{ sm: 'center' }}
            mt={DASH.space2}
            useFlexGap
            flexWrap="wrap"
          >
            {model.welcome && (
              <Typography variant="body2" fontWeight={650}>
                {model.welcome}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" aria-live="polite">
              {updatedText}
            </Typography>
          </Stack>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Dashboard verilerini yenile"
          sx={{ alignSelf: { xs: 'stretch', md: 'flex-start' }, minHeight: 36 }}
        >
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      </Stack>
    </Box>
  )
}

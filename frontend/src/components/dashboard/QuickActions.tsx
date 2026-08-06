import { Box, Button, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { RoleType } from '@/types/api'

interface QuickAction {
  label: string
  to: string
  roles: RoleType[]
}

/** Yalnızca mevcut rotalar. */
const ACTIONS: QuickAction[] = [
  { label: 'Projeler', to: '/projects', roles: ['ADMIN'] },
  { label: 'Kullanıcılar', to: '/users', roles: ['ADMIN'] },
  { label: 'Haftalık Raporlar', to: '/reports', roles: ['ADMIN'] },
  { label: 'Projeler', to: '/projects', roles: ['CTO'] },
  { label: 'Haftalık Raporlar', to: '/reports', roles: ['CTO'] },
  { label: 'Projelerim', to: '/projects', roles: ['PROJECT_MANAGER'] },
  { label: 'Raporlarım', to: '/reports', roles: ['PROJECT_MANAGER'] },
  { label: 'Yeni Rapor', to: '/reports/new', roles: ['PROJECT_MANAGER'] },
]

export function QuickActions() {
  const { hasAnyRole } = useAuth()
  const navigate = useNavigate()

  const visible = ACTIONS.filter((action) => hasAnyRole(...action.roles))
  if (visible.length === 0) return null

  const unique = visible.filter(
    (action, index, arr) =>
      arr.findIndex((item) => item.label === action.label && item.to === action.to) === index,
  )

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        p: 2,
      }}
    >
      <Typography variant="h5" mb={0.5}>
        Hızlı işlemler
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={1.25}>
        Rolünüze göre erişilebilir kısayollar
      </Typography>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {unique.map((action) => (
          <Button
            key={`${action.label}-${action.to}`}
            size="small"
            variant="outlined"
            onClick={() => navigate(action.to)}
            aria-label={action.label}
          >
            {action.label}
          </Button>
        ))}
      </Stack>
    </Box>
  )
}

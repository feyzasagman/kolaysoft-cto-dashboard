import { Button, Paper, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { RoleType } from '@/types/api'

interface QuickAction {
  label: string
  to: string
  roles: RoleType[]
}

const ACTIONS: QuickAction[] = [
  { label: 'Yeni Proje', to: '/projects', roles: ['ADMIN'] },
  { label: 'Kullanıcılar', to: '/users', roles: ['ADMIN'] },
  { label: 'Tüm Raporlar', to: '/reports', roles: ['ADMIN'] },
  { label: 'Projeleri Görüntüle', to: '/projects', roles: ['CTO'] },
  { label: 'Haftalık Raporlar', to: '/reports', roles: ['CTO'] },
  { label: 'Riskleri İncele', to: '/dashboard', roles: ['CTO'] },
  { label: 'Projelerim', to: '/reports', roles: ['PROJECT_MANAGER'] },
  { label: 'Raporlarım', to: '/reports', roles: ['PROJECT_MANAGER'] },
]

export function QuickActions() {
  const { hasAnyRole } = useAuth()
  const navigate = useNavigate()

  const visible = ACTIONS.filter((action) => hasAnyRole(...action.roles))
  if (visible.length === 0) return null

  // Deduplicate by label+to for roles that share destinations
  const unique = visible.filter(
    (action, index, arr) =>
      arr.findIndex((item) => item.label === action.label && item.to === action.to) === index,
  )

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle2" mb={1.25}>
        Hızlı işlemler
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
    </Paper>
  )
}

import { Button } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { AppErrorState } from '@/components/common/AppErrorState'
import { useAuth } from '@/contexts/AuthContext'

export function UnauthorizedPage() {
  const { logout } = useAuth()

  return (
    <AppErrorState
      kind="forbidden"
      title="Unauthorized"
      description="Bu sayfayı görüntülemek için yetkiniz yok."
      secondaryAction={
        <>
          <Button component={RouterLink} to="/dashboard" variant="contained">
            Dashboard
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              logout()
              window.location.assign('/login')
            }}
          >
            Logout
          </Button>
        </>
      }
    />
  )
}

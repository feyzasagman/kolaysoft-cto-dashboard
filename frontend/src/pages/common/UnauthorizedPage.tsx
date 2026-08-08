import { Button } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { AppErrorState } from '@/components/common/AppErrorState'
import { useAuth } from '@/contexts/AuthContext'

export function UnauthorizedPage() {
  const { logout } = useAuth()

  return (
    <AppErrorState
      kind="forbidden"
      title="Bu sayfayı görüntüleme yetkiniz bulunmamaktadır."
      description="Yetkili olduğunuz sayfalara dönün veya farklı bir hesapla giriş yapın."
      secondaryAction={
        <>
          <Button component={RouterLink} to="/dashboard" variant="contained">
            Kontrol Paneli
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              logout()
              window.location.assign('/login')
            }}
          >
            Çıkış Yap
          </Button>
        </>
      }
    />
  )
}

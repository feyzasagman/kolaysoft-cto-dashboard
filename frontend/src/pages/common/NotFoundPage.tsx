import { Button } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { AppErrorState } from '@/components/common/AppErrorState'

export function NotFoundPage() {
  return (
    <AppErrorState
      kind="notFound"
      title="Sayfa bulunamadı."
      description="Aradığınız sayfa mevcut değil veya taşınmış olabilir."
      secondaryAction={
        <Button component={RouterLink} to="/dashboard" variant="contained">
          Kontrol Paneline Dön
        </Button>
      }
    />
  )
}

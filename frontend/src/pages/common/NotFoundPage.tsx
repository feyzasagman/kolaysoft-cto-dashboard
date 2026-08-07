import { Button } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { AppErrorState } from '@/components/common/AppErrorState'

export function NotFoundPage() {
  return (
    <AppErrorState
      kind="notFound"
      title="Page Not Found"
      description="Aradığınız sayfa bulunamadı."
      secondaryAction={
        <Button component={RouterLink} to="/dashboard" variant="contained">
          Dashboard&apos;a dön
        </Button>
      }
    />
  )
}

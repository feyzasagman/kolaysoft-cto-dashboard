import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { useLoginMutation } from '@/hooks/useApiQueries'
import { getErrorMessage } from '@/utils/errorUtils'

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta giriniz.'),
  password: z.string().min(1, 'Şifre zorunludur.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const loginMutation = useLoginMutation()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@kolaysoft.com.tr',
      password: '',
    },
  })

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      const response = await loginMutation.mutateAsync(values)
      login(response)
      toast.success('Giriş başarılı.')
      const redirectTo =
        (location.state as { from?: string } | null)?.from
        || (response.role === 'PROJECT_MANAGER' ? '/projects' : '/dashboard')
      navigate(redirectTo, { replace: true })
    } catch (error) {
      const message = getErrorMessage(error, 'Giriş başarısız.')
      setFormError(message)
      toast.error(message)
    }
  })

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        background:
          'radial-gradient(circle at 20% 20%, rgba(15,107,92,0.18), transparent 36%), radial-gradient(circle at 80% 0%, rgba(31,58,95,0.16), transparent 30%), linear-gradient(160deg, #0B1F1A 0%, #12352D 45%, #1A2B3D 100%)',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 440, border: 'rgba(255,255,255,0.06)' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={1} mb={3}>
            <Typography variant="overline" color="primary" fontWeight={700}>
              Kolaysoft
            </Typography>
            <Typography variant="h4">CTO Dashboard</Typography>
            <Typography color="text.secondary">
              Haftalık proje durum takibi için giriş yapın.
            </Typography>
          </Stack>

          <Box component="form" onSubmit={onSubmit} noValidate>
            <Stack spacing={2}>
              {formError && <Alert severity="error">{formError}</Alert>}
              <TextField
                label="E-posta"
                type="email"
                autoComplete="email"
                fullWidth
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                {...register('email')}
              />
              <TextField
                label="Şifre"
                type="password"
                autoComplete="current-password"
                fullWidth
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                {...register('password')}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

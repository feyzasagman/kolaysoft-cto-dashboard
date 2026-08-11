import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import type { RoleType, UserRow } from '@/types/api'
import { ROLE_OPTIONS } from '@/utils/labels'

const baseSchema = z.object({
  fullName: z.string().trim().min(1, 'Ad soyad zorunludur.').max(200, 'Ad soyad en fazla 200 karakter olabilir.'),
  email: z.string().trim().email('Geçerli bir e-posta adresi girin.'),
  role: z.enum(['ADMIN', 'CTO', 'PROJECT_MANAGER'], { required_error: 'Rol seçilmelidir.' }),
  password: z.string().optional().or(z.literal('')),
})

type FormValues = z.infer<typeof baseSchema>

interface UserFormDialogProps {
  open: boolean
  initial?: UserRow | null
  submitting?: boolean
  onClose: () => void
  onSubmit: (values: {
    fullName: string
    email: string
    role: RoleType
    password?: string
  }) => Promise<void>
}

const dialogPaperSx = {
  m: { xs: 1, sm: 2 },
  width: { xs: 'calc(100% - 16px)', sm: '100%' },
  maxHeight: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 64px)' },
}

export function UserFormDialog({
  open,
  initial,
  submitting = false,
  onClose,
  onSubmit,
}: UserFormDialogProps) {
  const isEdit = Boolean(initial)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(
      baseSchema.superRefine((values, ctx) => {
        if (!isEdit && (!values.password || values.password.length < 8)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Şifre en az 8 karakter olmalıdır.',
            path: ['password'],
          })
        }
        if (isEdit && values.password && values.password.length > 0 && values.password.length < 8) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Şifre en az 8 karakter olmalıdır.',
            path: ['password'],
          })
        }
      }),
    ),
    defaultValues: {
      fullName: '',
      email: '',
      role: 'PROJECT_MANAGER',
      password: '',
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      fullName: initial?.fullName ?? '',
      email: initial?.email ?? '',
      role: (initial?.role as RoleType) || 'PROJECT_MANAGER',
      password: '',
    })
  }, [open, initial, reset])

  const submit = handleSubmit(async (values) => {
    if (submitting) return
    const payload: {
      fullName: string
      email: string
      role: RoleType
      password?: string
    } = {
      fullName: values.fullName.trim(),
      email: values.email.trim().toLowerCase(),
      role: values.role,
    }
    if (values.password && values.password.length >= 8) {
      payload.password = values.password
    }
    await onSubmit(payload)
  })

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="user-form-title"
      PaperProps={{ sx: dialogPaperSx }}
    >
      <DialogTitle id="user-form-title">{isEdit ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı'}</DialogTitle>
      <DialogContent sx={{ overflowY: 'auto', pt: 1 }}>
        <Stack component="form" id="user-form" onSubmit={submit} spacing={2} mt={0.5}>
          <TextField
            label="Ad Soyad *"
            fullWidth
            {...register('fullName')}
            error={Boolean(errors.fullName)}
            helperText={errors.fullName?.message}
            autoComplete="name"
            disabled={submitting}
            inputProps={{ 'aria-required': true }}
          />
          <TextField
            label="E-posta *"
            fullWidth
            {...register('email')}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            autoComplete="email"
            disabled={submitting}
            inputProps={{ 'aria-required': true }}
          />
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.role)} disabled={submitting}>
                <InputLabel id="user-role-label">Rol *</InputLabel>
                <Select {...field} labelId="user-role-label" label="Rol *" aria-required>
                  {ROLE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
              </FormControl>
            )}
          />
          <TextField
            label={isEdit ? 'Yeni şifre (opsiyonel)' : 'Başlangıç şifresi *'}
            type="password"
            fullWidth
            {...register('password')}
            error={Boolean(errors.password)}
            helperText={
              errors.password?.message ||
              (isEdit ? 'Boş bırakılırsa mevcut şifre korunur.' : 'En az 8 karakter')
            }
            autoComplete="new-password"
            disabled={submitting}
            inputProps={{ 'aria-required': !isEdit }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, flexShrink: 0 }}>
        <Button onClick={onClose} disabled={submitting} aria-label="İptal">
          İptal
        </Button>
        <Button
          type="submit"
          form="user-form"
          variant="contained"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
          aria-busy={submitting}
        >
          {submitting ? 'Kaydediliyor…' : isEdit ? 'Güncelle' : 'Oluştur'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

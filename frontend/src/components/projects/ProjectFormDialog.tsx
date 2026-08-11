import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Box,
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
import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import type { ProjectResponse, ProjectStatus, UserRow } from '@/types/api'
import { PROJECT_STATUS_OPTIONS } from '@/utils/labels'

const schema = z
  .object({
    code: z
      .string()
      .transform((v) => v.replace(/\s+/g, '').trim())
      .pipe(z.string().min(1, 'Proje kodu zorunludur.').max(50, 'Proje kodu en fazla 50 karakter olabilir.')),
    name: z.string().trim().min(1, 'Proje adı zorunludur.').max(200, 'Proje adı en fazla 200 karakter olabilir.'),
    description: z.string().optional().or(z.literal('')),
    managerId: z.coerce.number({ invalid_type_error: 'Proje yöneticisi seçilmelidir.' }).int().positive('Proje yöneticisi seçilmelidir.'),
    status: z.enum(['PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'], {
      required_error: 'Durum seçilmelidir.',
    }),
    startDate: z.string().optional().or(z.literal('')),
    targetEndDate: z.string().optional().or(z.literal('')),
  })
  .superRefine((values, ctx) => {
    if (values.startDate && Number.isNaN(Date.parse(values.startDate))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Geçerli bir başlangıç tarihi girin.',
        path: ['startDate'],
      })
    }
    if (values.targetEndDate && Number.isNaN(Date.parse(values.targetEndDate))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Geçerli bir hedef bitiş tarihi girin.',
        path: ['targetEndDate'],
      })
    }
    if (values.startDate && values.targetEndDate && values.targetEndDate < values.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Hedef bitiş tarihi başlangıç tarihinden önce olamaz.',
        path: ['targetEndDate'],
      })
    }
  })

type FormValues = z.infer<typeof schema>

export interface ProjectFormPayload {
  code: string
  name: string
  description?: string | null
  managerId: number
  status: ProjectStatus
  startDate?: string | null
  targetEndDate?: string | null
}

interface ProjectFormDialogProps {
  open: boolean
  initial?: ProjectResponse | null
  initialFromDashboard?: {
    projectId: number
    code: string
    name: string
    description?: string | null
    managerId: number | null
    projectStatus: string
    startDate?: string | null
    targetEndDate?: string | null
  } | null
  managers: UserRow[]
  submitting?: boolean
  onClose: () => void
  onSubmit: (payload: ProjectFormPayload) => Promise<void>
}

const dialogPaperSx = {
  m: { xs: 1, sm: 2 },
  width: { xs: 'calc(100% - 16px)', sm: '100%' },
  maxHeight: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 64px)' },
}

export function ProjectFormDialog({
  open,
  initial,
  initialFromDashboard,
  managers,
  submitting = false,
  onClose,
  onSubmit,
}: ProjectFormDialogProps) {
  const isEdit = Boolean(initial || initialFromDashboard)
  const activeManagers = useMemo(
    () => managers.filter((m) => m.active && m.role === 'PROJECT_MANAGER'),
    [managers],
  )

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      managerId: 0,
      status: 'ACTIVE',
      startDate: '',
      targetEndDate: '',
    },
  })

  useEffect(() => {
    if (!open) return
    const firstManagerId = managers.find((m) => m.active && m.role === 'PROJECT_MANAGER')?.id ?? 0
    if (initial) {
      reset({
        code: initial.code,
        name: initial.name,
        description: initial.description ?? '',
        managerId: initial.managerId ?? 0,
        status: (initial.status as ProjectStatus) || 'ACTIVE',
        startDate: initial.startDate ?? '',
        targetEndDate: initial.targetEndDate ?? '',
      })
      return
    }
    if (initialFromDashboard) {
      reset({
        code: initialFromDashboard.code,
        name: initialFromDashboard.name,
        description: initialFromDashboard.description ?? '',
        managerId: initialFromDashboard.managerId ?? 0,
        status: (initialFromDashboard.projectStatus as ProjectStatus) || 'ACTIVE',
        startDate: initialFromDashboard.startDate ?? '',
        targetEndDate: initialFromDashboard.targetEndDate ?? '',
      })
      return
    }
    reset({
      code: '',
      name: '',
      description: '',
      managerId: firstManagerId,
      status: 'ACTIVE',
      startDate: '',
      targetEndDate: '',
    })
  }, [open, initial, initialFromDashboard, managers, reset])

  const submit = handleSubmit(async (values) => {
    if (submitting) return
    await onSubmit({
      code: values.code.replace(/\s+/g, '').trim().toUpperCase(),
      name: values.name.trim(),
      description: values.description?.trim() || null,
      managerId: values.managerId,
      status: values.status,
      startDate: values.startDate || null,
      targetEndDate: values.targetEndDate || null,
    })
  })

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="project-form-title"
      PaperProps={{ sx: dialogPaperSx }}
    >
      <DialogTitle id="project-form-title">{isEdit ? 'Projeyi Düzenle' : 'Yeni Proje'}</DialogTitle>
      <DialogContent sx={{ overflowY: 'auto', pt: 1 }}>
        <Stack component="form" id="project-form" onSubmit={submit} spacing={2} mt={0.5}>
          {activeManagers.length === 0 && (
            <Alert severity="warning">
              Atanabilecek aktif proje yöneticisi bulunamadı. Önce Kullanıcılar ekranından aktif bir Proje
              Yöneticisi oluşturun.
            </Alert>
          )}

          <TextField
            label="Kod *"
            fullWidth
            {...register('code')}
            error={Boolean(errors.code)}
            helperText={errors.code?.message || 'Boşluklar otomatik temizlenir.'}
            disabled={isEdit || submitting}
            inputProps={{ 'aria-required': true }}
          />
          <TextField
            label="Ad *"
            fullWidth
            {...register('name')}
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            disabled={submitting}
            inputProps={{ 'aria-required': true }}
          />
          <TextField
            label="Açıklama (opsiyonel)"
            fullWidth
            multiline
            minRows={2}
            {...register('description')}
            disabled={submitting}
          />
          <Controller
            name="managerId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.managerId)} disabled={submitting || activeManagers.length === 0}>
                <InputLabel id="project-manager-label">Proje Yöneticisi *</InputLabel>
                <Select
                  {...field}
                  labelId="project-manager-label"
                  label="Proje Yöneticisi *"
                  value={field.value || ''}
                  aria-required
                >
                  {activeManagers.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      <Box>
                        <Box component="span" sx={{ fontWeight: 600 }}>{m.fullName}</Box>
                        <Box component="span" sx={{ color: 'text.secondary', ml: 1, fontSize: '0.875rem' }}>
                          {m.email}
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {errors.managerId?.message ||
                    (activeManagers.length === 0 ? 'Atanabilecek aktif proje yöneticisi bulunamadı.' : undefined)}
                </FormHelperText>
              </FormControl>
            )}
          />
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.status)} disabled={submitting}>
                <InputLabel id="project-status-label">Durum *</InputLabel>
                <Select {...field} labelId="project-status-label" label="Durum *" aria-required>
                  {PROJECT_STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
              </FormControl>
            )}
          />
          <TextField
            label="Başlangıç tarihi"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            {...register('startDate')}
            error={Boolean(errors.startDate)}
            helperText={errors.startDate?.message}
            disabled={submitting}
          />
          <TextField
            label="Hedef bitiş tarihi"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            {...register('targetEndDate')}
            error={Boolean(errors.targetEndDate)}
            helperText={errors.targetEndDate?.message}
            disabled={submitting}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, flexShrink: 0 }}>
        <Button onClick={onClose} disabled={submitting} aria-label="İptal">
          İptal
        </Button>
        <Button
          type="submit"
          form="project-form"
          variant="contained"
          disabled={submitting || activeManagers.length === 0}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
          aria-busy={submitting}
        >
          {submitting ? 'Kaydediliyor…' : isEdit ? 'Güncelle' : 'Oluştur'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import type { AssignedProjectRow, WeeklyReport, WeeklyReportRequest } from '@/types/api'
import { currentIsoWeek } from '@/utils/labels'

const schema = z.object({
  projectId: z.coerce.number({ invalid_type_error: 'Proje seçimi zorunludur.' }).min(1, 'Proje seçimi zorunludur.'),
  weekNumber: z.coerce
    .number({ invalid_type_error: 'Hafta numarası zorunludur.' })
    .int('Hafta numarası tam sayı olmalıdır.')
    .min(1, 'Hafta numarası en az 1 olmalıdır.')
    .max(53, 'Hafta numarası en fazla 53 olabilir.'),
  reportDate: z.string().min(1, 'Rapor tarihi zorunludur.'),
  plannedProgress: z.string().optional(),
  actualProgress: z.string().optional(),
  projectStatus: z.string().max(50, 'Proje durumu en fazla 50 karakter olabilir.').optional(),
  scheduleStatus: z.string().max(50, 'Takvim durumu en fazla 50 karakter olabilir.').optional(),
  completedWork: z.string().optional(),
  plannedWork: z.string().optional(),
  overallNote: z.string().optional(),
}).superRefine((values, ctx) => {
  for (const key of ['plannedProgress', 'actualProgress'] as const) {
    const raw = values[key]
    if (raw === undefined || raw === '') continue
    const n = Number(raw)
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [key],
        message: key === 'plannedProgress'
          ? 'Planlanan ilerleme 0-100 arasında olmalıdır.'
          : 'Gerçekleşen ilerleme 0-100 arasında olmalıdır.',
      })
    }
  }
})

type WeeklyReportFormValues = z.infer<typeof schema>

function toProgress(value?: string): number | null {
  if (value === undefined || value === '') return null
  return Number(value)
}

interface WeeklyReportFormProps {
  mode: 'create' | 'edit'
  projects: AssignedProjectRow[]
  initial?: WeeklyReport | null
  lockedProjectId?: number | null
  submitError?: string | null
  submitting?: boolean
  onSubmit: (payload: WeeklyReportRequest | Omit<WeeklyReportRequest, 'projectId'>) => Promise<void>
  onCancel: () => void
}

export function WeeklyReportForm({
  mode,
  projects,
  initial,
  lockedProjectId,
  submitError,
  submitting = false,
  onSubmit,
  onCancel,
}: WeeklyReportFormProps) {
  const iso = currentIsoWeek()
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<WeeklyReportFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      projectId: initial?.projectId ?? lockedProjectId ?? (projects[0]?.projectId ?? 0),
      weekNumber: initial?.weekNumber ?? iso.week,
      reportDate: initial?.reportDate ?? iso.reportDate,
      plannedProgress: initial?.plannedProgress != null ? String(initial.plannedProgress) : '',
      actualProgress: initial?.actualProgress != null ? String(initial.actualProgress) : '',
      projectStatus: initial?.projectStatus ?? 'ACTIVE',
      scheduleStatus: initial?.scheduleStatus ?? 'ON_TRACK',
      completedWork: initial?.completedWork ?? '',
      plannedWork: initial?.plannedWork ?? '',
      overallNote: initial?.overallNote ?? '',
    },
  })

  useEffect(() => {
    if (lockedProjectId && lockedProjectId > 0) {
      setValue('projectId', lockedProjectId)
    }
  }, [lockedProjectId, setValue])

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (isDirty && !submitting) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty, submitting])

  const submit = handleSubmit(async (values) => {
    const base = {
      weekNumber: values.weekNumber,
      reportDate: values.reportDate,
      plannedProgress: toProgress(values.plannedProgress),
      actualProgress: toProgress(values.actualProgress),
      projectStatus: values.projectStatus || null,
      scheduleStatus: values.scheduleStatus || null,
      completedWork: values.completedWork || null,
      plannedWork: values.plannedWork || null,
      overallNote: values.overallNote || null,
    }
    if (mode === 'create') {
      await onSubmit({ ...base, projectId: values.projectId })
    } else {
      await onSubmit(base)
    }
  })

  return (
    <Box
      component="form"
      onSubmit={submit}
      noValidate
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Typography variant="h5" mb={2}>
        {mode === 'create' ? 'Haftalık Rapor Oluştur' : 'Haftalık Raporu Düzenle'}
      </Typography>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        <Controller
          name="projectId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={Boolean(errors.projectId)} disabled={mode === 'edit' || Boolean(lockedProjectId)}>
              <InputLabel id="report-project-label">Proje</InputLabel>
              <Select
                {...field}
                labelId="report-project-label"
                label="Proje"
                value={field.value || ''}
              >
                {projects.map((project) => (
                  <MenuItem key={project.projectId} value={project.projectId}>
                    {project.code} — {project.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.projectId && (
                <Typography variant="caption" color="error" mt={0.5}>
                  {errors.projectId.message}
                </Typography>
              )}
            </FormControl>
          )}
        />

        <TextField
          label="Hafta numarası"
          type="number"
          inputProps={{ min: 1, max: 53 }}
          error={Boolean(errors.weekNumber)}
          helperText={errors.weekNumber?.message}
          {...register('weekNumber')}
        />

        <TextField
          label="Rapor tarihi"
          type="date"
          InputLabelProps={{ shrink: true }}
          error={Boolean(errors.reportDate)}
          helperText={errors.reportDate?.message || 'Yıl, rapor tarihinden türetilir.'}
          {...register('reportDate')}
        />

        <TextField
          label="Planlanan ilerleme (%)"
          type="number"
          inputProps={{ min: 0, max: 100 }}
          error={Boolean(errors.plannedProgress)}
          helperText={errors.plannedProgress?.message}
          {...register('plannedProgress')}
        />

        <TextField
          label="Gerçekleşen ilerleme (%)"
          type="number"
          inputProps={{ min: 0, max: 100 }}
          error={Boolean(errors.actualProgress)}
          helperText={errors.actualProgress?.message}
          {...register('actualProgress')}
        />

        <TextField
          label="Proje durumu"
          placeholder="ACTIVE"
          error={Boolean(errors.projectStatus)}
          helperText={errors.projectStatus?.message || 'Serbest metin (örn. ACTIVE)'}
          {...register('projectStatus')}
        />

        <TextField
          label="Takvim durumu"
          placeholder="ON_TRACK"
          error={Boolean(errors.scheduleStatus)}
          helperText={errors.scheduleStatus?.message || 'Örn. ON_TRACK, AT_RISK, DELAY'}
          {...register('scheduleStatus')}
        />

        <TextField
          label="Yapılanlar"
          multiline
          minRows={3}
          sx={{ gridColumn: { md: '1 / -1' } }}
          {...register('completedWork')}
        />

        <TextField
          label="Yapılacaklar"
          multiline
          minRows={3}
          sx={{ gridColumn: { md: '1 / -1' } }}
          {...register('plannedWork')}
        />

        <TextField
          label="Genel not"
          multiline
          minRows={2}
          sx={{ gridColumn: { md: '1 / -1' } }}
          {...register('overallNote')}
        />
      </Box>

      <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2.5}>
        <Button variant="outlined" onClick={onCancel} disabled={submitting} aria-label="İptal">
          İptal
        </Button>
        <Button type="submit" variant="contained" disabled={submitting} aria-label="Raporu kaydet">
          {submitting ? 'Kaydediliyor…' : 'Kaydet'}
        </Button>
      </Stack>
    </Box>
  )
}

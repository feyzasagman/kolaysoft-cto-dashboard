import { zodResolver } from '@hookform/resolvers/zod'
import CircularProgress from '@mui/material/CircularProgress'
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, type ReactNode } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link as RouterLink } from 'react-router-dom'
import { z } from 'zod'
import { ProgressComparison } from '@/components/common/ProgressComparison'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import type { AssignedProjectRow, WeeklyReport, WeeklyReportRequest } from '@/types/api'
import { currentIsoWeek } from '@/utils/labels'

const schema = z
  .object({
    projectId: z
      .coerce.number({ invalid_type_error: 'Proje seçimi zorunludur.' })
      .min(1, 'Proje seçimi zorunludur.'),
    weekNumber: z.coerce
      .number({ invalid_type_error: 'Hafta numarası zorunludur.' })
      .int('Hafta numarası tam sayı olmalıdır.')
      .min(1, 'Hafta en az 1 olmalıdır.')
      .max(53, 'Hafta en fazla 53 olabilir.'),
    reportDate: z.string().min(1, 'Rapor tarihi zorunludur.'),
    plannedProgress: z.string().optional(),
    actualProgress: z.string().optional(),
    projectStatus: z.string().max(50, 'Proje durumu en fazla 50 karakter olabilir.').optional(),
    scheduleStatus: z.string().max(50, 'Takvim durumu en fazla 50 karakter olabilir.').optional(),
    completedWork: z.string().optional(),
    plannedWork: z.string().optional(),
    overallNote: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    for (const key of ['plannedProgress', 'actualProgress'] as const) {
      const raw = values[key]
      if (raw === undefined || raw === '') continue
      const n = Number(raw)
      if (!Number.isFinite(n) || n < 0 || n > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message:
            key === 'plannedProgress'
              ? 'Hedeflenen ilerleme 0–100 arasında olmalıdır.'
              : 'Gerçekleşen ilerleme 0–100 arasında olmalıdır.',
        })
      }
    }
  })

type WeeklyReportFormValues = z.infer<typeof schema>

function toProgress(value?: string): number | null {
  if (value === undefined || value === '') return null
  return Number(value)
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <Box
      component="section"
      sx={{
        ...surfaceSx,
        p: { xs: DASH.space2, md: DASH.cardPadding },
        transition: 'border-color 160ms ease, box-shadow 160ms ease',
        '&:focus-within': {
          borderColor: '#AFB8C1',
          boxShadow: '0 0 0 3px rgba(9, 105, 218, 0.08)',
        },
      }}
    >
      <Typography variant="h5" component="h2" mb={0.35}>
        {title}
      </Typography>
      {description && (
        <Typography variant="caption" color="text.secondary" display="block" mb={DASH.space2}>
          {description}
        </Typography>
      )}
      {children}
    </Box>
  )
}

interface WeeklyReportFormProps {
  mode: 'create' | 'edit'
  projects: AssignedProjectRow[]
  initial?: WeeklyReport | null
  lockedProjectId?: number | null
  submitError?: string | null
  fieldErrors?: Record<string, string>
  duplicateHint?: { projectId: number; weekNumber: number } | null
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
  fieldErrors,
  duplicateHint,
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
    setError,
    formState: { errors, isDirty },
  } = useForm<WeeklyReportFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      projectId: initial?.projectId ?? lockedProjectId ?? projects[0]?.projectId ?? 0,
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

  const watchedProjectId = useWatch({ control, name: 'projectId' })
  const watchedWeek = useWatch({ control, name: 'weekNumber' })
  const watchedPlanned = useWatch({ control, name: 'plannedProgress' })
  const watchedActual = useWatch({ control, name: 'actualProgress' })

  const selectedProject = useMemo(
    () => projects.find((p) => p.projectId === Number(watchedProjectId)),
    [projects, watchedProjectId],
  )

  const livePlanned = toProgress(watchedPlanned)
  const liveActual = toProgress(watchedActual)

  useEffect(() => {
    if (lockedProjectId && lockedProjectId > 0) {
      setValue('projectId', lockedProjectId)
    }
  }, [lockedProjectId, setValue])

  useEffect(() => {
    if (!fieldErrors) return
    Object.entries(fieldErrors).forEach(([path, message]) => {
      setError(path as keyof WeeklyReportFormValues, { type: 'server', message })
    })
  }, [fieldErrors, setError])

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

  const actionBar = (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="flex-end">
      <Button variant="outlined" onClick={onCancel} disabled={submitting} aria-label="İptal">
        İptal
      </Button>
      <Button
        type="submit"
        form="weekly-report-form"
        variant="contained"
        disabled={submitting}
        startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
        aria-label="Raporu kaydet"
      >
        {submitting ? 'Kaydediliyor…' : 'Kaydet'}
      </Button>
    </Stack>
  )

  return (
    <Box>
      <Box
        component="header"
        sx={{
          ...surfaceSx,
          px: { xs: DASH.space2, md: DASH.space3 },
          py: DASH.space2,
          mb: DASH.space3,
        }}
      >
        <Breadcrumbs aria-label="Sayfa konumu" sx={{ mb: DASH.space2 }}>
          <Link component={RouterLink} to="/dashboard" underline="hover" color="text.secondary" variant="caption" fontWeight={600}>
            Kontrol Paneli
          </Link>
          <Link component={RouterLink} to="/reports" underline="hover" color="text.secondary" variant="caption" fontWeight={600}>
            Haftalık Raporlar
          </Link>
          <Typography variant="caption" color="text.primary" fontWeight={650}>
            {mode === 'create' ? 'Yeni' : 'Düzenle'}
          </Typography>
        </Breadcrumbs>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          spacing={DASH.space2}
          alignItems={{ md: 'flex-start' }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h1" sx={{ fontSize: { xs: '1.375rem', md: '1.625rem' } }}>
              {mode === 'create' ? 'Yeni Haftalık Rapor' : 'Haftalık Raporu Düzenle'}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {selectedProject
                ? `${selectedProject.code} — ${selectedProject.name}`
                : 'Proje seçin'}
              {watchedWeek ? ` · Hafta ${watchedWeek}` : ''}
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>{actionBar}</Box>
        </Stack>
      </Box>

      {submitError && (
        <Alert
          severity="error"
          role="alert"
          sx={{ mb: DASH.space3 }}
          action={
            duplicateHint ? (
              <Button
                color="inherit"
                size="small"
                component={RouterLink}
                to={`/reports?projectId=${duplicateHint.projectId}&weekNumber=${duplicateHint.weekNumber}`}
              >
                Mevcut raporları gör
              </Button>
            ) : undefined
          }
        >
          {submitError}
        </Alert>
      )}

      <Box
        id="weekly-report-form"
        component="form"
        onSubmit={submit}
        noValidate
        sx={{ display: 'grid', gap: DASH.space3, pb: { xs: 10, md: 2 } }}
      >
        <FormSection
          title="Proje ve Rapor Dönemi"
          description="Raporun ait olduğu proje ve hafta. Yıl, rapor tarihinden türetilir."
        >
          <Box
            sx={{
              display: 'grid',
              gap: DASH.space2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            <Controller
              name="projectId"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  error={Boolean(errors.projectId)}
                  disabled={mode === 'edit' || Boolean(lockedProjectId)}
                >
                  <InputLabel id="report-project-label">Proje</InputLabel>
                  <Select
                    {...field}
                    labelId="report-project-label"
                    label="Proje"
                    value={field.value || ''}
                    aria-describedby={errors.projectId ? 'projectId-error' : undefined}
                  >
                    {projects.map((project) => (
                      <MenuItem key={project.projectId} value={project.projectId}>
                        {project.code} — {project.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.projectId && (
                    <Typography id="projectId-error" variant="caption" color="error" mt={0.5}>
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
              helperText={errors.reportDate?.message || 'Yıl bu tarihten türetilir.'}
              {...register('reportDate')}
            />
          </Box>
        </FormSection>

        <FormSection
          title="İlerleme ve Durum"
          description="Hedef ile gerçekleşeni karşılaştırın; durum alanları serbest metin olarak saklanır."
        >
          <Box
            sx={{
              display: 'grid',
              gap: DASH.space2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              mb: DASH.space2,
            }}
          >
            <TextField
              label="Hedeflenen İlerleme (%)"
              type="number"
              inputProps={{ min: 0, max: 100 }}
              error={Boolean(errors.plannedProgress)}
              helperText={errors.plannedProgress?.message || 'Planlanan tamamlanma oranı'}
              {...register('plannedProgress')}
            />
            <TextField
              label="Gerçekleşen İlerleme (%)"
              type="number"
              inputProps={{ min: 0, max: 100 }}
              error={Boolean(errors.actualProgress)}
              helperText={errors.actualProgress?.message || 'Bu haftaya göre gerçekleşen oran'}
              {...register('actualProgress')}
            />
            <Controller
              name="projectStatus"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.projectStatus)}>
                  <InputLabel id="project-status-label">Proje durumu</InputLabel>
                  <Select {...field} labelId="project-status-label" label="Proje durumu" value={field.value || ''}>
                    <MenuItem value="PLANNED">Planlandı</MenuItem>
                    <MenuItem value="ACTIVE">Aktif</MenuItem>
                    <MenuItem value="ON_HOLD">Beklemede</MenuItem>
                    <MenuItem value="COMPLETED">Tamamlandı</MenuItem>
                    <MenuItem value="CANCELLED">İptal</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="scheduleStatus"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.scheduleStatus)}>
                  <InputLabel id="schedule-status-label">Takvim durumu</InputLabel>
                  <Select {...field} labelId="schedule-status-label" label="Takvim durumu" value={field.value || ''}>
                    <MenuItem value="ON_TRACK">Takvimde</MenuItem>
                    <MenuItem value="AT_RISK">Risk altında</MenuItem>
                    <MenuItem value="DELAYED">Gecikmiş</MenuItem>
                    <MenuItem value="AHEAD">İleride</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Box>

          <Box
            sx={{
              p: DASH.space2,
              borderRadius: DASH.radius,
              bgcolor: '#F6F8FA',
              border: DASH.border,
              borderColor: 'divider',
            }}
            aria-live="polite"
          >
            <Typography variant="caption" color="text.secondary" fontWeight={650} display="block" mb={1}>
              Canlı karşılaştırma
            </Typography>
            <ProgressComparison planned={livePlanned} actual={liveActual} compact />
          </Box>
        </FormSection>

        <FormSection title="Bu Hafta Yapılanlar" description="Yönetim için kısa ve net bir özet yazın.">
          <TextField
            label="Yapılanlar"
            multiline
            minRows={5}
            fullWidth
            placeholder="Bu hafta tamamlanan veya ilerletilen önemli işleri özetleyin…"
            helperText="Önemli teslimatlar, tamamlanan kilometre taşları ve engelleri aşma notları."
            error={Boolean(errors.completedWork)}
            {...register('completedWork')}
          />
        </FormSection>

        <FormSection title="Gelecek Hafta Planı" description="Bir sonraki haftanın hedeflerini netleştirin.">
          <TextField
            label="Yapılacaklar"
            multiline
            minRows={5}
            fullWidth
            placeholder="Bir sonraki hafta için hedeflenen işleri ve beklenen sonuçları yazın…"
            helperText="Öncelikler, beklenen çıktılar ve bağımlılıklar."
            error={Boolean(errors.plannedWork)}
            {...register('plannedWork')}
          />
        </FormSection>

        <FormSection title="Genel Durum Notu" description="CTO / yönetim için kısa değerlendirme.">
          <TextField
            label="Genel not"
            multiline
            minRows={4}
            fullWidth
            placeholder="Projenin genel durumu hakkında yönetim için kısa değerlendirme…"
            helperText="Risk özeti, karar ihtiyacı veya olumlu gelişmeler."
            error={Boolean(errors.overallNote)}
            {...register('overallNote')}
          />
        </FormSection>

        <Box sx={{ display: { xs: 'none', md: 'block' } }}>{actionBar}</Box>
      </Box>

      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 8,
          bgcolor: 'background.paper',
          borderTop: DASH.border,
          borderColor: 'divider',
          px: DASH.space2,
          py: 1.25,
          boxShadow: 3,
        }}
      >
        {actionBar}
      </Box>
    </Box>
  )
}

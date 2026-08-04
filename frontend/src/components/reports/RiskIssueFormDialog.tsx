import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import type { RiskIssue, RiskIssueRequest, RiskIssueUpdateRequest, RiskLevel, RiskStatus } from '@/types/api'

const schema = z.object({
  title: z.string().trim().min(1, 'Başlık zorunludur.').max(255, 'Başlık en fazla 255 karakter olabilir.'),
  description: z.string().optional().or(z.literal('')),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
    required_error: 'Risk seviyesi zorunludur.',
  }),
  impact: z.string().optional().or(z.literal('')),
  actionPlan: z.string().optional().or(z.literal('')),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ACCEPTED'], {
    required_error: 'Durum zorunludur.',
  }),
})

type FormValues = z.infer<typeof schema>

interface RiskIssueFormDialogProps {
  open: boolean
  reportId: number
  initial?: RiskIssue | null
  submitting?: boolean
  onClose: () => void
  onSubmit: (payload: RiskIssueRequest | RiskIssueUpdateRequest) => Promise<void>
}

export function RiskIssueFormDialog({
  open,
  reportId,
  initial,
  submitting = false,
  onClose,
  onSubmit,
}: RiskIssueFormDialogProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      riskLevel: 'MEDIUM',
      impact: '',
      actionPlan: '',
      status: 'OPEN',
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      riskLevel: (initial?.riskLevel as RiskLevel) || 'MEDIUM',
      impact: initial?.impact ?? '',
      actionPlan: initial?.actionPlan ?? '',
      status: (initial?.status as RiskStatus) || 'OPEN',
    })
  }, [open, initial, reset])

  const submit = handleSubmit(async (values) => {
    const body = {
      title: values.title.trim(),
      description: values.description || null,
      riskLevel: values.riskLevel,
      impact: values.impact || null,
      actionPlan: values.actionPlan || null,
      status: values.status,
    }
    if (initial) {
      await onSubmit(body)
    } else {
      await onSubmit({ ...body, reportId })
    }
  })

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initial ? 'Risk / Engeli Düzenle' : 'Risk / Engel Ekle'}</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} mt={0.5} component="form" id="risk-form" onSubmit={submit}>
          <TextField
            label="Başlık"
            error={Boolean(errors.title)}
            helperText={errors.title?.message}
            {...register('title')}
          />
          <TextField label="Açıklama" multiline minRows={2} {...register('description')} />
          <Controller
            name="riskLevel"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.riskLevel)}>
                <InputLabel>Risk seviyesi</InputLabel>
                <Select {...field} label="Risk seviyesi">
                  <MenuItem value="LOW">Düşük</MenuItem>
                  <MenuItem value="MEDIUM">Orta</MenuItem>
                  <MenuItem value="HIGH">Yüksek</MenuItem>
                  <MenuItem value="CRITICAL">Kritik</MenuItem>
                </Select>
              </FormControl>
            )}
          />
          <TextField label="Etki" multiline minRows={2} {...register('impact')} />
          <TextField label="Aksiyon planı" multiline minRows={2} {...register('actionPlan')} />
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.status)}>
                <InputLabel>Durum</InputLabel>
                <Select {...field} label="Durum">
                  <MenuItem value="OPEN">Açık</MenuItem>
                  <MenuItem value="IN_PROGRESS">Devam Ediyor</MenuItem>
                  <MenuItem value="RESOLVED">Çözüldü</MenuItem>
                  <MenuItem value="ACCEPTED">Kabul Edildi</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Vazgeç
        </Button>
        <Button type="submit" form="risk-form" variant="contained" disabled={submitting}>
          {submitting ? 'Kaydediliyor…' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

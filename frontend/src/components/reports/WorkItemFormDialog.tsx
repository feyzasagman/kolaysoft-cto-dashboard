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
import type { WorkItem, WorkItemRequest, WorkItemStatus, WorkItemUpdateRequest } from '@/types/api'

const schema = z.object({
  title: z.string().trim().min(1, 'Başlık zorunludur.').max(255, 'Başlık en fazla 255 karakter olabilir.'),
  description: z.string().optional().or(z.literal('')),
  assignee: z.string().max(150, 'Atanan kişi en fazla 150 karakter olabilir.').optional().or(z.literal('')),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'], {
    required_error: 'Durum zorunludur.',
  }),
  plannedDate: z.string().optional().or(z.literal('')),
  completedDate: z.string().optional().or(z.literal('')),
  note: z.string().optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

interface WorkItemFormDialogProps {
  open: boolean
  reportId: number
  initial?: WorkItem | null
  submitting?: boolean
  onClose: () => void
  onSubmit: (payload: WorkItemRequest | WorkItemUpdateRequest) => Promise<void>
}

export function WorkItemFormDialog({
  open,
  reportId,
  initial,
  submitting = false,
  onClose,
  onSubmit,
}: WorkItemFormDialogProps) {
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
      assignee: '',
      status: 'TODO',
      plannedDate: '',
      completedDate: '',
      note: '',
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      assignee: initial?.assignee ?? '',
      status: (initial?.status as WorkItemStatus) || 'TODO',
      plannedDate: initial?.plannedDate ?? '',
      completedDate: initial?.completedDate ?? '',
      note: initial?.note ?? '',
    })
  }, [open, initial, reset])

  const submit = handleSubmit(async (values) => {
    const body = {
      title: values.title.trim(),
      description: values.description || null,
      assignee: values.assignee || null,
      status: values.status,
      plannedDate: values.plannedDate || null,
      completedDate: values.completedDate || null,
      note: values.note || null,
    }
    if (initial) {
      await onSubmit(body)
    } else {
      await onSubmit({ ...body, reportId })
    }
  })

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm" fullScreen={false}>
      <DialogTitle>{initial ? 'İş Kalemini Düzenle' : 'İş Kalemi Ekle'}</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} mt={0.5} component="form" id="work-item-form" onSubmit={submit}>
          <TextField
            label="Başlık"
            error={Boolean(errors.title)}
            helperText={errors.title?.message}
            {...register('title')}
          />
          <TextField label="Açıklama" multiline minRows={2} {...register('description')} />
          <TextField
            label="Atanan"
            error={Boolean(errors.assignee)}
            helperText={errors.assignee?.message}
            {...register('assignee')}
          />
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.status)}>
                <InputLabel>Durum</InputLabel>
                <Select {...field} label="Durum">
                  <MenuItem value="TODO">Yapılacak</MenuItem>
                  <MenuItem value="IN_PROGRESS">Devam Ediyor</MenuItem>
                  <MenuItem value="DONE">Tamamlandı</MenuItem>
                  <MenuItem value="BLOCKED">Engelli</MenuItem>
                </Select>
              </FormControl>
            )}
          />
          <TextField
            label="Planlanan tarih"
            type="date"
            InputLabelProps={{ shrink: true }}
            {...register('plannedDate')}
          />
          <TextField
            label="Tamamlanma tarihi"
            type="date"
            InputLabelProps={{ shrink: true }}
            helperText="Backend DONE için completedDate zorunlu tutmaz."
            {...register('completedDate')}
          />
          <TextField label="Not" multiline minRows={2} {...register('note')} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Vazgeç
        </Button>
        <Button type="submit" form="work-item-form" variant="contained" disabled={submitting}>
          {submitting ? 'Kaydediliyor…' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

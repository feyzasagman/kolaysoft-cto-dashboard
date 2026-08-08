import AddIcon from '@mui/icons-material/Add'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import TimelapseIcon from '@mui/icons-material/Timelapse'
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState, ErrorState } from '@/components/common/EmptyState'
import { UserAvatar } from '@/components/common/UserAvatar'
import { WorkItemStatusBadge } from '@/components/common/StatusBadges'
import { WorkItemFormDialog } from '@/components/reports/WorkItemFormDialog'
import {
  useCreateWorkItem,
  useDeleteWorkItem,
  useUpdateWorkItem,
  useWorkItems,
} from '@/hooks/useApiQueries'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import type { WorkItem, WorkItemRequest, WorkItemStatus, WorkItemUpdateRequest } from '@/types/api'
import { formatShortDate } from '@/utils/labels'
import { getErrorMessage } from '@/utils/errorUtils'

interface WorkItemListProps {
  reportId: number
  canEdit: boolean
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'DONE') return <CheckCircleOutlineIcon fontSize="small" color="success" />
  if (status === 'IN_PROGRESS') return <TimelapseIcon fontSize="small" color="primary" />
  if (status === 'BLOCKED') return <BlockIcon fontSize="small" color="error" />
  return <RadioButtonUncheckedIcon fontSize="small" color="disabled" />
}

export function WorkItemList({ reportId, canEdit }: WorkItemListProps) {
  const query = useWorkItems(reportId)
  const createMutation = useCreateWorkItem()
  const updateMutation = useUpdateWorkItem(reportId)
  const deleteMutation = useDeleteWorkItem(reportId)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<WorkItem | null>(null)
  const [deleting, setDeleting] = useState<WorkItem | null>(null)

  const items = query.data?.content ?? []
  const saving = createMutation.isPending || updateMutation.isPending

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (item: WorkItem) => {
    setEditing(item)
    setDialogOpen(true)
  }

  const handleSave = async (payload: WorkItemRequest | WorkItemUpdateRequest) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload: payload as WorkItemUpdateRequest })
        toast.success('İş kalemi güncellendi.')
      } else {
        await createMutation.mutateAsync(payload as WorkItemRequest)
        toast.success('İş kalemi eklendi.')
      }
      setDialogOpen(false)
      setEditing(null)
    } catch (error) {
      toast.error(getErrorMessage(error, 'İş kalemi kaydedilemedi.'))
    }
  }

  const handleStatusChange = async (item: WorkItem, status: WorkItemStatus) => {
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        payload: {
          title: item.title,
          description: item.description,
          assignee: item.assignee,
          status,
          plannedDate: item.plannedDate,
          completedDate: item.completedDate,
          note: item.note,
        },
      })
      toast.success('Durum güncellendi.')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Durum güncellenemedi.'))
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      toast.success('İş kalemi silindi.')
      setDeleting(null)
    } catch (error) {
      toast.error(getErrorMessage(error, 'İş kalemi silinemedi.'))
    }
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={DASH.space2} gap={1}>
        <Box>
          <Typography variant="h5" component="h2">
            İş Kalemleri
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Bu haftaya bağlı görevler
          </Typography>
        </Box>
        {canEdit && (
          <Button
            startIcon={<AddIcon />}
            size="small"
            variant="contained"
            onClick={openCreate}
            aria-label="İş kalemi ekle"
          >
            Ekle
          </Button>
        )}
      </Stack>

      {query.isLoading && (
        <Stack spacing={1} aria-busy="true" aria-label="İş kalemleri yükleniyor">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={64} />
          ))}
        </Stack>
      )}
      {query.isError && <ErrorState onRetry={() => void query.refetch()} />}
      {!query.isLoading && !query.isError && items.length === 0 && (
        <EmptyState
          title="Aktif iş kalemi bulunmuyor."
          description="Bu haftalık rapora henüz iş kalemi eklenmemiş."
          actionLabel={canEdit ? 'İş kalemi ekle' : undefined}
          onAction={canEdit ? openCreate : undefined}
        />
      )}

      {items.length > 0 && (
        <Stack spacing={DASH.space1} role="list" aria-label="İş kalemleri">
          {items.map((item) => (
            <Box
              key={item.id}
              role="listitem"
              sx={{
                ...surfaceSx,
                px: DASH.space2,
                py: 1.25,
                display: 'grid',
                gridTemplateColumns: { xs: '24px 1fr', md: '24px 1fr auto' },
                gap: DASH.space2,
                alignItems: 'flex-start',
                transition: 'background-color 140ms ease',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Box sx={{ mt: 0.25 }} aria-hidden>
                <StatusIcon status={String(item.status)} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  useFlexGap
                  flexWrap="wrap"
                  alignItems={{ sm: 'center' }}
                  mb={0.5}
                >
                  <Typography variant="body2" fontWeight={700}>
                    {item.title}
                  </Typography>
                  {canEdit ? (
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <InputLabel>Durum</InputLabel>
                      <Select
                        label="Durum"
                        value={item.status}
                        onChange={(e) => void handleStatusChange(item, e.target.value as WorkItemStatus)}
                        aria-label={`${item.title} durumu`}
                      >
                        <MenuItem value="TODO">Yapılacak</MenuItem>
                        <MenuItem value="IN_PROGRESS">Devam Ediyor</MenuItem>
                        <MenuItem value="DONE">Tamamlandı</MenuItem>
                        <MenuItem value="BLOCKED">Engelli</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <WorkItemStatusBadge status={item.status} />
                  )}
                </Stack>
                <Stack direction="row" spacing={DASH.space2} useFlexGap flexWrap="wrap" alignItems="center">
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <UserAvatar name={item.assignee || '—'} size={22} />
                    <Typography variant="caption" color="text.secondary">
                      {item.assignee || 'Atanmamış'}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Plan: {formatShortDate(item.plannedDate)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Bitti: {formatShortDate(item.completedDate)}
                  </Typography>
                </Stack>
                {item.note?.trim() && (
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.5} noWrap>
                    {item.note}
                  </Typography>
                )}
              </Box>
              {canEdit && (
                <Stack direction="row" spacing={0.25} sx={{ justifySelf: { md: 'end' } }}>
                  <IconButton size="small" aria-label="Düzenle" onClick={() => openEdit(item)}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" aria-label="Sil" onClick={() => setDeleting(item)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              )}
            </Box>
          ))}
        </Stack>
      )}

      <WorkItemFormDialog
        open={dialogOpen}
        reportId={reportId}
        initial={editing}
        submitting={saving}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSave}
      />

      <ConfirmDialog
        open={deleting != null}
        title="İş kalemini sil"
        description="Bu iş kalemi kalıcı olarak silinecek. Devam etmek istiyor musunuz?"
        confirmLabel="Sil"
        danger
        loading={deleteMutation.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
      />
    </Box>
  )
}

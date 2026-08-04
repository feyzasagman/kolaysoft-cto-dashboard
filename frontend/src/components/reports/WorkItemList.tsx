import AddIcon from '@mui/icons-material/Add'
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState, ErrorState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { WorkItemStatusBadge } from '@/components/common/StatusBadges'
import { WorkItemFormDialog } from '@/components/reports/WorkItemFormDialog'
import {
  useCreateWorkItem,
  useDeleteWorkItem,
  useUpdateWorkItem,
  useWorkItems,
} from '@/hooks/useApiQueries'
import type { WorkItem, WorkItemRequest, WorkItemStatus, WorkItemUpdateRequest } from '@/types/api'
import { formatShortDate } from '@/utils/labels'
import { getErrorMessage } from '@/utils/errorUtils'

interface WorkItemListProps {
  reportId: number
  canEdit: boolean
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
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        p: 2,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5} gap={1}>
        <Typography variant="h5">İş Kalemleri</Typography>
        {canEdit && (
          <Button startIcon={<AddIcon />} size="small" variant="contained" onClick={openCreate} aria-label="İş kalemi ekle">
            Ekle
          </Button>
        )}
      </Stack>

      {query.isLoading && <LoadingState label="İş kalemleri yükleniyor…" />}
      {query.isError && <ErrorState onRetry={() => void query.refetch()} />}
      {!query.isLoading && !query.isError && items.length === 0 && (
        <EmptyState
          title="İş kalemi bulunmuyor"
          description="Bu haftalık rapora henüz iş kalemi eklenmemiş."
          actionLabel={canEdit ? 'İş kalemi ekle' : undefined}
          onAction={canEdit ? openCreate : undefined}
        />
      )}

      {items.length > 0 && (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" aria-label="İş kalemleri tablosu">
            <TableHead>
              <TableRow>
                <TableCell>Başlık</TableCell>
                <TableCell>Atanan</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Tamamlanma</TableCell>
                {canEdit && <TableCell align="right">İşlem</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={650}>
                      {item.title}
                    </Typography>
                    {item.description && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {item.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{item.assignee || '—'}</TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>{formatShortDate(item.plannedDate)}</TableCell>
                  <TableCell>{formatShortDate(item.completedDate)}</TableCell>
                  {canEdit && (
                    <TableCell align="right">
                      <IconButton size="small" aria-label="Düzenle" onClick={() => openEdit(item)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" aria-label="Sil" onClick={() => setDeleting(item)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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

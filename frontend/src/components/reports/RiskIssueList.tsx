import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
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
import { useState } from 'react'
import { toast } from 'react-toastify'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState, ErrorState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { RiskLevelBadge, RiskStatusBadge } from '@/components/common/StatusBadges'
import { RiskIssueFormDialog } from '@/components/reports/RiskIssueFormDialog'
import {
  useCreateRiskIssue,
  useDeleteRiskIssue,
  useRiskIssues,
  useUpdateRiskIssue,
} from '@/hooks/useApiQueries'
import type { RiskIssue, RiskIssueRequest, RiskIssueUpdateRequest, RiskStatus } from '@/types/api'
import { getErrorMessage } from '@/utils/errorUtils'

interface RiskIssueListProps {
  reportId: number
  canEdit: boolean
}

export function RiskIssueList({ reportId, canEdit }: RiskIssueListProps) {
  const query = useRiskIssues(reportId)
  const createMutation = useCreateRiskIssue()
  const updateMutation = useUpdateRiskIssue(reportId)
  const deleteMutation = useDeleteRiskIssue(reportId)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<RiskIssue | null>(null)
  const [deleting, setDeleting] = useState<RiskIssue | null>(null)

  const items = query.data?.content ?? []
  const saving = createMutation.isPending || updateMutation.isPending

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleSave = async (payload: RiskIssueRequest | RiskIssueUpdateRequest) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload: payload as RiskIssueUpdateRequest })
        toast.success('Risk güncellendi.')
      } else {
        await createMutation.mutateAsync(payload as RiskIssueRequest)
        toast.success('Risk eklendi.')
      }
      setDialogOpen(false)
      setEditing(null)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Risk kaydedilemedi.'))
    }
  }

  const handleStatusChange = async (item: RiskIssue, status: RiskStatus) => {
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        payload: {
          title: item.title,
          description: item.description,
          riskLevel: item.riskLevel as RiskIssueRequest['riskLevel'],
          impact: item.impact,
          actionPlan: item.actionPlan,
          status,
        },
      })
      toast.success('Risk durumu güncellendi.')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Durum güncellenemedi.'))
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      toast.success('Risk silindi.')
      setDeleting(null)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Risk silinemedi.'))
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
        <Typography variant="h5">Riskler ve Engeller</Typography>
        {canEdit && (
          <Button startIcon={<AddIcon />} size="small" variant="contained" onClick={openCreate} aria-label="Risk ekle">
            Ekle
          </Button>
        )}
      </Stack>

      {query.isLoading && <LoadingState label="Riskler yükleniyor…" />}
      {query.isError && <ErrorState onRetry={() => void query.refetch()} />}
      {!query.isLoading && !query.isError && items.length === 0 && (
        <EmptyState
          title="Risk / engel bulunmuyor"
          description="Bu haftalık rapora henüz risk veya engel eklenmemiş."
          actionLabel={canEdit ? 'Risk ekle' : undefined}
          onAction={canEdit ? openCreate : undefined}
        />
      )}

      {items.length > 0 && (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" aria-label="Riskler tablosu">
            <TableHead>
              <TableRow>
                <TableCell>Başlık</TableCell>
                <TableCell>Seviye</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Etki</TableCell>
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
                  <TableCell>
                    <RiskLevelBadge level={item.riskLevel} />
                  </TableCell>
                  <TableCell>
                    {canEdit ? (
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Durum</InputLabel>
                        <Select
                          label="Durum"
                          value={item.status}
                          onChange={(e) => void handleStatusChange(item, e.target.value as RiskStatus)}
                        >
                          <MenuItem value="OPEN">Açık</MenuItem>
                          <MenuItem value="IN_PROGRESS">Devam Ediyor</MenuItem>
                          <MenuItem value="RESOLVED">Çözüldü</MenuItem>
                          <MenuItem value="ACCEPTED">Kabul Edildi</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <RiskStatusBadge status={item.status} />
                    )}
                  </TableCell>
                  <TableCell>{item.impact || '—'}</TableCell>
                  {canEdit && (
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        aria-label="Düzenle"
                        onClick={() => {
                          setEditing(item)
                          setDialogOpen(true)
                        }}
                      >
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

      <RiskIssueFormDialog
        open={dialogOpen}
        reportId={reportId}
        initial={editing}
        submitting={saving}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSave}
      />

      <ConfirmDialog
        open={deleting != null}
        title="Riski sil"
        description="Bu risk kaydı kalıcı olarak silinecek. Devam etmek istiyor musunuz?"
        confirmLabel="Sil"
        danger
        loading={deleteMutation.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
      />
    </Box>
  )
}

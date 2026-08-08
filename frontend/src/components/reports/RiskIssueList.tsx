import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
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
import { RiskLevelBadge, RiskStatusBadge } from '@/components/common/StatusBadges'
import { RiskIssueFormDialog } from '@/components/reports/RiskIssueFormDialog'
import {
  useCreateRiskIssue,
  useDeleteRiskIssue,
  useRiskIssues,
  useUpdateRiskIssue,
} from '@/hooks/useApiQueries'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
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

  const sorted = [...items].sort((a, b) => {
    const rank = (level: string) =>
      level === 'CRITICAL' ? 0 : level === 'HIGH' ? 1 : level === 'MEDIUM' ? 2 : 3
    return rank(String(a.riskLevel)) - rank(String(b.riskLevel))
  })

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={DASH.space2} gap={1}>
        <Box>
          <Typography variant="h5" component="h2">
            Riskler / Engeller
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Bu haftaya bağlı risk kayıtları
          </Typography>
        </Box>
        {canEdit && (
          <Button
            startIcon={<AddIcon />}
            size="small"
            variant="contained"
            onClick={openCreate}
            aria-label="Risk ekle"
          >
            Ekle
          </Button>
        )}
      </Stack>

      {query.isLoading && (
        <Stack spacing={1} aria-busy="true" aria-label="Riskler yükleniyor">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={80} />
          ))}
        </Stack>
      )}
      {query.isError && <ErrorState onRetry={() => void query.refetch()} />}
      {!query.isLoading && !query.isError && items.length === 0 && (
        <EmptyState
          icon={<ReportProblemOutlinedIcon />}
          title="Açık risk veya engel bulunmuyor."
          description="Bu haftalık rapora henüz risk kaydı eklenmemiş."
          actionLabel={canEdit ? 'Risk ekle' : undefined}
          onAction={canEdit ? openCreate : undefined}
        />
      )}

      {sorted.length > 0 && (
        <Stack spacing={DASH.space1} role="list" aria-label="Riskler">
          {sorted.map((item) => {
            const priority =
              item.riskLevel === 'CRITICAL' || item.riskLevel === 'HIGH'
            return (
              <Box
                key={item.id}
                role="listitem"
                sx={{
                  ...surfaceSx,
                  p: DASH.space2,
                  borderLeft: priority ? '3px solid' : DASH.border,
                  borderLeftColor: priority
                    ? item.riskLevel === 'CRITICAL'
                      ? 'error.main'
                      : 'warning.main'
                    : 'divider',
                  transition: 'background-color 140ms ease',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  spacing={1}
                  mb={0.75}
                >
                  <Typography variant="subtitle2" fontWeight={700}>
                    {item.title}
                  </Typography>
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
                    <RiskLevelBadge level={item.riskLevel} />
                    {canEdit ? (
                      <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Durum</InputLabel>
                        <Select
                          label="Durum"
                          value={item.status}
                          onChange={(e) =>
                            void handleStatusChange(item, e.target.value as RiskStatus)
                          }
                          aria-label={`${item.title} durumu`}
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
                    {canEdit && (
                      <>
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
                      </>
                    )}
                  </Stack>
                </Stack>
                {item.description?.trim() && (
                  <Typography variant="body2" color="text.secondary" mb={0.75}>
                    {item.description}
                  </Typography>
                )}
                {item.impact?.trim() && (
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.35}>
                    Etki: {item.impact}
                  </Typography>
                )}
                {item.actionPlan?.trim() && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Aksiyon: {item.actionPlan}
                  </Typography>
                )}
              </Box>
            )
          })}
        </Stack>
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

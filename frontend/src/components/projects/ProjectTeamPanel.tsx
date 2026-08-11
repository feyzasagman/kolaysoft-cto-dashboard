import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { AppErrorState } from '@/components/common/AppErrorState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { RoleBadge } from '@/components/common/StatusBadges'
import { UserAvatar } from '@/components/common/UserAvatar'
import {
  useAssignProjectUser,
  useProjectAssignments,
  useRemoveProjectAssignment,
  useUsers,
} from '@/hooks/useApiQueries'
import { DASH } from '@/theme/dashboardTokens'
import { getErrorMessage } from '@/utils/errorUtils'
import { roleLabel } from '@/utils/labels'

interface ProjectTeamPanelProps {
  projectId: number
  managerId: number | null
  managerName: string | null
  managerEmail: string | null
  canManage: boolean
}

/**
 * Proje Ekibi / Yetkilendirme — manager kartı + ek assignment listesi.
 */
export function ProjectTeamPanel({
  projectId,
  managerId,
  managerName,
  managerEmail,
  canManage,
}: ProjectTeamPanelProps) {
  const assignmentsQuery = useProjectAssignments(projectId)
  const assignMutation = useAssignProjectUser(projectId)
  const removeMutation = useRemoveProjectAssignment(projectId)
  const usersQuery = useUsers({ page: 0, size: 100, active: true })

  const [assignOpen, setAssignOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('')
  const [pendingRemove, setPendingRemove] = useState<{ userId: number; name: string } | null>(null)

  const assignedIds = useMemo(() => {
    const ids = new Set((assignmentsQuery.data ?? []).map((a) => a.userId))
    if (managerId != null) ids.add(managerId)
    return ids
  }, [assignmentsQuery.data, managerId])

  const teamRows = useMemo(
    () => (assignmentsQuery.data ?? []).filter((row) => managerId == null || row.userId !== managerId),
    [assignmentsQuery.data, managerId],
  )

  const candidates = useMemo(
    () =>
      (usersQuery.data?.content ?? []).filter(
        (u) => u.active && !assignedIds.has(u.id) && (managerId == null || u.id !== managerId),
      ),
    [usersQuery.data?.content, assignedIds, managerId],
  )

  const handleAssign = async () => {
    if (selectedUserId === '' || assignMutation.isPending) return
    try {
      await assignMutation.mutateAsync({ userId: selectedUserId })
      toast.success('Kullanıcı projeye atandı.')
      setAssignOpen(false)
      setSelectedUserId('')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Atama yapılamadı.'))
    }
  }

  const handleRemoveConfirm = async () => {
    if (!pendingRemove || removeMutation.isPending) return
    try {
      await removeMutation.mutateAsync(pendingRemove.userId)
      toast.success('Atama kaldırıldı.')
      setPendingRemove(null)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Atama kaldırılamadı.'))
    }
  }

  if (assignmentsQuery.isLoading && !assignmentsQuery.data) {
    return <LoadingState label="Ekip bilgisi yükleniyor…" />
  }

  if (assignmentsQuery.isError) {
    return (
      <AppErrorState
        kind="network"
        title="Ekip bilgisi alınamadı."
        onRetry={() => void assignmentsQuery.refetch()}
      />
    )
  }

  return (
    <Stack spacing={DASH.space3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={1}
      >
        <Box>
          <Typography variant="h5" component="h3">
            Proje Ekibi / Yetkilendirme
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ana yönetici ayrı gösterilir; ek üyeler atama listesinde yer alır.
          </Typography>
        </Box>
        {canManage && (
          <Button
            variant="contained"
            startIcon={<PersonAddAlt1OutlinedIcon />}
            onClick={() => setAssignOpen(true)}
            aria-label="Kullanıcı ata"
          >
            Kullanıcı Ata
          </Button>
        )}
      </Stack>

      <Box sx={{ border: DASH.border, borderColor: 'divider', borderRadius: 1, p: DASH.cardPadding }}>
        <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
          Proje Yöneticisi
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <UserAvatar name={managerName ?? '—'} size={40} />
            <Box>
              <Typography fontWeight={600}>{managerName ?? 'Atanmamış'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {managerEmail ?? '—'}
              </Typography>
            </Box>
          </Stack>
          <RoleBadge role="PROJECT_MANAGER" />
        </Stack>
      </Box>

      <Box>
        <Typography variant="h6" component="h4" mb={1.5}>
          Proje Ekibi
        </Typography>
        {teamRows.length === 0 ? (
          <EmptyState
            title="Bu projeye henüz ekip üyesi atanmamış."
            description="Yönetici dışında ek kullanıcı atandığında burada listelenir."
            actionLabel={canManage ? 'Kullanıcı Ata' : undefined}
            onAction={canManage ? () => setAssignOpen(true) : undefined}
          />
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" aria-label="Proje ekibi">
              <TableHead>
                <TableRow>
                  <TableCell>Kullanıcı</TableCell>
                  <TableCell>Sistem rolü</TableCell>
                  <TableCell>Atama rolü</TableCell>
                  <TableCell>Aktif</TableCell>
                  {canManage && <TableCell align="right">İşlem</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {teamRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <UserAvatar name={row.userFullName} size={28} />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {row.userFullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.userEmail}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{roleLabel(row.userRole)}</TableCell>
                    <TableCell>{roleLabel(row.assignmentRole)}</TableCell>
                    <TableCell>{row.userActive ? 'Evet' : 'Hayır'}</TableCell>
                    {canManage && (
                      <TableCell align="right">
                        <Button
                          size="small"
                          color="error"
                          onClick={() => setPendingRemove({ userId: row.userId, name: row.userFullName })}
                          aria-label={`${row.userFullName} atamasını kaldır`}
                        >
                          Atamayı Kaldır
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Box>

      <Dialog
        open={assignOpen}
        onClose={assignMutation.isPending ? undefined : () => setAssignOpen(false)}
        fullWidth
        maxWidth="xs"
        aria-labelledby="assign-user-title"
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: '100%' },
          },
        }}
      >
        <DialogTitle id="assign-user-title">Kullanıcı Ata</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }} disabled={assignMutation.isPending || candidates.length === 0}>
            <InputLabel id="assign-user-label">Kullanıcı</InputLabel>
            <Select
              labelId="assign-user-label"
              label="Kullanıcı"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value as number)}
            >
              {candidates.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.fullName} · {roleLabel(u.role)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {candidates.length === 0 && (
            <Typography variant="body2" color="text.secondary" mt={2}>
              Atanabilecek aktif kullanıcı bulunamadı. Pasif, yönetici veya zaten atanmış kullanıcılar listelenmez.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)} disabled={assignMutation.isPending}>
            İptal
          </Button>
          <Button
            variant="contained"
            disabled={selectedUserId === '' || assignMutation.isPending}
            onClick={() => void handleAssign()}
            startIcon={assignMutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
            aria-busy={assignMutation.isPending}
          >
            Ata
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingRemove)}
        title="Atamayı kaldır"
        description={
          pendingRemove
            ? `${pendingRemove.name} kullanıcısının bu projeden ataması kaldırılacak. Devam etmek istiyor musunuz?`
            : ''
        }
        confirmLabel="Kaldır"
        danger
        loading={removeMutation.isPending}
        onConfirm={() => void handleRemoveConfirm()}
        onClose={() => {
          if (!removeMutation.isPending) setPendingRemove(null)
        }}
      />
    </Stack>
  )
}

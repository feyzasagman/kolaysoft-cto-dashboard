import AddIcon from '@mui/icons-material/Add'
import {
  Box,
  Button,
  Stack,
  TextField,
} from '@mui/material'
import { DataGrid, type GridColDef, type GridPaginationModel, type GridSortModel } from '@mui/x-data-grid'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { AppErrorState } from '@/components/common/AppErrorState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { UserFormDialog } from '@/components/users/UserFormDialog'
import { useAuth } from '@/contexts/AuthContext'
import {
  useCreateUser,
  useUpdateUser,
  useUpdateUserStatus,
  useUsers,
} from '@/hooks/useApiQueries'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import { getErrorMessage } from '@/utils/errorUtils'
import { formatShortDate, roleLabel } from '@/utils/labels'
import type { RoleType, UserRow } from '@/types/api'

export function UsersPage() {
  const { hasAnyRole } = useAuth()
  const canManage = hasAnyRole('ADMIN')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  })
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'id', sort: 'asc' }])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<UserRow | null>(null)
  const [statusTarget, setStatusTarget] = useState<UserRow | null>(null)

  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const statusMutation = useUpdateUserStatus()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPaginationModel((prev) => ({ ...prev, page: 0 }))
    }, 350)
    return () => window.clearTimeout(timer)
  }, [search])

  const sort = useMemo(() => {
    const first = sortModel[0]
    if (!first?.field) {
      return 'id,asc'
    }
    const allowed = new Set(['id', 'email', 'firstName', 'lastName', 'createdAt'])
    const fieldMap: Record<string, string> = {
      fullName: 'firstName',
      email: 'email',
      createdAt: 'createdAt',
      id: 'id',
    }
    const field = fieldMap[first.field] && allowed.has(fieldMap[first.field])
      ? fieldMap[first.field]
      : 'id'
    return `${field},${first.sort ?? 'asc'}`
  }, [sortModel])

  const { data, isLoading, isFetching, isError, refetch } = useUsers({
    page: paginationModel.page,
    size: paginationModel.pageSize,
    sort,
    search: debouncedSearch || undefined,
  })

  const rows = useMemo(
    () => (data?.content ?? []).map((row) => ({ ...row, id: row.id })),
    [data],
  )

  const columns: GridColDef[] = useMemo(() => {
    const base: GridColDef[] = [
      { field: 'fullName', headerName: 'Ad Soyad', flex: 1, minWidth: 180 },
      { field: 'email', headerName: 'E-posta', flex: 1, minWidth: 220 },
      {
        field: 'role',
        headerName: 'Rol',
        width: 160,
        valueGetter: (_value, row) => roleLabel(row.role),
      },
      { field: 'active', headerName: 'Aktif', width: 100, type: 'boolean' },
      {
        field: 'createdAt',
        headerName: 'Oluşturulma',
        width: 160,
        valueGetter: (_value, row) => formatShortDate(row.createdAt),
      },
    ]
    if (!canManage) return base
    return [
      ...base,
      {
        field: 'actions',
        headerName: 'İşlemler',
        width: 220,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const row = params.row as UserRow
          return (
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                onClick={() => {
                  setEditing(row)
                  setDialogOpen(true)
                }}
              >
                Düzenle
              </Button>
              <Button
                size="small"
                color={row.active ? 'warning' : 'success'}
                disabled={statusMutation.isPending}
                onClick={() => setStatusTarget(row)}
              >
                {row.active ? 'Pasifleştir' : 'Aktifleştir'}
              </Button>
            </Stack>
          )
        },
      },
    ]
  }, [canManage, statusMutation.isPending])

  const submitting = createMutation.isPending || updateMutation.isPending

  const handleSubmit = async (values: {
    fullName: string
    email: string
    role: RoleType
    password?: string
  }) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          payload: {
            fullName: values.fullName,
            email: values.email,
            role: values.role,
            password: values.password,
          },
        })
        toast.success('Kullanıcı başarıyla güncellendi.')
      } else {
        if (!values.password) {
          toast.error('Başlangıç şifresi zorunludur.')
          return
        }
        await createMutation.mutateAsync({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          role: values.role,
        })
        toast.success('Kullanıcı başarıyla oluşturuldu.')
      }
      setDialogOpen(false)
      setEditing(null)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Kullanıcı kaydedilemedi.'))
    }
  }

  const handleStatusConfirm = async () => {
    if (!statusTarget) return
    const nextActive = !statusTarget.active
    try {
      await statusMutation.mutateAsync({ id: statusTarget.id, active: nextActive })
      toast.success(nextActive ? 'Kullanıcı aktifleştirildi.' : 'Kullanıcı pasifleştirildi.')
      setStatusTarget(null)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <Box>
      <PageHeader
        title="Kullanıcılar"
        subtitle={
          canManage
            ? 'Kullanıcı oluşturun, düzenleyin ve aktiflik durumunu yönetin.'
            : 'Sistem kullanıcılarını arayın ve listeleyin.'
        }
        actions={
          canManage ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditing(null)
                setDialogOpen(true)
              }}
            >
              Yeni Kullanıcı
            </Button>
          ) : undefined
        }
      />

      <TextField
        size="small"
        label="Ara"
        placeholder="E-posta / ad / soyad"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        sx={{ mb: DASH.space2, minWidth: 260 }}
        inputProps={{ 'aria-label': 'Kullanıcı ara' }}
      />

      {isError && (
        <Box mb={DASH.space2}>
          <AppErrorState
            kind="network"
            title="Kullanıcılar alınamadı."
            onRetry={() => void refetch()}
          />
        </Box>
      )}

      {isLoading && !data ? (
        <LoadingState label="Kullanıcılar yükleniyor…" />
      ) : !isError && (data?.totalElements ?? 0) === 0 ? (
        <EmptyState
          title={debouncedSearch ? 'Aramanızla eşleşen sonuç bulunamadı.' : 'Henüz kullanıcı bulunmuyor.'}
          description={
            debouncedSearch
              ? 'Arama kriterlerini değiştirerek yeniden deneyin.'
              : canManage
                ? 'Yeni Kullanıcı ile ilk kaydı oluşturabilirsiniz.'
                : 'Kullanıcı kayıtları burada listelenir.'
          }
          actionLabel={canManage && !debouncedSearch ? 'Yeni Kullanıcı' : undefined}
          onAction={
            canManage && !debouncedSearch
              ? () => {
                  setEditing(null)
                  setDialogOpen(true)
                }
              : undefined
          }
        />
      ) : (
        <Box sx={{ ...surfaceSx, height: 560, overflow: 'hidden' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            rowCount={data?.totalElements ?? 0}
            loading={isFetching}
            paginationMode="server"
            sortingMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sortModel={sortModel}
            onSortModelChange={(model) => {
              setSortModel(model)
              setPaginationModel((prev) => ({ ...prev, page: 0 }))
            }}
            pageSizeOptions={[10, 20, 50]}
            disableRowSelectionOnClick
            aria-label="Kullanıcı listesi"
          />
        </Box>
      )}

      {canManage && (
        <UserFormDialog
          open={dialogOpen}
          initial={editing}
          submitting={submitting}
          onClose={() => {
            if (submitting) return
            setDialogOpen(false)
            setEditing(null)
          }}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        open={Boolean(statusTarget)}
        title={statusTarget?.active ? 'Kullanıcıyı pasifleştir' : 'Kullanıcıyı aktifleştir'}
        description={
          statusTarget?.active
            ? `${statusTarget.fullName} kullanıcısı pasifleştirilecek. Pasif kullanıcılar proje yöneticisi olarak atanamaz.`
            : `${statusTarget?.fullName ?? 'Kullanıcı'} yeniden aktifleştirilecek.`
        }
        confirmLabel={statusTarget?.active ? 'Pasifleştir' : 'Aktifleştir'}
        danger={Boolean(statusTarget?.active)}
        loading={statusMutation.isPending}
        onConfirm={() => void handleStatusConfirm()}
        onClose={() => {
          if (!statusMutation.isPending) setStatusTarget(null)
        }}
      />
    </Box>
  )
}

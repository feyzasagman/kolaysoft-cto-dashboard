import {
  Box,
  TextField,
} from '@mui/material'
import { DataGrid, type GridColDef, type GridPaginationModel, type GridSortModel } from '@mui/x-data-grid'
import { useEffect, useMemo, useState } from 'react'
import { AppErrorState } from '@/components/common/AppErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { useUsers } from '@/hooks/useApiQueries'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import { formatShortDate } from '@/utils/labels'

const columns: GridColDef[] = [
  { field: 'fullName', headerName: 'Ad Soyad', flex: 1, minWidth: 180 },
  { field: 'email', headerName: 'E-posta', flex: 1, minWidth: 220 },
  { field: 'role', headerName: 'Rol', width: 160 },
  { field: 'active', headerName: 'Aktif', width: 100, type: 'boolean' },
  {
    field: 'createdAt',
    headerName: 'Oluşturulma',
    width: 160,
    valueGetter: (_value, row) => formatShortDate(row.createdAt),
  },
]

export function UsersPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  })
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'id', sort: 'asc' }])

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

  return (
    <Box>
      <PageHeader
        title="Kullanıcılar"
        subtitle="Sistem kullanıcılarını arayın ve listeleyin."
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
          title={debouncedSearch ? 'Filtrelere uygun kullanıcı bulunamadı.' : 'Henüz kullanıcı bulunmuyor.'}
          description={
            debouncedSearch
              ? 'Arama kriterlerini değiştirerek yeniden deneyin.'
              : 'Kullanıcı kayıtları burada listelenir.'
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
    </Box>
  )
}

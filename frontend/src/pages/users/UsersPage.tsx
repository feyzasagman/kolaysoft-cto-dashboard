import {
  Alert,
  Box,
  TextField,
} from '@mui/material'
import { DataGrid, type GridColDef, type GridPaginationModel, type GridSortModel } from '@mui/x-data-grid'
import { useEffect, useMemo, useState } from 'react'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { useUsers } from '@/hooks/useApiQueries'
import { getErrorMessage } from '@/utils/errorUtils'

const columns: GridColDef[] = [
  { field: 'fullName', headerName: 'Full Name', flex: 1, minWidth: 180 },
  { field: 'email', headerName: 'Email', flex: 1, minWidth: 220 },
  { field: 'role', headerName: 'Role', width: 160 },
  { field: 'active', headerName: 'Active', width: 100, type: 'boolean' },
  { field: 'createdAt', headerName: 'Created At', width: 200 },
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

  const { data, isLoading, isFetching, isError, error } = useUsers({
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
        title="Users"
        subtitle="Kullanıcı listesi — arama ve sayfalama. CRUD sonraki günde."
      />

      <TextField
        size="small"
        label="Search"
        placeholder="E-posta / ad / soyad"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        sx={{ mb: 2, minWidth: 260 }}
      />

      {isError && <Alert severity="error" sx={{ mb: 2 }}>{getErrorMessage(error)}</Alert>}

      {isLoading && !data ? (
        <LoadingState label="Kullanıcılar yükleniyor..." />
      ) : (
        <Box sx={{ height: 560, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
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
          />
        </Box>
      )}
    </Box>
  )
}

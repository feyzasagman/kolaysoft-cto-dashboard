import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DataGrid, type GridColDef, type GridPaginationModel, type GridSortModel } from '@mui/x-data-grid'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EmptyState, ErrorState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { useAuth } from '@/contexts/AuthContext'
import { useWeeklyReports } from '@/hooks/useApiQueries'
import { getErrorMessage } from '@/utils/errorUtils'

const columns: GridColDef[] = [
  { field: 'projectCode', headerName: 'Proje', width: 120 },
  { field: 'projectName', headerName: 'Ad', flex: 1, minWidth: 180 },
  { field: 'year', headerName: 'Yıl', width: 90 },
  { field: 'weekNumber', headerName: 'Hafta', width: 90 },
  { field: 'reportDate', headerName: 'Tarih', width: 120 },
  { field: 'plannedProgress', headerName: 'Hedef %', width: 100 },
  { field: 'actualProgress', headerName: 'Gerçek %', width: 100 },
  { field: 'scheduleStatus', headerName: 'Takvim', width: 130 },
]

export function ReportsPage() {
  const navigate = useNavigate()
  const { hasAnyRole } = useAuth()
  const canCreate = hasAnyRole('ADMIN', 'PROJECT_MANAGER')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  })
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'year', sort: 'desc' }])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPaginationModel((prev) => ({ ...prev, page: 0 }))
    }, 350)
    return () => window.clearTimeout(timer)
  }, [search])

  const sort = useMemo(() => {
    const first = sortModel[0]
    if (!first?.field) return 'year,desc'
    const allowed = new Set(['id', 'year', 'weekNumber', 'reportDate'])
    const field = allowed.has(first.field) ? first.field : 'year'
    return `${field},${first.sort ?? 'asc'}`
  }, [sortModel])

  const { data, isLoading, isFetching, isError, error, refetch } = useWeeklyReports({
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
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={1.5}
        mb={2}
      >
        <Box>
          <Typography variant="h1" sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
            Haftalık Raporlar
          </Typography>
          <Typography color="text.secondary">
            Raporları listeleyin, detaya gidin{canCreate ? ' veya yeni rapor oluşturun' : ''}.
          </Typography>
        </Box>
        {canCreate && (
          <Button variant="contained" onClick={() => navigate('/reports/new')} aria-label="Yeni haftalık rapor">
            Yeni Rapor
          </Button>
        )}
      </Stack>

      <TextField
        size="small"
        label="Ara"
        placeholder="Proje kodu / adı"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        sx={{ mb: 2, minWidth: 240 }}
      />

      {isError && (
        <Box mb={2}>
          <ErrorState
            title={getErrorMessage(error, 'Raporlar alınamadı.')}
            onRetry={() => void refetch()}
          />
        </Box>
      )}

      {isLoading && !data ? (
        <LoadingState label="Raporlar yükleniyor..." />
      ) : !isError && (data?.totalElements ?? 0) === 0 ? (
        <EmptyState
          title={debouncedSearch ? 'Filtrelere uygun rapor yok' : 'Henüz rapor bulunmuyor'}
          description={
            debouncedSearch
              ? 'Arama kriterlerini değiştirerek yeniden deneyin.'
              : 'İlk haftalık raporunuzu oluşturarak başlayabilirsiniz.'
          }
          actionLabel={canCreate && !debouncedSearch ? 'Rapor oluştur' : undefined}
          onAction={canCreate && !debouncedSearch ? () => navigate('/reports/new') : undefined}
        />
      ) : (
        <Box
          sx={{
            height: { xs: 480, md: 560 },
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            width: '100%',
            overflow: 'hidden',
          }}
        >
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
            onRowClick={(params) => navigate(`/reports/${params.id}`)}
          />
        </Box>
      )}
    </Box>
  )
}

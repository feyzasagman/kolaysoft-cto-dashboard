import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DataGrid, type GridColDef, type GridPaginationModel, type GridSortModel } from '@mui/x-data-grid'
import { useEffect, useMemo, useState } from 'react'
import { LoadingState } from '@/components/common/LoadingState'
import { useWeeklyReport, useWeeklyReports } from '@/hooks/useApiQueries'
import { getErrorMessage } from '@/utils/errorUtils'

const columns: GridColDef[] = [
  { field: 'projectCode', headerName: 'Project', width: 120 },
  { field: 'projectName', headerName: 'Name', flex: 1, minWidth: 180 },
  { field: 'year', headerName: 'Year', width: 90 },
  { field: 'weekNumber', headerName: 'Week', width: 90 },
  { field: 'reportDate', headerName: 'Date', width: 120 },
  { field: 'plannedProgress', headerName: 'Planned %', width: 110 },
  { field: 'actualProgress', headerName: 'Actual %', width: 110 },
  { field: 'scheduleStatus', headerName: 'Schedule', width: 130 },
]

export function ReportsPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
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
    if (!first?.field) {
      return 'year,desc'
    }
    const allowed = new Set(['id', 'year', 'weekNumber', 'reportDate'])
    const field = allowed.has(first.field) ? first.field : 'year'
    return `${field},${first.sort ?? 'asc'}`
  }, [sortModel])

  const { data, isLoading, isFetching, isError, error } = useWeeklyReports({
    page: paginationModel.page,
    size: paginationModel.pageSize,
    sort,
    search: debouncedSearch || undefined,
  })

  const detailQuery = useWeeklyReport(selectedId)

  const rows = useMemo(
    () => (data?.content ?? []).map((row) => ({ ...row, id: row.id })),
    [data],
  )

  return (
    <Box>
      <Typography variant="h5" mb={0.5}>
        Weekly Reports
      </Typography>
      <Typography color="text.secondary" mb={2.5}>
        Raporları listeleyin ve detayları görüntüleyin. Düzenleme henüz yok.
      </Typography>

      <TextField
        size="small"
        label="Search"
        placeholder="Proje kodu / adı"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        sx={{ mb: 2, minWidth: 240 }}
      />

      {isError && <Alert severity="error" sx={{ mb: 2 }}>{getErrorMessage(error)}</Alert>}

      {isLoading && !data ? (
        <LoadingState label="Raporlar yükleniyor..." />
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
            onRowClick={(params) => setSelectedId(Number(params.id))}
          />
        </Box>
      )}

      <Dialog open={selectedId != null} onClose={() => setSelectedId(null)} fullWidth maxWidth="md">
        <DialogTitle>Report Details</DialogTitle>
        <DialogContent dividers>
          {detailQuery.isLoading && <LoadingState label="Detay yükleniyor..." />}
          {detailQuery.isError && <Alert severity="error">{getErrorMessage(detailQuery.error)}</Alert>}
          {detailQuery.data && (
            <Stack spacing={1.5}>
              <Typography variant="h6">
                {detailQuery.data.projectCode} — {detailQuery.data.projectName}
              </Typography>
              <Typography color="text.secondary">
                Year {detailQuery.data.year} / Week {detailQuery.data.weekNumber} · {detailQuery.data.reportDate}
              </Typography>
              <Divider />
              <Typography><strong>Planned:</strong> {detailQuery.data.plannedProgress ?? '—'}%</Typography>
              <Typography><strong>Actual:</strong> {detailQuery.data.actualProgress ?? '—'}%</Typography>
              <Typography><strong>Schedule:</strong> {detailQuery.data.scheduleStatus ?? '—'}</Typography>
              <Typography><strong>Completed Work:</strong> {detailQuery.data.completedWork || '—'}</Typography>
              <Typography><strong>Planned Work:</strong> {detailQuery.data.plannedWork || '—'}</Typography>
              <Typography><strong>Overall Note:</strong> {detailQuery.data.overallNote || '—'}</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedId(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

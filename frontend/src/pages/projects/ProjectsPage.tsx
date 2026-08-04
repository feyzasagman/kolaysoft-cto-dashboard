import {
  Alert,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DataGrid, type GridColDef, type GridPaginationModel, type GridSortModel } from '@mui/x-data-grid'
import { useEffect, useMemo, useState } from 'react'
import { LoadingState } from '@/components/common/LoadingState'
import { useDashboardProjects } from '@/hooks/useApiQueries'
import type { ProjectStatus, ReportHealth } from '@/types/api'
import { getErrorMessage } from '@/utils/errorUtils'

const columns: GridColDef[] = [
  { field: 'code', headerName: 'Code', width: 120 },
  { field: 'name', headerName: 'Name', flex: 1, minWidth: 180 },
  { field: 'managerName', headerName: 'Manager', width: 160 },
  { field: 'projectStatus', headerName: 'Status', width: 130 },
  { field: 'latestHealth', headerName: 'Health', width: 110 },
  { field: 'progressActual', headerName: 'Progress %', width: 120 },
  { field: 'openRiskCount', headerName: 'Open Risks', width: 120 },
  { field: 'criticalRiskCount', headerName: 'Critical', width: 110 },
  { field: 'hasCurrentWeekReport', headerName: 'Current Week', width: 130, type: 'boolean' },
]

export function ProjectsPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | ''>('')
  const [health, setHealth] = useState<ReportHealth | ''>('')
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  })
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'name', sort: 'asc' }])

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
      return 'name,asc'
    }
    const fieldMap: Record<string, string> = {
      code: 'code',
      name: 'name',
      projectStatus: 'status',
      projectId: 'id',
    }
    const field = fieldMap[first.field] ?? 'name'
    return `${field},${first.sort ?? 'asc'}`
  }, [sortModel])

  const { data, isLoading, isFetching, isError, error } = useDashboardProjects({
    page: paginationModel.page,
    size: paginationModel.pageSize,
    sort,
    search: debouncedSearch || undefined,
    projectStatus,
    health,
  })

  const rows = useMemo(
    () => (data?.content ?? []).map((row) => ({ id: row.projectId, ...row })),
    [data],
  )

  return (
    <Box>
      <Typography variant="h5" mb={0.5}>
        Projects
      </Typography>
      <Typography color="text.secondary" mb={2.5}>
        Dashboard proje listesi — arama, filtre, sıralama ve sayfalama.
      </Typography>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        mb={2}
        useFlexGap
        flexWrap="wrap"
      >
        <TextField
          size="small"
          label="Search"
          placeholder="Kod veya ad"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ minWidth: 220 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={projectStatus}
            onChange={(event) => {
              setProjectStatus(event.target.value as ProjectStatus | '')
              setPaginationModel((prev) => ({ ...prev, page: 0 }))
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="PLANNED">PLANNED</MenuItem>
            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
            <MenuItem value="ON_HOLD">ON_HOLD</MenuItem>
            <MenuItem value="COMPLETED">COMPLETED</MenuItem>
            <MenuItem value="CANCELLED">CANCELLED</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Health</InputLabel>
          <Select
            label="Health"
            value={health}
            onChange={(event) => {
              setHealth(event.target.value as ReportHealth | '')
              setPaginationModel((prev) => ({ ...prev, page: 0 }))
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="GREEN">GREEN</MenuItem>
            <MenuItem value="YELLOW">YELLOW</MenuItem>
            <MenuItem value="RED">RED</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {isError && <Alert severity="error" sx={{ mb: 2 }}>{getErrorMessage(error)}</Alert>}

      {isLoading && !data ? (
        <LoadingState label="Projeler yükleniyor..." />
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

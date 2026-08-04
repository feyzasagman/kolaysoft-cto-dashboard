import {
  Alert,
  Box,
  Button,
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
import { useNavigate } from 'react-router-dom'
import { LoadingState } from '@/components/common/LoadingState'
import { useAuth } from '@/contexts/AuthContext'
import { useDashboardProjects } from '@/hooks/useApiQueries'
import type { ProjectStatus, ReportHealth } from '@/types/api'
import { getErrorMessage } from '@/utils/errorUtils'

const columns: GridColDef[] = [
  { field: 'code', headerName: 'Kod', width: 120 },
  { field: 'name', headerName: 'Ad', flex: 1, minWidth: 180 },
  { field: 'managerName', headerName: 'Yönetici', width: 160 },
  { field: 'projectStatus', headerName: 'Durum', width: 130 },
  { field: 'latestHealth', headerName: 'Sağlık', width: 110 },
  { field: 'progressActual', headerName: 'İlerleme %', width: 120 },
  { field: 'hasCurrentWeekReport', headerName: 'Bu hafta', width: 110, type: 'boolean' },
]

export function AdminProjectsView() {
  const navigate = useNavigate()
  const { hasAnyRole } = useAuth()
  const canCreateReport = hasAnyRole('ADMIN')

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
    if (!first?.field) return 'name,asc'
    const fieldMap: Record<string, string> = {
      code: 'code',
      name: 'name',
      projectStatus: 'status',
      projectId: 'id',
    }
    return `${fieldMap[first.field] ?? 'name'},${first.sort ?? 'asc'}`
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
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={1}
        mb={2}
      >
        <Box>
          <Typography variant="h1" sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
            Projeler
          </Typography>
          <Typography color="text.secondary">
            Dashboard proje listesi — arama, filtre, sıralama ve sayfalama.
          </Typography>
        </Box>
        {canCreateReport && (
          <Button variant="contained" onClick={() => navigate('/reports/new')} aria-label="Haftalık rapor oluştur">
            Haftalık Rapor Oluştur
          </Button>
        )}
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} mb={2} useFlexGap flexWrap="wrap">
        <TextField
          size="small"
          label="Ara"
          placeholder="Kod veya ad"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ minWidth: 220 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Durum</InputLabel>
          <Select
            label="Durum"
            value={projectStatus}
            onChange={(event) => {
              setProjectStatus(event.target.value as ProjectStatus | '')
              setPaginationModel((prev) => ({ ...prev, page: 0 }))
            }}
          >
            <MenuItem value="">Tümü</MenuItem>
            <MenuItem value="PLANNED">Planlandı</MenuItem>
            <MenuItem value="ACTIVE">Aktif</MenuItem>
            <MenuItem value="ON_HOLD">Beklemede</MenuItem>
            <MenuItem value="COMPLETED">Tamamlandı</MenuItem>
            <MenuItem value="CANCELLED">İptal</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Sağlık</InputLabel>
          <Select
            label="Sağlık"
            value={health}
            onChange={(event) => {
              setHealth(event.target.value as ReportHealth | '')
              setPaginationModel((prev) => ({ ...prev, page: 0 }))
            }}
          >
            <MenuItem value="">Tümü</MenuItem>
            <MenuItem value="GREEN">Sağlıklı</MenuItem>
            <MenuItem value="YELLOW">Dikkat</MenuItem>
            <MenuItem value="RED">Kritik</MenuItem>
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
            onRowClick={(params) => navigate(`/projects/${params.id}`)}
          />
        </Box>
      )}
    </Box>
  )
}

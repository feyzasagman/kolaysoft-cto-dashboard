import AddIcon from '@mui/icons-material/Add'
import {
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
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppErrorState } from '@/components/common/AppErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { WeeklyReportList } from '@/components/reports/WeeklyReportList'
import { WeeklyReportListSkeleton } from '@/components/reports/WeeklyReportListSkeleton'
import { useAuth } from '@/contexts/AuthContext'
import {
  useAssignedProjects,
  useDashboardProjects,
  useWeeklyReports,
} from '@/hooks/useApiQueries'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'

type SortOption = 'year,desc' | 'year,asc' | 'reportDate,desc' | 'reportDate,asc' | 'weekNumber,desc'

export function ReportsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { hasAnyRole } = useAuth()
  const canCreate = hasAnyRole('ADMIN', 'PROJECT_MANAGER')
  const isAdminOrCto = hasAnyRole('ADMIN', 'CTO')

  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [debouncedSearch, setDebouncedSearch] = useState(search.trim())
  const [page, setPage] = useState(Number(searchParams.get('page') || 0) || 0)
  const [size, setSize] = useState(Number(searchParams.get('size') || 10) || 10)
  const [sort, setSort] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'reportDate,desc',
  )
  const [projectId, setProjectId] = useState<number | ''>(
    Number(searchParams.get('projectId') || 0) || '',
  )
  const [weekNumber, setWeekNumber] = useState<number | ''>(
    Number(searchParams.get('weekNumber') || 0) || '',
  )
  const [year, setYear] = useState<number | ''>(
    Number(searchParams.get('year') || 0) || '',
  )
  const [scheduleFilter, setScheduleFilter] = useState(searchParams.get('schedule') ?? '')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(0)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [search])

  const assignedQuery = useAssignedProjects(hasAnyRole('PROJECT_MANAGER') && !isAdminOrCto)
  const adminProjectsQuery = useDashboardProjects(
    { page: 0, size: 100, sort: 'name,asc' },
    isAdminOrCto,
  )

  const projectOptions = useMemo(() => {
    if (isAdminOrCto) {
      return (adminProjectsQuery.data?.content ?? []).map((p) => ({
        id: p.projectId,
        label: `${p.code} — ${p.name}`,
      }))
    }
    return (assignedQuery.data ?? []).map((p) => ({
      id: p.projectId,
      label: `${p.code} — ${p.name}`,
    }))
  }, [isAdminOrCto, adminProjectsQuery.data, assignedQuery.data])

  const query = useWeeklyReports({
    page,
    size,
    sort,
    search: debouncedSearch || undefined,
    projectId: projectId === '' ? undefined : projectId,
    weekNumber: weekNumber === '' ? undefined : weekNumber,
    year: year === '' ? undefined : year,
  })

  const rows = useMemo(() => {
    const list = query.data?.content ?? []
    if (!scheduleFilter) return list
    return list.filter(
      (r) => (r.scheduleStatus ?? '').toUpperCase() === scheduleFilter.toUpperCase(),
    )
  }, [query.data?.content, scheduleFilter])

  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (projectId !== '') params.set('projectId', String(projectId))
    if (weekNumber !== '') params.set('weekNumber', String(weekNumber))
    if (year !== '') params.set('year', String(year))
    if (scheduleFilter) params.set('schedule', scheduleFilter)
    if (sort !== 'reportDate,desc') params.set('sort', sort)
    if (page > 0) params.set('page', String(page))
    if (size !== 10) params.set('size', String(size))
    setSearchParams(params, { replace: true })
  }, [
    debouncedSearch,
    projectId,
    weekNumber,
    year,
    scheduleFilter,
    sort,
    page,
    size,
    setSearchParams,
  ])

  const hasFilters = Boolean(
    debouncedSearch || projectId !== '' || weekNumber !== '' || year !== '' || scheduleFilter,
  )

  if (query.isLoading && !query.data) {
    return <WeeklyReportListSkeleton />
  }

  if (query.isError) {
    return (
      <AppErrorState
        kind="network"
        title="Haftalık raporlar alınamadı."
        description="Bağlantıyı kontrol edip tekrar deneyin."
        onRetry={() => void query.refetch()}
      />
    )
  }

  return (
    <Box className="fade-in">
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ md: 'flex-start' }}
        spacing={DASH.space2}
        mb={DASH.space3}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h1" sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
            Haftalık Raporlar
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.75} maxWidth={560}>
            Projelerin haftalık ilerleme, plan, risk ve iş kalemi kayıtlarını takip edin.
          </Typography>
        </Box>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/reports/new')}
            aria-label="Yeni haftalık rapor"
            sx={{ flexShrink: 0 }}
          >
            Yeni Haftalık Rapor
          </Button>
        )}
      </Stack>

      <Box
        component="section"
        aria-label="Rapor filtreleri"
        sx={{
          ...surfaceSx,
          p: DASH.space2,
          mb: DASH.space3,
          display: 'grid',
          gap: DASH.space2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '2fr 1.4fr 0.9fr 0.9fr 1.1fr 1.2fr',
          },
          alignItems: 'end',
        }}
      >
        <TextField
          size="small"
          label="Ara"
          placeholder="Proje kodu veya adı"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
        <FormControl size="small" fullWidth>
          <InputLabel id="filter-project">Proje</InputLabel>
          <Select
            labelId="filter-project"
            label="Proje"
            value={projectId === '' ? '' : String(projectId)}
            onChange={(e) => {
              const v = e.target.value
              setProjectId(v === '' ? '' : Number(v))
              setPage(0)
            }}
          >
            <MenuItem value="">Tümü</MenuItem>
            {projectOptions.map((p) => (
              <MenuItem key={p.id} value={String(p.id)}>
                {p.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          label="Yıl"
          type="number"
          value={year}
          onChange={(e) => {
            const v = e.target.value
            setYear(v === '' ? '' : Number(v))
            setPage(0)
          }}
          inputProps={{ min: 2000, max: 2100 }}
        />
        <TextField
          size="small"
          label="Hafta"
          type="number"
          value={weekNumber}
          onChange={(e) => {
            const v = e.target.value
            setWeekNumber(v === '' ? '' : Number(v))
            setPage(0)
          }}
          inputProps={{ min: 1, max: 53 }}
        />
        <FormControl size="small" fullWidth>
          <InputLabel id="filter-schedule">Takvim</InputLabel>
          <Select
            labelId="filter-schedule"
            label="Takvim"
            value={scheduleFilter}
            onChange={(e) => {
              setScheduleFilter(e.target.value)
              setPage(0)
            }}
          >
            <MenuItem value="">Tümü</MenuItem>
            <MenuItem value="ON_TRACK">Takvimde</MenuItem>
            <MenuItem value="AT_RISK">Risk altında</MenuItem>
            <MenuItem value="DELAYED">Gecikmiş</MenuItem>
            <MenuItem value="AHEAD">İleride</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth>
          <InputLabel id="filter-sort">Sırala</InputLabel>
          <Select
            labelId="filter-sort"
            label="Sırala"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortOption)
              setPage(0)
            }}
          >
            <MenuItem value="reportDate,desc">Tarih (yeni)</MenuItem>
            <MenuItem value="reportDate,asc">Tarih (eski)</MenuItem>
            <MenuItem value="year,desc">Yıl (yeni)</MenuItem>
            <MenuItem value="year,asc">Yıl (eski)</MenuItem>
            <MenuItem value="weekNumber,desc">Hafta (yüksek)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {(query.data?.totalElements ?? 0) === 0 ? (
        <EmptyState
          title={
            hasFilters
              ? 'Filtrelere uygun rapor bulunamadı.'
              : 'Henüz haftalık rapor bulunmuyor.'
          }
          description={
            hasFilters
              ? 'Filtreleri değiştirerek yeniden deneyin.'
              : 'İlk haftalık raporunuzu oluşturarak başlayabilirsiniz.'
          }
          actionLabel={canCreate && !hasFilters ? 'İlk Raporu Oluştur' : undefined}
          onAction={canCreate && !hasFilters ? () => navigate('/reports/new') : undefined}
        />
      ) : rows.length === 0 && scheduleFilter ? (
        <EmptyState
          title="Filtrelere uygun rapor bulunamadı."
          description="Takvim filtresi yalnızca bu sayfadaki kayıtlara uygulanır. Filtreyi temizleyin veya sayfa boyutunu artırın."
        />
      ) : (
        <WeeklyReportList
          rows={rows}
          page={page}
          size={size}
          totalPages={query.data?.totalPages ?? 1}
          totalElements={query.data?.totalElements ?? 0}
          loading={query.isFetching}
          onPageChange={setPage}
          onSizeChange={(next) => {
            setSize(next)
            setPage(0)
          }}
        />
      )}
    </Box>
  )
}

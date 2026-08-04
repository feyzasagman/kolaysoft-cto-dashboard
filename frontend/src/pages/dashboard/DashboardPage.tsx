import AssignmentLateOutlinedIcon from '@mui/icons-material/AssignmentLateOutlined'
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import { Box, FormControl, InputLabel, MenuItem, Pagination, Select, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState } from '@/components/common/EmptyState'
import { CriticalRisksPanel } from '@/components/dashboard/CriticalRisksPanel'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { ProjectTable } from '@/components/dashboard/ProjectTable'
import { HealthDistributionPanel } from '@/components/dashboard/HealthDistributionPanel'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { SelectedProjectPanel } from '@/components/dashboard/SelectedProjectPanel'
import { useAuth } from '@/contexts/AuthContext'
import {
  useCriticalRisks,
  useDashboardProjects,
  useDashboardSummary,
  useHealthDistribution,
} from '@/hooks/useApiQueries'
import type { ProjectFiltersState } from '@/types/api'

const defaultFilters: ProjectFiltersState = {
  search: '',
  managerId: '',
  projectStatus: '',
  health: '',
  riskLevel: '',
  hasCurrentWeekReport: '',
  missingReport: false,
}

type SortField = 'name' | 'status' | 'code'

function currentIsoWeekLabel() {
  const now = new Date()
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()} · Hafta ${week}`
}

export function DashboardPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<ProjectFiltersState>(() => ({
    ...defaultFilters,
    search: searchParams.get('search') ?? '',
  }))
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search)
  const [page, setPage] = useState(0)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [periodLabel] = useState(currentIsoWeekLabel)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(filters.search.trim())
      setPage(0)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [filters.search])

  useEffect(() => {
    const fromUrl = searchParams.get('search')
    if (fromUrl != null && fromUrl !== filters.search) {
      setFilters((prev) => ({ ...prev, search: fromUrl }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Backend dashboard projects ALLOWED_SORT: name, code, status, …
  const sort = `${sortField === 'status' ? 'status' : sortField},${sortDir}`

  const summaryQuery = useDashboardSummary()
  const healthQuery = useHealthDistribution()
  const risksQuery = useCriticalRisks(8)
  const projectsQuery = useDashboardProjects({
    page,
    size: 10,
    sort,
    search: debouncedSearch || undefined,
    projectStatus: filters.projectStatus,
    health: filters.health,
    riskLevel: filters.riskLevel || undefined,
    hasCurrentWeekReport:
      filters.hasCurrentWeekReport === ''
        ? undefined
        : filters.hasCurrentWeekReport === 'true',
  })

  const refreshAll = () => {
    void summaryQuery.refetch()
    void healthQuery.refetch()
    void risksQuery.refetch()
    void projectsQuery.refetch()
  }

  useEffect(() => {
    const handler = () => refreshAll()
    window.addEventListener('cto:refresh', handler)
    return () => window.removeEventListener('cto:refresh', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const projects = useMemo(
    () => projectsQuery.data?.content ?? [],
    [projectsQuery.data?.content],
  )
  const totalPages = projectsQuery.data?.totalPages ?? 0
  const totalElements = projectsQuery.data?.totalElements ?? 0

  const selectedProject = useMemo(
    () => projects.find((p) => p.projectId === selectedId) ?? null,
    [projects, selectedId],
  )

  useEffect(() => {
    if (selectedId != null && !projects.some((p) => p.projectId === selectedId)) {
      setSelectedId(null)
    }
  }, [projects, selectedId])

  const isInitialLoading =
    (summaryQuery.isLoading && !summaryQuery.data) ||
    (projectsQuery.isLoading && !projectsQuery.data)

  if (isInitialLoading) {
    return <DashboardSkeleton />
  }

  if (summaryQuery.isError && projectsQuery.isError) {
    return <ErrorState onRetry={refreshAll} />
  }

  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    Boolean(filters.projectStatus) ||
    Boolean(filters.health) ||
    Boolean(filters.riskLevel) ||
    Boolean(filters.hasCurrentWeekReport) ||
    filters.missingReport

  const summary = summaryQuery.data

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setPage(0)
  }

  return (
    <Box>
      <PageHeader
        title="CTO Dashboard"
        description={
          user?.fullName
            ? `${user.fullName}, aktif projelerin sağlık, risk ve rapor durumunu buradan izleyebilirsiniz.`
            : 'Aktif projelerin sağlık, risk ve rapor durumunu izleyin.'
        }
        actions={
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="dashboard-period-label">Dönem</InputLabel>
            <Select
              labelId="dashboard-period-label"
              label="Dönem"
              value="current"
              aria-label="Tarih filtresi"
            >
              <MenuItem value="current">{periodLabel}</MenuItem>
            </Select>
          </FormControl>
        }
      />

      {summary ? (
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            mb: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
          }}
        >
          <KpiCard
            label="Active Projects"
            value={summary.activeProjects}
            secondary={`${summary.totalProjects} toplam proje`}
            icon={<FolderOpenOutlinedIcon fontSize="small" />}
            tone="#0969DA"
          />
          <KpiCard
            label="Projects at Risk"
            value={summary.riskyProjects}
            secondary="Sarı / kırmızı sağlık"
            icon={<WarningAmberOutlinedIcon fontSize="small" />}
            tone="#9A6700"
          />
          <KpiCard
            label="Critical Risks"
            value={summary.criticalRisks}
            secondary={`${summary.openRisks} açık risk`}
            icon={<ReportProblemOutlinedIcon fontSize="small" />}
            tone="#CF222E"
          />
          <KpiCard
            label="Missing Weekly Reports"
            value={summary.projectsWithoutCurrentWeekReport}
            secondary="Bu hafta rapor yok"
            icon={<AssignmentLateOutlinedIcon fontSize="small" />}
            tone="#656D76"
          />
        </Box>
      ) : summaryQuery.isError ? (
        <Box mb={2}>
          <ErrorState title="Özet metrikler alınamadı." onRetry={() => void summaryQuery.refetch()} />
        </Box>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          mb: 2,
          gridTemplateColumns: { xs: '1fr', lg: '1.15fr 1fr' },
        }}
      >
        {healthQuery.isError ? (
          <ErrorState title="Sağlık dağılımı alınamadı." onRetry={() => void healthQuery.refetch()} />
        ) : healthQuery.data ? (
          <HealthDistributionPanel data={healthQuery.data} />
        ) : (
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 2, minHeight: 220 }} />
        )}

        {risksQuery.isError ? (
          <ErrorState title="Kritik riskler alınamadı." onRetry={() => void risksQuery.refetch()} />
        ) : (
          <CriticalRisksPanel risks={risksQuery.data ?? []} />
        )}
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={1}
        mb={1.25}
      >
        <Typography variant="h5">Projeler</Typography>
        <Typography variant="caption" color="text.secondary">
          {totalElements} kayıt
        </Typography>
      </Stack>

      <Box mb={1.5} id="dashboard-filters">
        <FilterBar
          value={filters}
          onChange={(next) => {
            setFilters(next)
            setPage(0)
            if (next.search) {
              setSearchParams({ search: next.search })
            } else {
              setSearchParams({})
            }
          }}
        />
      </Box>

      {projectsQuery.isError ? (
        <ErrorState onRetry={() => void projectsQuery.refetch()} />
      ) : totalElements === 0 ? (
        <EmptyState
          title={
            hasActiveFilters
              ? 'Filtrelere uygun proje bulunamadı.'
              : 'Henüz proje bulunmuyor'
          }
          description={
            hasActiveFilters
              ? 'Filtreleri temizleyerek yeniden deneyebilirsiniz.'
              : 'Projeler eklendiğinde sağlık, risk ve aktivite bilgileri burada listelenir.'
          }
          actionLabel={hasActiveFilters ? 'Filtreleri temizle' : undefined}
          onAction={
            hasActiveFilters
              ? () => {
                  setFilters(defaultFilters)
                  setSearchParams({})
                  setPage(0)
                }
              : undefined
          }
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1fr) 320px' },
            alignItems: 'start',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <ProjectTable
              projects={projects}
              selectedId={selectedId}
              onSelect={setSelectedId}
              sortField={sortField}
              sortDir={sortDir}
              onSort={handleSort}
            />
            {totalPages > 1 && (
              <Stack alignItems="center" mt={2}>
                <Pagination
                  page={page + 1}
                  count={totalPages}
                  onChange={(_, next) => setPage(next - 1)}
                  color="primary"
                  aria-label="Proje sayfaları"
                  size="small"
                />
              </Stack>
            )}
          </Box>
          <SelectedProjectPanel project={selectedProject} />
        </Box>
      )}

      <Box mt={2}>
        <QuickActions />
      </Box>
    </Box>
  )
}

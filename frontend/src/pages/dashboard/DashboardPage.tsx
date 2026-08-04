import { Box, Pagination, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState } from '@/components/common/EmptyState'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'
import { DashboardSummaryCards } from '@/components/dashboard/DashboardSummary'
import { ProjectCard } from '@/components/dashboard/ProjectCard'
import { ProjectFilters } from '@/components/dashboard/ProjectFilters'
import { ProjectListView } from '@/components/dashboard/ProjectListView'
import { ProjectViewToggle } from '@/components/dashboard/ProjectViewToggle'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { useAuth } from '@/contexts/AuthContext'
import { useDashboardProjects, useDashboardSummary } from '@/hooks/useApiQueries'
import type { DashboardViewMode, ProjectFiltersState } from '@/types/api'

const VIEW_STORAGE_KEY = 'cto_dashboard_view_mode'

const defaultFilters: ProjectFiltersState = {
  search: '',
  managerId: '',
  projectStatus: '',
  health: '',
  riskLevel: '',
  hasCurrentWeekReport: '',
  missingReport: false,
}

function readViewMode(): DashboardViewMode {
  const raw = localStorage.getItem(VIEW_STORAGE_KEY)
  return raw === 'list' ? 'list' : 'cards'
}

export function DashboardPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<ProjectFiltersState>(() => ({
    ...defaultFilters,
    search: searchParams.get('search') ?? '',
  }))
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search)
  const [viewMode, setViewMode] = useState<DashboardViewMode>(() => readViewMode())
  const [page, setPage] = useState(0)

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

  const summaryQuery = useDashboardSummary()
  const projectsQuery = useDashboardProjects({
    page,
    size: viewMode === 'cards' ? 6 : 10,
    sort: 'name,asc',
    search: debouncedSearch || undefined,
    projectStatus: filters.projectStatus,
    health: filters.health,
    riskLevel: filters.riskLevel || undefined,
    hasCurrentWeekReport:
      filters.hasCurrentWeekReport === ''
        ? undefined
        : filters.hasCurrentWeekReport === 'true',
  })

  const projects = projectsQuery.data?.content ?? []
  const totalPages = projectsQuery.data?.totalPages ?? 0
  const totalElements = projectsQuery.data?.totalElements ?? 0

  const isInitialLoading =
    (summaryQuery.isLoading && !summaryQuery.data) ||
    (projectsQuery.isLoading && !projectsQuery.data)

  if (isInitialLoading) {
    return <DashboardSkeleton />
  }

  if (summaryQuery.isError && projectsQuery.isError) {
    return (
      <ErrorState
        onRetry={() => {
          void summaryQuery.refetch()
          void projectsQuery.refetch()
        }}
      />
    )
  }

  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    Boolean(filters.projectStatus) ||
    Boolean(filters.health) ||
    Boolean(filters.riskLevel) ||
    Boolean(filters.hasCurrentWeekReport) ||
    filters.missingReport

  return (
    <Box>
      <DashboardHeader
        fullName={user?.fullName}
        onRefresh={() => {
          void summaryQuery.refetch()
          void projectsQuery.refetch()
        }}
      />

      {summaryQuery.data ? (
        <Box mb={2.5}>
          <DashboardSummaryCards summary={summaryQuery.data} />
        </Box>
      ) : summaryQuery.isError ? (
        <Box mb={2.5}>
          <ErrorState
            title="Özet metrikler alınamadı."
            onRetry={() => void summaryQuery.refetch()}
          />
        </Box>
      ) : null}

      <Box mb={2.5}>
        <QuickActions />
      </Box>

      <Stack
        id="dashboard-filters"
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={1.5}
        mb={1.5}
      >
        <Typography variant="subtitle1">Projeler</Typography>
        <ProjectViewToggle
          value={viewMode}
          onChange={(next) => {
            setViewMode(next)
            localStorage.setItem(VIEW_STORAGE_KEY, next)
            setPage(0)
          }}
        />
      </Stack>

      <Box mb={2}>
        <ProjectFilters
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
          title={hasActiveFilters ? 'Filtrelere uygun proje bulunamadı.' : 'Henüz proje bulunmuyor'}
          description={
            hasActiveFilters
              ? 'Filtreleri temizleyerek yeniden deneyebilirsiniz.'
              : 'Projeler eklendiğinde sağlık ve aktivite bilgileri burada görüntülenecektir.'
          }
        />
      ) : viewMode === 'cards' ? (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, minmax(0, 1fr))',
            },
          }}
        >
          {projects.map((project) => (
            <ProjectCard key={project.projectId} project={project} />
          ))}
        </Box>
      ) : (
        <ProjectListView projects={projects} />
      )}

      {totalPages > 1 && (
        <Stack alignItems="center" mt={2.5}>
          <Pagination
            page={page + 1}
            count={totalPages}
            onChange={(_, next) => setPage(next - 1)}
            color="primary"
            aria-label="Proje sayfaları"
          />
        </Stack>
      )}
    </Box>
  )
}

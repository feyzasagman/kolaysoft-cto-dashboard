import FolderOffOutlinedIcon from '@mui/icons-material/FolderOffOutlined'
import { Box } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { AppErrorState } from '@/components/common/AppErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { ProjectPortfolioFilterBar } from '@/components/portfolio/ProjectPortfolioFilterBar'
import { ProjectPortfolioHeader } from '@/components/portfolio/ProjectPortfolioHeader'
import { ProjectPortfolioList } from '@/components/portfolio/ProjectPortfolioList'
import { ProjectPortfolioSkeleton } from '@/components/portfolio/ProjectPortfolioSkeleton'
import { useAuth } from '@/contexts/AuthContext'
import {
  useDashboardProjects,
  useDashboardSummary,
  useUsers,
} from '@/hooks/useApiQueries'
import { mapPortfolioRows } from '@/utils/dashboardMapper'
import {
  DEFAULT_PORTFOLIO_FILTERS,
  type PortfolioFilterState,
} from '@/utils/portfolioFilterState'

/**
 * Sprint 3 — Project Portfolio Enterprise Redesign (ADMIN / CTO).
 * Mevcut dashboard projects endpoint’i; DataGrid yerine GitHub-tarzı liste.
 */
export function AdminProjectsView() {
  const { hasAnyRole } = useAuth()
  const canCreateReport = hasAnyRole('ADMIN')
  const canCreateProject = hasAnyRole('ADMIN')

  const [filters, setFilters] = useState<PortfolioFilterState>(DEFAULT_PORTFOLIO_FILTERS)
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null)

  useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((prev) => {
        if (prev.search === searchInput) return prev
        setPage(0)
        return { ...prev, search: searchInput }
      })
    }, 350)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const filterValue = { ...filters, search: searchInput }

  const summaryQuery = useDashboardSummary(true)
  const managersQuery = useUsers({
    page: 0,
    size: 100,
    role: 'PROJECT_MANAGER',
    active: true,
  })
  const projectsQuery = useDashboardProjects({
    page,
    size,
    sort: filters.sort,
    search: filters.search.trim() || undefined,
    projectStatus: filters.projectStatus || undefined,
    health: filters.health || undefined,
    managerId: filters.managerId ? Number(filters.managerId) : undefined,
    hasCurrentWeekReport:
      filters.hasCurrentWeekReport === ''
        ? undefined
        : filters.hasCurrentWeekReport === 'true',
  })

  const rows = useMemo(
    () => mapPortfolioRows(projectsQuery.data?.content),
    [projectsQuery.data?.content],
  )

  useEffect(() => {
    if (projectsQuery.dataUpdatedAt) setLastRefreshedAt(new Date())
  }, [projectsQuery.dataUpdatedAt])

  const refreshAll = () => {
    void Promise.all([summaryQuery.refetch(), projectsQuery.refetch(), managersQuery.refetch()]).then(
      () => setLastRefreshedAt(new Date()),
    )
  }

  const clearFilters = () => {
    setSearchInput('')
    setFilters(DEFAULT_PORTFOLIO_FILTERS)
    setPage(0)
  }

  const updateFilters = (next: PortfolioFilterState) => {
    setSearchInput(next.search)
    setFilters({
      ...next,
      // Arama debounce ile API’ye gider; diğer filtreler anında.
      search: filters.search,
    })
    setPage(0)
  }

  if (projectsQuery.isLoading && !projectsQuery.data) {
    return <ProjectPortfolioSkeleton />
  }

  if (projectsQuery.isError && !projectsQuery.data) {
    return (
      <AppErrorState
        kind="network"
        title="Proje portföyü alınamadı."
        onRetry={() => void projectsQuery.refetch()}
      />
    )
  }

  const totalElements = projectsQuery.data?.totalElements ?? 0
  const totalPages = projectsQuery.data?.totalPages ?? 0
  const totalProjects = summaryQuery.data?.totalProjects ?? totalElements
  const activeProjects = summaryQuery.data?.activeProjects ?? 0
  const filtersActive = Boolean(
    filters.search.trim() ||
      filters.projectStatus ||
      filters.health ||
      filters.managerId ||
      filters.hasCurrentWeekReport,
  )
  const refreshing = projectsQuery.isFetching || summaryQuery.isFetching

  return (
    <Box>
      <ProjectPortfolioHeader
        totalProjects={totalProjects}
        activeProjects={activeProjects}
        lastRefreshedAt={lastRefreshedAt}
        refreshing={refreshing}
        canCreateProject={canCreateProject}
        onRefresh={refreshAll}
        onCreateProject={() =>
          toast.info('Yeni proje ekranı henüz eklenmedi. Backend create akışı sonraki sprint.')
        }
        onExport={() => toast.info('Export yakında eklenecek.')}
      />

      <ProjectPortfolioFilterBar
        value={filterValue}
        managers={managersQuery.data?.content ?? []}
        onChange={updateFilters}
        onClear={clearFilters}
      />

      {totalElements === 0 ? (
        <EmptyState
          icon={<FolderOffOutlinedIcon />}
          title={filtersActive ? 'Filtrelere uygun proje yok' : 'Henüz proje bulunmuyor'}
          description={
            filtersActive
              ? 'Filtreleri temizleyerek yeniden deneyin.'
              : 'İlk projeyi oluşturduğunuzda portföy burada listelenir.'
          }
          actionLabel={filtersActive ? 'Filtreleri Temizle' : undefined}
          onAction={filtersActive ? clearFilters : undefined}
        />
      ) : (
        <ProjectPortfolioList
          rows={rows}
          page={page}
          size={size}
          totalPages={totalPages}
          totalElements={totalElements}
          loading={projectsQuery.isFetching}
          canCreateReport={canCreateReport}
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

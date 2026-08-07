import FolderOffOutlinedIcon from '@mui/icons-material/FolderOffOutlined'
import { Box, Stack } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { CriticalRisksPanel } from '@/components/dashboard/CriticalRisksPanel'
import { DashboardErrorState } from '@/components/dashboard/DashboardErrorState'
import { DashboardFilterBar } from '@/components/dashboard/DashboardFilterBar'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'
import { DashboardSummaryCards } from '@/components/dashboard/DashboardSummary'
import { HealthDistributionPanel } from '@/components/dashboard/HealthDistributionPanel'
import {
  ProjectPortfolioTable,
  ProjectTableSkeleton,
} from '@/components/dashboard/ProjectPortfolioTable'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecentActivityPanel } from '@/components/dashboard/RecentActivityPanel'
import { RecentReportsPanel } from '@/components/dashboard/RecentReportsPanel'
import { useAuth } from '@/contexts/AuthContext'
import {
  useCriticalRisks,
  useDashboardProjects,
  useDashboardSummary,
  useHealthDistribution,
  useUsers,
} from '@/hooks/useApiQueries'
import {
  DEFAULT_DASHBOARD_FILTERS,
  dashboardReturnQuery,
  hasActiveFilters,
  parseDashboardFilters,
  toApiProjectParams,
  toSearchParams,
  type DashboardFilterState,
} from '@/utils/dashboardFilterMapper'
import { mapPortfolioRows } from '@/utils/dashboardMapper'
import { formatRelativeTime } from '@/utils/formatRelative'
import { getHttpStatus } from '@/utils/errorUtils'

/**
 * Enterprise dashboard — mevcut endpoint’lerle yeniden düzenlenmiş layout.
 */
export function DashboardPage() {
  const { user, hasAnyRole } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null)
  const [searchInput, setSearchInput] = useState('')

  const canAccessDashboard = hasAnyRole('ADMIN', 'CTO')
  const filters = useMemo(() => parseDashboardFilters(searchParams), [searchParams])

  useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput === filters.search) return
      const next = { ...filters, search: searchInput, page: 0 }
      setSearchParams(toSearchParams(next), { replace: true })
    }, 350)
    return () => window.clearTimeout(timer)
  }, [searchInput, filters, setSearchParams])

  const updateFilters = (next: DashboardFilterState) => {
    setSearchParams(toSearchParams(next), { replace: true })
  }

  const clearFilters = () => {
    setSearchInput('')
    setSearchParams(toSearchParams({ ...DEFAULT_DASHBOARD_FILTERS }), { replace: true })
  }

  const apiParams = toApiProjectParams(filters)

  const summaryQuery = useDashboardSummary(canAccessDashboard)
  const healthQuery = useHealthDistribution(canAccessDashboard)
  const risksQuery = useCriticalRisks(8, canAccessDashboard)
  const projectsQuery = useDashboardProjects(apiParams, canAccessDashboard)
  const managersQuery = useUsers(
    { page: 0, size: 100, role: 'PROJECT_MANAGER', active: true },
  )

  const refreshAll = () => {
    void Promise.all([
      summaryQuery.refetch(),
      healthQuery.refetch(),
      risksQuery.refetch(),
      projectsQuery.refetch(),
    ]).then(() => setLastRefreshedAt(new Date()))
  }

  useEffect(() => {
    if (!canAccessDashboard) return
    const handler = () => refreshAll()
    window.addEventListener('cto:refresh', handler)
    return () => window.removeEventListener('cto:refresh', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccessDashboard])

  useEffect(() => {
    if (summaryQuery.dataUpdatedAt || projectsQuery.dataUpdatedAt) {
      setLastRefreshedAt(new Date())
    }
  }, [summaryQuery.dataUpdatedAt, projectsQuery.dataUpdatedAt])

  const portfolioRows = useMemo(
    () => mapPortfolioRows(projectsQuery.data?.content),
    [projectsQuery.data?.content],
  )

  const filterBarValue = { ...filters, search: searchInput }
  const returnSuffix = dashboardReturnQuery(filters)
  const detailQuery =
    returnSuffix.length > 0
      ? `${returnSuffix}&from=dashboard`
      : '?from=dashboard'

  if (!canAccessDashboard) {
    return <Navigate to="/unauthorized" replace />
  }

  const isInitialLoading =
    (summaryQuery.isLoading && !summaryQuery.data) ||
    (projectsQuery.isLoading && !projectsQuery.data)

  const isForbidden =
    getHttpStatus(summaryQuery.error) === 403 || getHttpStatus(projectsQuery.error) === 403

  if (isForbidden) {
    return <Navigate to="/unauthorized" replace />
  }

  if (isInitialLoading) {
    return <DashboardSkeleton />
  }

  if (summaryQuery.isError && projectsQuery.isError) {
    return <DashboardErrorState onRetry={refreshAll} />
  }

  const refreshing =
    summaryQuery.isFetching ||
    healthQuery.isFetching ||
    risksQuery.isFetching ||
    projectsQuery.isFetching

  const totalElements = projectsQuery.data?.totalElements ?? 0
  const totalPages = projectsQuery.data?.totalPages ?? 0
  const filtersActive = hasActiveFilters(filters)
  const updatedLabel = lastRefreshedAt ? `Updated ${formatRelativeTime(lastRefreshedAt)}` : null

  return (
    <Box>
      <DashboardHeader
        role={user?.role}
        fullName={user?.fullName}
        lastRefreshedAt={lastRefreshedAt}
        refreshing={refreshing}
        onRefresh={refreshAll}
      />

      <Stack spacing={3}>
        {/* KPI */}
        {summaryQuery.isError ? (
          <DashboardErrorState
            title="Özet metrikler alınamadı."
            onRetry={() => void summaryQuery.refetch()}
          />
        ) : (
          <DashboardSummaryCards summary={summaryQuery.data} updatedLabel={updatedLabel} />
        )}

        {/* Health + Recent Reports */}
        <Box
          sx={{
            display: 'grid',
            gap: 2.5,
            gridTemplateColumns: { xs: '1fr', lg: '1.1fr 1fr' },
          }}
        >
          {healthQuery.isError ? (
            <DashboardErrorState
              title="Sağlık dağılımı alınamadı."
              onRetry={() => void healthQuery.refetch()}
            />
          ) : (
            <HealthDistributionPanel data={healthQuery.data} loading={healthQuery.isLoading} />
          )}
          <RecentReportsPanel
            rows={portfolioRows}
            loading={projectsQuery.isLoading}
            detailQuerySuffix={detailQuery}
          />
        </Box>

        {/* Portfolio filters + table */}
        <Stack spacing={2}>
          <DashboardFilterBar
            value={filterBarValue}
            managers={managersQuery.data?.content ?? []}
            onChange={updateFilters}
            onClear={clearFilters}
          />

          {projectsQuery.isError ? (
            <DashboardErrorState
              title="Proje portföyü alınamadı."
              onRetry={() => void projectsQuery.refetch()}
            />
          ) : projectsQuery.isLoading && !projectsQuery.data ? (
            <ProjectTableSkeleton />
          ) : totalElements === 0 ? (
            <EmptyState
              icon={<FolderOffOutlinedIcon />}
              title={
                filtersActive
                  ? 'Filtrelere uygun proje bulunamadı.'
                  : 'Henüz proje bulunmuyor.'
              }
              description={
                filtersActive
                  ? 'Filtreleri temizleyerek yeniden deneyebilirsiniz.'
                  : 'İlk projeyi oluşturun. Projeler eklendiğinde sağlık, ilerleme ve rapor bilgileri burada görüntülenir.'
              }
              actionLabel={
                filtersActive
                  ? 'Clear Filters'
                  : hasAnyRole('ADMIN')
                    ? 'Projeleri Görüntüle'
                    : undefined
              }
              onAction={
                filtersActive
                  ? clearFilters
                  : hasAnyRole('ADMIN')
                    ? () => navigate('/projects')
                    : undefined
              }
            />
          ) : (
            <ProjectPortfolioTable
              rows={portfolioRows}
              page={filters.page}
              size={filters.size}
              totalPages={totalPages}
              totalElements={totalElements}
              loading={projectsQuery.isFetching}
              detailQuerySuffix={detailQuery}
              onPageChange={(page) => updateFilters({ ...filters, page })}
              onSizeChange={(size) => updateFilters({ ...filters, size, page: 0 })}
            />
          )}
        </Stack>

        {/* Risks + Activity */}
        <Box
          sx={{
            display: 'grid',
            gap: 2.5,
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          }}
        >
          {risksQuery.isError ? (
            <DashboardErrorState
              title="Kritik riskler alınamadı."
              onRetry={() => void risksQuery.refetch()}
            />
          ) : (
            <CriticalRisksPanel risks={risksQuery.data} loading={risksQuery.isLoading} />
          )}
          <RecentActivityPanel
            risks={risksQuery.data}
            rows={portfolioRows}
            loading={risksQuery.isLoading || projectsQuery.isLoading}
          />
        </Box>

        <QuickActions />
      </Stack>
    </Box>
  )
}

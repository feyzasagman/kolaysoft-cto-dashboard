import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import { Box, Button, Fade, Stack, Typography } from '@mui/material'
import { useEffect, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AppErrorState } from '@/components/common/AppErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import {
  ProjectDetailErrorState,
  ProjectDetailSkeleton,
} from '@/components/projects/ProjectDetailSkeleton'
import { ProjectDetailTabs } from '@/components/projects/ProjectDetailTabs'
import {
  isProjectDetailTab,
  type ProjectDetailTabId,
} from '@/components/projects/projectDetailTabConfig'
import { ProjectHeroHeader } from '@/components/projects/ProjectHeroHeader'
import { ProjectMetricGrid } from '@/components/projects/ProjectMetricGrid'
import { ProjectOverviewTab } from '@/components/projects/ProjectOverviewTab'
import { ProjectReportTimeline } from '@/components/projects/ProjectReportTimeline'
import { ProjectRiskPanel } from '@/components/projects/ProjectRiskPanel'
import { ProjectWorkItemsPanel } from '@/components/projects/ProjectWorkItemsPanel'
import { useAuth } from '@/contexts/AuthContext'
import {
  useProjectDetail,
  useProjectReports,
  useRiskIssues,
  useWeeklyReport,
  useWorkItems,
} from '@/hooks/useApiQueries'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import { getHttpStatus } from '@/utils/errorUtils'
import { rememberProjectId } from '@/utils/projectCache'
import {
  countOpenWorkItems,
  countRisksByLevel,
  mapProjectDetail,
} from '@/utils/projectDetailMapper'

/**
 * Sprint 4 — Project Detail Command Center.
 * Mevcut endpoint’ler; sahte activity yok; tab URL state.
 */
export function ProjectDetailPage() {
  const { projectId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, hasAnyRole } = useAuth()

  const id = Number(projectId)
  const validId = Number.isFinite(id) && id > 0
  const fromDashboard = searchParams.get('from') === 'dashboard'
  const tabParam = searchParams.get('tab')
  const tab: ProjectDetailTabId = isProjectDetailTab(tabParam) ? tabParam : 'overview'

  const dashboardQuery = useMemo(() => {
    const params = new URLSearchParams(searchParams)
    params.delete('from')
    params.delete('tab')
    const q = params.toString()
    return q ? `?${q}` : ''
  }, [searchParams])

  const detailQuery = useProjectDetail(validId ? id : null)
  const reportsQuery = useProjectReports(validId ? id : null, Boolean(detailQuery.data))
  const latestReportId = detailQuery.data?.latestReport?.reportId ?? null
  const fullLatestQuery = useWeeklyReport(latestReportId)
  const workItemsQuery = useWorkItems(latestReportId)
  const risksQuery = useRiskIssues(latestReportId)

  useEffect(() => {
    if (detailQuery.data?.projectId) rememberProjectId(detailQuery.data.projectId)
  }, [detailQuery.data?.projectId])

  const model = useMemo(
    () => (detailQuery.data ? mapProjectDetail(detailQuery.data) : null),
    [detailQuery.data],
  )

  const riskCounts = useMemo(
    () => countRisksByLevel(risksQuery.data?.content),
    [risksQuery.data?.content],
  )

  const openWorkItems = useMemo(
    () => countOpenWorkItems(workItemsQuery.data?.content),
    [workItemsQuery.data?.content],
  )

  const setTab = (next: ProjectDetailTabId) => {
    const params = new URLSearchParams(searchParams)
    if (next === 'overview') params.delete('tab')
    else params.set('tab', next)
    setSearchParams(params, { replace: true })
  }

  if (!validId) {
    return (
      <AppErrorState
        kind="notFound"
        title="Proje bulunamadı."
        description="Geçersiz proje kimliği."
        secondaryAction={
          <Button variant="outlined" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
        }
      />
    )
  }

  const status = getHttpStatus(detailQuery.error)
  if (status === 403) {
    return (
      <AppErrorState
        kind="forbidden"
        title="Bu projeyi görüntüleme yetkiniz bulunmamaktadır."
        description="Yalnızca yetkili olduğunuz projeleri görüntüleyebilirsiniz."
        secondaryAction={
          <Button
            variant="outlined"
            onClick={() =>
              navigate(fromDashboard ? `/dashboard${dashboardQuery}` : '/projects')
            }
          >
            Geri Dön
          </Button>
        }
      />
    )
  }
  if (status === 404) {
    return (
      <AppErrorState
        kind="notFound"
        title="Proje bulunamadı."
        description="Aradığınız proje mevcut değil veya silinmiş olabilir."
        onRetry={() => void detailQuery.refetch()}
        secondaryAction={
          <Button
            variant="outlined"
            onClick={() =>
              navigate(fromDashboard ? `/dashboard${dashboardQuery}` : '/projects')
            }
          >
            Geri Dön
          </Button>
        }
      />
    )
  }

  if (detailQuery.isLoading) {
    return <ProjectDetailSkeleton />
  }

  if (detailQuery.isError || !detailQuery.data || !model) {
    return (
      <ProjectDetailErrorState
        title="Proje bilgileri alınamadı."
        onRetry={() => void detailQuery.refetch()}
        onBack={() => navigate(fromDashboard ? `/dashboard${dashboardQuery}` : '/projects')}
      />
    )
  }

  const isCto = hasAnyRole('CTO') && !hasAnyRole('ADMIN')
  const isAdmin = hasAnyRole('ADMIN')
  const isPm = hasAnyRole('PROJECT_MANAGER')
  const isOwnProject =
    user?.userId != null && detailQuery.data.managerId === user.userId
  const canCreateReport = isAdmin || (isPm && isOwnProject)
  const canViewLatestReport = Boolean(latestReportId)

  const refreshing =
    detailQuery.isFetching ||
    reportsQuery.isFetching ||
    workItemsQuery.isFetching ||
    risksQuery.isFetching ||
    fullLatestQuery.isFetching

  const refreshAll = () => {
    void Promise.all([
      detailQuery.refetch(),
      reportsQuery.refetch(),
      workItemsQuery.refetch(),
      risksQuery.refetch(),
      fullLatestQuery.refetch(),
    ])
  }

  return (
    <Box>
      <ProjectHeroHeader
        model={model}
        fromDashboard={fromDashboard}
        dashboardQuery={dashboardQuery}
        canCreateReport={canCreateReport && !isCto}
        canViewLatestReport={canViewLatestReport}
        canEditProject={false}
        refreshing={refreshing}
        onRefresh={refreshAll}
      />

      <ProjectMetricGrid
        progressActual={model.progressActual}
        progressTarget={model.progressTarget}
        openRisks={model.openRisks}
        criticalRisks={riskCounts.critical}
        openWorkItems={openWorkItems}
        reportCount={model.reportHistoryCount}
      />

      <ProjectDetailTabs value={tab} onChange={setTab} />

      <Box
        id={`project-tabpanel-${tab}`}
        role="tabpanel"
        aria-labelledby={`project-tab-${tab}`}
        sx={{
          ...surfaceSx,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          p: { xs: DASH.space2, md: DASH.space3 },
          minHeight: 360,
        }}
      >
        <Fade in key={tab} timeout={160}>
          <Box>
            {tab === 'overview' && (
              <ProjectOverviewTab
                model={model}
                latest={detailQuery.data.latestReport}
                fullReport={fullLatestQuery.data}
                scheduleStatus={fullLatestQuery.data?.scheduleStatus}
                risks={risksQuery.data?.content}
                workItems={workItemsQuery.data?.content}
                history={detailQuery.data.lastFiveReports}
                reports={reportsQuery.data?.content}
                risksLoading={risksQuery.isLoading}
                workLoading={workItemsQuery.isLoading}
                canCreateReport={canCreateReport && !isCto}
              />
            )}

            {tab === 'reports' && (
              <ProjectReportTimeline
                history={detailQuery.data.lastFiveReports}
                reports={reportsQuery.data?.content}
                title="Raporlar"
              />
            )}

            {tab === 'risks' && (
              <ProjectRiskPanel
                risks={risksQuery.data?.content}
                openRiskCount={model.openRisks}
                loading={risksQuery.isLoading}
              />
            )}

            {tab === 'workItems' && (
              <ProjectWorkItemsPanel
                items={workItemsQuery.data?.content}
                loading={workItemsQuery.isLoading}
              />
            )}

            {tab === 'history' && (
              <Stack spacing={DASH.space3}>
                <EmptyState
                  icon={<HistoryOutlinedIcon />}
                  title="Detaylı aktivite geçmişi için audit log altyapısı henüz bulunmamaktadır."
                  description="Aşağıda yalnızca mevcut haftalık rapor geçmişi ve proje tarihleri gösterilir. Sahte aktivite üretilmez."
                />
                <Box sx={{ ...surfaceSx, p: DASH.cardPadding }}>
                  <Typography variant="h5" component="h3" mb={DASH.space2}>
                    Proje tarihleri
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Başlangıç:</strong> {model.startDateLabel}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Hedef bitiş:</strong> {model.targetEndDateLabel}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Son rapor:</strong> {model.lastUpdateLabel}
                    </Typography>
                  </Stack>
                </Box>
                <ProjectReportTimeline
                  history={detailQuery.data.lastFiveReports}
                  reports={reportsQuery.data?.content}
                  title="Haftalık rapor geçmişi"
                />
              </Stack>
            )}
          </Box>
        </Fade>
      </Box>
    </Box>
  )
}

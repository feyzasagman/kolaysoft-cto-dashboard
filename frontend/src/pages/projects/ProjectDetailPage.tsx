import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import { Box, Button, Fade, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
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
import {
  ProjectFormDialog,
  type ProjectFormPayload,
} from '@/components/projects/ProjectFormDialog'
import { ProjectHeroHeader } from '@/components/projects/ProjectHeroHeader'
import { ProjectMetricGrid } from '@/components/projects/ProjectMetricGrid'
import { ExecutiveProjectInsight } from '@/components/projects/ExecutiveProjectInsight'
import { ProjectOverviewTab } from '@/components/projects/ProjectOverviewTab'
import { ProjectReportTimeline } from '@/components/projects/ProjectReportTimeline'
import { ProjectRiskPanel } from '@/components/projects/ProjectRiskPanel'
import { ProjectTeamPanel } from '@/components/projects/ProjectTeamPanel'
import { ProjectWorkItemsPanel } from '@/components/projects/ProjectWorkItemsPanel'
import { useAuth } from '@/contexts/AuthContext'
import {
  useProjectDetail,
  useProjectReports,
  useRiskIssues,
  useUpdateProject,
  useUsers,
  useWeeklyReport,
  useWorkItems,
} from '@/hooks/useApiQueries'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import { getErrorMessage, getHttpStatus } from '@/utils/errorUtils'
import { rememberProjectId } from '@/utils/projectCache'
import {
  countOpenWorkItems,
  countRisksByLevel,
  mapProjectDetail,
} from '@/utils/projectDetailMapper'
import { isCurrentWeekReport } from '@/utils/executiveInsight'
import type { ProjectStatus } from '@/types/api'

/**
 * Sprint 4 — Project Detail Command Center.
 * Day17: team tab + ADMIN edit project.
 */
export function ProjectDetailPage() {
  const { projectId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { hasAnyRole } = useAuth()

  const id = Number(projectId)
  const validId = Number.isFinite(id) && id > 0
  const fromDashboard = searchParams.get('from') === 'dashboard'
  const tabParam = searchParams.get('tab')
  const tab: ProjectDetailTabId = isProjectDetailTab(tabParam) ? tabParam : 'overview'

  const [editOpen, setEditOpen] = useState(false)
  const updateMutation = useUpdateProject()
  const managersQuery = useUsers({
    page: 0,
    size: 100,
    role: 'PROJECT_MANAGER',
    active: true,
  })

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

  const hasCurrentWeekReport = useMemo(() => {
    const latest = detailQuery.data?.latestReport
    if (!latest) return false
    return isCurrentWeekReport(latest.year, latest.weekNumber)
  }, [detailQuery.data?.latestReport])

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
            onClick={() => navigate(fromDashboard ? `/dashboard${dashboardQuery}` : '/projects')}
          >
            Geri
          </Button>
        }
      />
    )
  }

  if (detailQuery.isLoading && !detailQuery.data) {
    return <ProjectDetailSkeleton />
  }

  if (detailQuery.isError || !detailQuery.data || !model) {
    return (
      <ProjectDetailErrorState
        onRetry={() => void detailQuery.refetch()}
        onBack={() => navigate(fromDashboard ? `/dashboard${dashboardQuery}` : '/projects')}
      />
    )
  }

  const isCto = hasAnyRole('CTO') && !hasAnyRole('ADMIN')
  const isAdmin = hasAnyRole('ADMIN')
  const isPm = hasAnyRole('PROJECT_MANAGER')
  // Detail 200 ise backend ProjectAccess okumaya izin vermiştir (manager veya assignment).
  const canCreateReport = isAdmin || isPm
  const canViewLatestReport = Boolean(latestReportId)
  const canEditProject = isAdmin
  const canManageTeam = isAdmin

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

  const handleUpdate = async (payload: ProjectFormPayload) => {
    try {
      await updateMutation.mutateAsync({
        id,
        payload: {
          ...payload,
          status: payload.status as ProjectStatus,
        },
      })
      toast.success('Proje başarıyla güncellendi.')
      setEditOpen(false)
      void detailQuery.refetch()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Proje güncellenemedi.'))
    }
  }

  const managers = managersQuery.data?.content ?? []

  return (
    <Box>
      <ProjectHeroHeader
        model={model}
        fromDashboard={fromDashboard}
        dashboardQuery={dashboardQuery}
        canCreateReport={canCreateReport && !isCto}
        canViewLatestReport={canViewLatestReport}
        canEditProject={canEditProject}
        refreshing={refreshing}
        onRefresh={refreshAll}
        onEditProject={() => setEditOpen(true)}
      />

      <ProjectMetricGrid
        progressActual={model.progressActual}
        progressTarget={model.progressTarget}
        openRisks={model.openRisks}
        criticalRisks={riskCounts.critical}
        openWorkItems={openWorkItems}
        reportCount={model.reportHistoryCount}
      />

      <ExecutiveProjectInsight
        progressTarget={model.progressTarget}
        progressActual={model.progressActual}
        health={model.health}
        openRiskCount={riskCounts.openTotal > 0 ? riskCounts.openTotal : model.openRisks}
        criticalRiskCount={riskCounts.critical}
        openWorkItems={openWorkItems}
        hasCurrentWeekReport={hasCurrentWeekReport}
        hasAnyReport={Boolean(detailQuery.data.latestReport)}
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

            {tab === 'team' && (
              <ProjectTeamPanel
                projectId={id}
                managerId={detailQuery.data.managerId}
                managerName={detailQuery.data.managerName}
                managerEmail={detailQuery.data.managerEmail}
                canManage={canManageTeam}
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

      {canEditProject && (
        <ProjectFormDialog
          open={editOpen}
          initialFromDashboard={{
            projectId: id,
            code: detailQuery.data.code,
            name: detailQuery.data.name,
            description: detailQuery.data.description,
            managerId: detailQuery.data.managerId,
            projectStatus: detailQuery.data.projectStatus,
            startDate: detailQuery.data.startDate,
            targetEndDate: detailQuery.data.targetEndDate,
          }}
          managers={managers}
          submitting={updateMutation.isPending}
          onClose={() => {
            if (updateMutation.isPending) return
            setEditOpen(false)
          }}
          onSubmit={handleUpdate}
        />
      )}
    </Box>
  )
}

import { Box, Button, Fade, Stack, Tab, Tabs, Typography } from '@mui/material'
import {
  memo,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AppErrorState } from '@/components/common/AppErrorState'
import { ProjectActivityTimeline } from '@/components/projects/ProjectActivityTimeline'
import {
  ProjectDetailErrorState,
  ProjectDetailSkeleton,
} from '@/components/projects/ProjectDetailSkeleton'
import { ProjectHeroHeader } from '@/components/projects/ProjectHeroHeader'
import { ProjectMetricCards } from '@/components/projects/ProjectMetricCards'
import { ProjectOverviewPanel } from '@/components/projects/ProjectOverviewPanel'
import { ProjectQuickSidebar } from '@/components/projects/ProjectQuickSidebar'
import { ProjectReportCards } from '@/components/projects/ProjectReportCards'
import { ProjectRisksPanel } from '@/components/projects/ProjectRisksPanel'
import { ProjectSection } from '@/components/projects/ProjectSection'
import { ProjectWorkItemsChecklist } from '@/components/projects/ProjectWorkItemsChecklist'
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
  buildActivityTimeline,
  countWorkByStatus,
  mapProjectDetail,
} from '@/utils/projectDetailMapper'

type DetailTab = 'overview' | 'reports' | 'risks' | 'workItems' | 'history'

const TABS: Array<{ id: DetailTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'reports', label: 'Reports' },
  { id: 'risks', label: 'Risks' },
  { id: 'workItems', label: 'Work Items' },
  { id: 'history', label: 'History' },
]

const TabPanel = memo(function TabPanel({ children }: { children: ReactNode }) {
  return <Box sx={{ py: DASH.space1 }}>{children}</Box>
})

/**
 * Sprint 2 — Project Detail Enterprise Redesign.
 * Mevcut endpoint’ler; UI/UX kalitesi.
 */
export function ProjectDetailPage() {
  const { projectId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, hasAnyRole } = useAuth()
  const [tab, setTab] = useState<DetailTab>('overview')

  const id = Number(projectId)
  const validId = Number.isFinite(id) && id > 0
  const fromDashboard = searchParams.get('from') === 'dashboard'
  const dashboardQuery = useMemo(() => {
    const params = new URLSearchParams(searchParams)
    params.delete('from')
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

  const workStats = useMemo(
    () => countWorkByStatus(workItemsQuery.data?.content),
    [workItemsQuery.data?.content],
  )

  const timeline = useMemo(() => {
    if (!model || !detailQuery.data) return []
    return buildActivityTimeline({
      model,
      history: detailQuery.data.lastFiveReports,
      reports: reportsQuery.data?.content,
      risks: risksQuery.data?.content,
      workItems: workItemsQuery.data?.content,
    })
  }, [
    model,
    detailQuery.data,
    reportsQuery.data?.content,
    risksQuery.data?.content,
    workItemsQuery.data?.content,
  ])

  if (!validId) {
    return (
      <AppErrorState
        kind="notFound"
        title="Geçersiz proje kimliği"
        description="URL’deki proje kimliği geçersiz."
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
    return <Navigate to="/unauthorized" replace />
  }
  if (status === 404) {
    return (
      <AppErrorState
        kind="notFound"
        title="Proje bulunamadı"
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
  const canEditLatestReport = Boolean(latestReportId) && (isAdmin || (isPm && isOwnProject))
  const backTo = fromDashboard ? `/dashboard${dashboardQuery}` : '/projects'

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

  const handleTabChange = (_: SyntheticEvent, value: DetailTab) => {
    setTab(value)
  }

  return (
    <Box>
      <ProjectHeroHeader
        model={model}
        fromDashboard={fromDashboard}
        dashboardQuery={dashboardQuery}
        canCreateReport={canCreateReport}
        canEditLatestReport={canEditLatestReport}
        isCto={isCto}
        refreshing={refreshing}
        onRefresh={refreshAll}
      />

      <ProjectMetricCards model={model} completedTasks={workStats.done} teamMembers={1} />

      <Box
        sx={{
          display: 'grid',
          gap: DASH.space3,
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 300px' },
          alignItems: 'start',
        }}
      >
        <Box sx={{ ...surfaceSx, overflow: 'hidden', minWidth: 0 }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Proje detay sekmeleri"
            sx={{
              px: DASH.space2,
              minHeight: 48,
              borderBottom: DASH.border,
              borderColor: 'divider',
              bgcolor: '#FBFCFD',
              '& .MuiTab-root': {
                minHeight: 48,
                transition: 'color 160ms ease',
              },
              '& .Mui-selected': {
                fontWeight: 700,
              },
            }}
          >
            {TABS.map((item) => (
              <Tab
                key={item.id}
                value={item.id}
                label={item.label}
                id={`project-tab-${item.id}`}
                aria-controls={`project-tabpanel-${item.id}`}
              />
            ))}
          </Tabs>

          <Box
            id={`project-tabpanel-${tab}`}
            role="tabpanel"
            aria-labelledby={`project-tab-${tab}`}
            sx={{ p: { xs: DASH.space2, md: DASH.space3 }, minHeight: 360 }}
          >
            <Fade in key={tab} timeout={200}>
              <Box>
                {tab === 'overview' && (
                  <TabPanel>
                    <Stack spacing={DASH.sectionGap}>
                      <ProjectOverviewPanel
                        model={model}
                        scheduleStatus={fullLatestQuery.data?.scheduleStatus}
                      />
                      <ProjectSection
                        title="Recent Weekly Reports"
                        subtitle="Son raporların premium kart görünümü"
                      >
                        <ProjectReportCards
                          history={detailQuery.data.lastFiveReports}
                          reports={reportsQuery.data?.content}
                          canCreateReport={canCreateReport}
                          projectId={model.projectId}
                          limit={3}
                        />
                      </ProjectSection>
                      <ProjectSection
                        title="Open Risks"
                        subtitle="Son rapordaki açık riskler"
                      >
                        <ProjectRisksPanel
                          risks={risksQuery.data?.content}
                          openRiskCount={model.openRisks}
                          openBlockerCount={model.openBlockers}
                          loading={risksQuery.isLoading}
                        />
                      </ProjectSection>
                      <ProjectSection
                        title="Work Items"
                        subtitle="Checklist görünümü"
                      >
                        <ProjectWorkItemsChecklist
                          items={workItemsQuery.data?.content}
                          loading={workItemsQuery.isLoading}
                        />
                      </ProjectSection>
                      <ProjectSection
                        title="Activity Timeline"
                        subtitle="Rapor, risk ve iş kalemi hareketleri"
                      >
                        <ProjectActivityTimeline events={timeline} />
                      </ProjectSection>
                    </Stack>
                  </TabPanel>
                )}

                {tab === 'reports' && (
                  <TabPanel>
                    <ProjectSection
                      title="Weekly Reports"
                      subtitle="Tüm geçmiş rapor kartları"
                    >
                      <ProjectReportCards
                        history={detailQuery.data.lastFiveReports}
                        reports={reportsQuery.data?.content}
                        canCreateReport={canCreateReport}
                        projectId={model.projectId}
                      />
                    </ProjectSection>
                  </TabPanel>
                )}

                {tab === 'risks' && (
                  <TabPanel>
                    <ProjectSection title="Risks" subtitle="Seviye dağılımı ve açık riskler">
                      <ProjectRisksPanel
                        risks={risksQuery.data?.content}
                        openRiskCount={model.openRisks}
                        openBlockerCount={model.openBlockers}
                        loading={risksQuery.isLoading}
                      />
                    </ProjectSection>
                  </TabPanel>
                )}

                {tab === 'workItems' && (
                  <TabPanel>
                    <ProjectSection title="Work Items" subtitle="Son rapor checklist’i">
                      <ProjectWorkItemsChecklist
                        items={workItemsQuery.data?.content}
                        loading={workItemsQuery.isLoading}
                      />
                    </ProjectSection>
                  </TabPanel>
                )}

                {tab === 'history' && (
                  <TabPanel>
                    <ProjectSection
                      title="History"
                      subtitle="Zaman sıralı proje aktivitesi"
                    >
                      <ProjectActivityTimeline events={timeline} />
                    </ProjectSection>
                    <Box mt={DASH.sectionGap}>
                      <Typography variant="caption" color="text.secondary">
                        Not: Aktivite mevcut rapor / risk / iş kalemi verilerinden türetilir.
                      </Typography>
                    </Box>
                  </TabPanel>
                )}
              </Box>
            </Fade>
          </Box>
        </Box>

        <ProjectQuickSidebar
          model={model}
          canCreateReport={canCreateReport}
          backTo={backTo}
        />
      </Box>
    </Box>
  )
}

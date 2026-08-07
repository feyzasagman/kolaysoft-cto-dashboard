import { Box, Fade, Stack, Tab, Tabs } from '@mui/material'
import { useEffect, useMemo, useState, type SyntheticEvent } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { LatestReportPanel } from '@/components/projects/LatestReportPanel'
import { ProjectDetailHeader } from '@/components/projects/ProjectDetailHeader'
import { ProjectInfoCard } from '@/components/projects/ProjectInfoCard'
import { ProjectProgressSummary } from '@/components/projects/ProjectProgressSummary'
import { ProjectRiskSummary } from '@/components/projects/ProjectRiskSummary'
import {
  ProjectDetailErrorState,
  ProjectDetailSkeleton,
} from '@/components/projects/ProjectDetailSkeleton'
import { ProjectSummaryCard } from '@/components/projects/ProjectSummaryCard'
import { ProjectWorkItemSummary } from '@/components/projects/ProjectWorkItemSummary'
import { ReportHistoryPanel } from '@/components/projects/ReportHistoryPanel'
import { useAuth } from '@/contexts/AuthContext'
import {
  useProjectDetail,
  useProjectReports,
  useRiskIssues,
  useWeeklyReport,
  useWorkItems,
} from '@/hooks/useApiQueries'
import { rememberProjectId } from '@/utils/projectCache'
import { mapProjectDetail } from '@/utils/projectDetailMapper'
import { getHttpStatus } from '@/utils/errorUtils'

type DetailTab =
  | 'overview'
  | 'timeline'
  | 'reports'
  | 'risks'
  | 'workItems'
  | 'history'

const TABS: Array<{ id: DetailTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'reports', label: 'Weekly Reports' },
  { id: 'risks', label: 'Risks' },
  { id: 'workItems', label: 'Work Items' },
  { id: 'history', label: 'History' },
]

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

  if (!validId) {
    return (
      <EmptyState
        title="Proje bulunamadı."
        description="Geçersiz proje kimliği."
        actionLabel="Dashboard’a Dön"
        onAction={() => navigate('/dashboard')}
      />
    )
  }

  const status = getHttpStatus(detailQuery.error)
  if (status === 403) {
    return <Navigate to="/unauthorized" replace />
  }
  if (status === 404) {
    return (
      <EmptyState
        title="Proje bulunamadı."
        description="Aradığınız proje mevcut değil veya silinmiş olabilir."
        actionLabel="Dashboard’a Dön"
        onAction={() => navigate(fromDashboard ? `/dashboard${dashboardQuery}` : '/projects')}
      />
    )
  }

  if (detailQuery.isLoading) {
    return <ProjectDetailSkeleton />
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <ProjectDetailErrorState
        onRetry={() => void detailQuery.refetch()}
        onBack={() => navigate(fromDashboard ? `/dashboard${dashboardQuery}` : '/projects')}
      />
    )
  }

  const model = mapProjectDetail(detailQuery.data)
  const isCto = hasAnyRole('CTO') && !hasAnyRole('ADMIN')
  const isAdmin = hasAnyRole('ADMIN')
  const isPm = hasAnyRole('PROJECT_MANAGER')
  const isOwnProject =
    user?.userId != null && detailQuery.data.managerId === user.userId
  const canCreateReport = isAdmin || (isPm && isOwnProject)

  const handleTabChange = (_: SyntheticEvent, value: DetailTab) => {
    setTab(value)
  }

  return (
    <Box>
      <ProjectDetailHeader
        model={model}
        fromDashboard={fromDashboard}
        dashboardQuery={dashboardQuery}
        canCreateReport={canCreateReport}
        canOpenLatestReport={Boolean(latestReportId)}
        latestReportId={latestReportId}
        isCto={isCto}
      />

      <ProjectSummaryCard model={model} />

      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1.5,
          bgcolor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Proje detay sekmeleri"
          sx={{
            px: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: '#FBFCFD',
          }}
        >
          {TABS.map((item) => (
            <Tab key={item.id} value={item.id} label={item.label} id={`project-tab-${item.id}`} />
          ))}
        </Tabs>

        <Box sx={{ p: { xs: 1.5, md: 2.5 }, minHeight: 280 }}>
          <Fade in key={tab} timeout={180}>
            <Box>
              {tab === 'overview' && (
                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: 'grid',
                      gap: 2,
                      gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' },
                    }}
                  >
                    <ProjectInfoCard model={model} />
                    <ProjectProgressSummary
                      model={model}
                      scheduleStatus={fullLatestQuery.data?.scheduleStatus}
                    />
                  </Box>
                  <LatestReportPanel
                    latest={detailQuery.data.latestReport}
                    fullReport={fullLatestQuery.data}
                    canCreateReport={canCreateReport}
                    projectId={model.projectId}
                    readOnly={isCto}
                  />
                </Stack>
              )}

              {tab === 'timeline' && (
                <ReportHistoryPanel
                  history={detailQuery.data.lastFiveReports}
                  reports={reportsQuery.data?.content}
                />
              )}

              {tab === 'reports' && (
                <Stack spacing={2}>
                  <LatestReportPanel
                    latest={detailQuery.data.latestReport}
                    fullReport={fullLatestQuery.data}
                    canCreateReport={canCreateReport}
                    projectId={model.projectId}
                    readOnly={isCto}
                  />
                  <ReportHistoryPanel
                    history={detailQuery.data.lastFiveReports}
                    reports={reportsQuery.data?.content}
                  />
                </Stack>
              )}

              {tab === 'risks' && (
                <ProjectRiskSummary
                  risks={risksQuery.data?.content}
                  openRiskCount={model.openRisks}
                  openBlockerCount={model.openBlockers}
                  loading={risksQuery.isLoading}
                />
              )}

              {tab === 'workItems' && (
                <ProjectWorkItemSummary
                  items={workItemsQuery.data?.content}
                  loading={workItemsQuery.isLoading}
                />
              )}

              {tab === 'history' && (
                <ReportHistoryPanel
                  history={detailQuery.data.lastFiveReports}
                  reports={reportsQuery.data?.content}
                />
              )}
            </Box>
          </Fade>
        </Box>
      </Box>
    </Box>
  )
}

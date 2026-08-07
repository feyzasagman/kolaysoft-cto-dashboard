import { Box, Stack } from '@mui/material'
import { LatestWeeklyReportCard } from '@/components/projects/LatestWeeklyReportCard'
import { ProjectInfoRail } from '@/components/projects/ProjectInfoRail'
import { ProjectProgressPanel } from '@/components/projects/ProjectProgressPanel'
import { ProjectReportTimeline } from '@/components/projects/ProjectReportTimeline'
import { ProjectRiskPanel } from '@/components/projects/ProjectRiskPanel'
import { ProjectWorkItemsPanel } from '@/components/projects/ProjectWorkItemsPanel'
import { DASH } from '@/theme/dashboardTokens'
import type { ProjectDetailViewModel } from '@/utils/projectDetailMapper'
import type {
  LatestReportSummary,
  ReportHistoryItem,
  RiskIssue,
  WeeklyReport,
  WorkItem,
} from '@/types/api'

interface ProjectOverviewTabProps {
  model: ProjectDetailViewModel
  latest: LatestReportSummary | null | undefined
  fullReport?: WeeklyReport | null
  scheduleStatus?: string | null
  risks: RiskIssue[] | null | undefined
  workItems: WorkItem[] | null | undefined
  history: ReportHistoryItem[] | null | undefined
  reports: WeeklyReport[] | null | undefined
  risksLoading?: boolean
  workLoading?: boolean
  canCreateReport?: boolean
}

export function ProjectOverviewTab({
  model,
  latest,
  fullReport,
  scheduleStatus,
  risks,
  workItems,
  history,
  reports,
  risksLoading,
  workLoading,
  canCreateReport,
}: ProjectOverviewTabProps) {
  return (
    <Stack spacing={DASH.space3}>
      <Box
        sx={{
          display: 'grid',
          gap: DASH.space3,
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 8fr) minmax(260px, 4fr)' },
          alignItems: 'start',
        }}
      >
        <Stack spacing={DASH.space3}>
          <ProjectProgressPanel model={model} scheduleStatus={scheduleStatus} />
          <LatestWeeklyReportCard
            latest={latest}
            fullReport={fullReport}
            canCreateReport={canCreateReport}
            projectId={model.projectId}
          />
          <ProjectRiskPanel
            risks={risks}
            openRiskCount={model.openRisks}
            loading={risksLoading}
            dense
          />
        </Stack>
        <ProjectInfoRail model={model} />
      </Box>

      <ProjectWorkItemsPanel items={workItems} loading={workLoading} dense />
      <ProjectReportTimeline
        history={history}
        reports={reports}
        limit={5}
        title="Rapor geçmişi önizleme"
      />
    </Stack>
  )
}

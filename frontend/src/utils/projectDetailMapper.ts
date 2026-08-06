import type {
  LatestReportSummary,
  ProjectDashboardDetail,
  ReportHistoryItem,
  RiskIssue,
  WeeklyReport,
  WorkItem,
} from '@/types/api'
import { clampPercent, safeNumber } from '@/utils/dashboardMapper'
import { formatShortDate, healthLabel, statusLabel } from '@/utils/labels'

export interface ProjectDetailViewModel {
  projectId: number
  name: string
  code: string
  customer: string
  description: string
  projectStatus: string
  projectStatusLabel: string
  health: string | null
  healthLabel: string
  managerName: string
  managerEmail: string
  startDateLabel: string
  targetEndDateLabel: string
  lastUpdateLabel: string
  hasCurrentWeekReport: boolean
  progressTarget: number
  progressActual: number
  progressDelta: number
  openRisks: number
  openBlockers: number
  reportHistoryCount: number
  scheduleHint: string | null
}

export function mapProjectDetail(detail: ProjectDashboardDetail): ProjectDetailViewModel {
  const target = clampPercent(detail.progressTarget)
  const actual = clampPercent(detail.progressActual)
  const latest = detail.latestReport

  return {
    projectId: detail.projectId,
    name: detail.name ?? '—',
    code: detail.code ?? '—',
    customer: '—', // Backend DTO’da customer yok
    description: detail.description?.trim() || '—',
    projectStatus: detail.projectStatus ?? '',
    projectStatusLabel: statusLabel(detail.projectStatus),
    health: detail.latestHealth,
    healthLabel: healthLabel(detail.latestHealth),
    managerName: detail.managerName ?? '—',
    managerEmail: detail.managerEmail ?? '—',
    startDateLabel: formatShortDate(detail.startDate),
    targetEndDateLabel: formatShortDate(detail.targetEndDate),
    lastUpdateLabel: formatShortDate(latest?.submittedAt ?? latest?.createdAt),
    hasCurrentWeekReport: Boolean(latest),
    progressTarget: target,
    progressActual: actual,
    progressDelta: actual - target,
    openRisks: safeNumber(detail.openRisks),
    openBlockers: safeNumber(detail.openBlockers),
    reportHistoryCount: safeNumber(detail.reportHistoryCount),
    scheduleHint: null,
  }
}

export function mapLatestReport(latest: LatestReportSummary | null | undefined) {
  if (!latest) return null
  return {
    reportId: latest.reportId,
    year: latest.year,
    weekNumber: latest.weekNumber,
    reportDateLabel: formatShortDate(latest.submittedAt ?? latest.createdAt),
    health: latest.overallHealth,
    healthLabel: healthLabel(latest.overallHealth),
    progressTarget: clampPercent(latest.progressTarget),
    progressActual: clampPercent(latest.progressActual),
    reportStatus: latest.reportStatus || '—',
    openRiskCount: safeNumber(latest.openRiskCount),
    openBlockerCount: safeNumber(latest.openBlockerCount),
    // completedWork / plannedWork / overallNote dashboard latest DTO’da yok
    completedWork: null as string | null,
    plannedWork: null as string | null,
    overallNote: null as string | null,
  }
}

/** Full WeeklyReport ile latest panel zenginleştirme. */
export function enrichLatestFromReport(
  base: ReturnType<typeof mapLatestReport>,
  report: WeeklyReport | null | undefined,
) {
  if (!base) return null
  if (!report) return base
  return {
    ...base,
    completedWork: report.completedWork,
    plannedWork: report.plannedWork,
    overallNote: report.overallNote,
    scheduleStatus: report.scheduleStatus,
    projectStatusText: report.projectStatus,
    reportDateLabel: formatShortDate(report.reportDate),
  }
}

export function mapHistoryWithIds(
  history: ReportHistoryItem[] | null | undefined,
  reports: WeeklyReport[] | null | undefined,
) {
  const byWeek = new Map(
    (reports ?? []).map((r) => [`${r.year}-${r.weekNumber}`, r.id] as const),
  )

  return [...(history ?? [])]
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.weekNumber - a.weekNumber
    })
    .slice(0, 5)
    .map((item) => ({
      year: item.year,
      weekNumber: item.weekNumber,
      health: item.health,
      healthLabel: healthLabel(item.health),
      progressTarget: clampPercent(item.progressTarget),
      progressActual: clampPercent(item.progressActual),
      dateLabel: formatShortDate(item.submittedAt),
      reportId: byWeek.get(`${item.year}-${item.weekNumber}`) ?? null,
    }))
}

export function mapActiveWorkItems(items: WorkItem[] | null | undefined) {
  return (items ?? [])
    .filter((item) => item.status !== 'DONE')
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      title: item.title,
      assignee: item.assignee ?? '—',
      status: item.status,
      plannedDateLabel: formatShortDate(item.plannedDate),
      completedDateLabel: formatShortDate(item.completedDate),
      note: item.note ?? '—',
      reportId: item.reportId,
    }))
}

export function mapRiskPreview(items: RiskIssue[] | null | undefined) {
  return (items ?? [])
    .filter((item) => item.status === 'OPEN' || item.status === 'IN_PROGRESS')
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      title: item.title,
      riskLevel: item.riskLevel,
      status: item.status,
      actionPlan: item.actionPlan ?? '—',
      reportId: item.reportId,
    }))
}

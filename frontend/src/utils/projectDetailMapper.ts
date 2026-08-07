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
  startDate: string | null
  startDateLabel: string
  targetEndDateLabel: string
  lastUpdateLabel: string
  lastUpdateRaw: string | null
  hasCurrentWeekReport: boolean
  progressTarget: number
  progressActual: number
  progressDelta: number
  openRisks: number
  openBlockers: number
  reportHistoryCount: number
  scheduleHint: string | null
  currentWeekLabel: string
  latestReportId: number | null
}

export type TimelineKind =
  | 'report'
  | 'risk'
  | 'task'
  | 'status'
  | 'manager'

export interface TimelineEvent {
  id: string
  kind: TimelineKind
  title: string
  meta: string
  dateRaw: string | null
  dateLabel: string
  tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
}

export function mapProjectDetail(detail: ProjectDashboardDetail): ProjectDetailViewModel {
  const target = clampPercent(detail.progressTarget)
  const actual = clampPercent(detail.progressActual)
  const latest = detail.latestReport
  const lastUpdateRaw = latest?.submittedAt ?? latest?.createdAt ?? null

  return {
    projectId: detail.projectId,
    name: detail.name ?? '—',
    code: detail.code ?? '—',
    customer: '—',
    description: detail.description?.trim() || '—',
    projectStatus: detail.projectStatus ?? '',
    projectStatusLabel: statusLabel(detail.projectStatus),
    health: detail.latestHealth,
    healthLabel: healthLabel(detail.latestHealth),
    managerName: detail.managerName ?? '—',
    managerEmail: detail.managerEmail ?? '—',
    startDate: detail.startDate,
    startDateLabel: formatShortDate(detail.startDate),
    targetEndDateLabel: formatShortDate(detail.targetEndDate),
    lastUpdateLabel: formatShortDate(lastUpdateRaw),
    lastUpdateRaw,
    hasCurrentWeekReport: Boolean(latest),
    progressTarget: target,
    progressActual: actual,
    progressDelta: actual - target,
    openRisks: safeNumber(detail.openRisks),
    openBlockers: safeNumber(detail.openBlockers),
    reportHistoryCount: safeNumber(detail.reportHistoryCount),
    scheduleHint: null,
    currentWeekLabel: latest
      ? `${latest.year} · Hafta ${latest.weekNumber}`
      : 'Hafta raporu yok',
    latestReportId: latest?.reportId ?? null,
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
    completedWork: null as string | null,
    plannedWork: null as string | null,
    overallNote: null as string | null,
  }
}

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
    .map((item) => ({
      year: item.year,
      weekNumber: item.weekNumber,
      health: item.health,
      healthLabel: healthLabel(item.health),
      progressTarget: clampPercent(item.progressTarget),
      progressActual: clampPercent(item.progressActual),
      dateLabel: formatShortDate(item.submittedAt),
      dateRaw: item.submittedAt,
      reportId: byWeek.get(`${item.year}-${item.weekNumber}`) ?? null,
      summary:
        item.health === 'RED'
          ? 'Kritik sağlık — dikkat gerekli'
          : item.health === 'YELLOW'
            ? 'Dikkat gerektiren sahalar var'
            : 'Haftalık durum güncellendi',
      status: 'SUBMITTED',
    }))
}

export function mapActiveWorkItems(items: WorkItem[] | null | undefined) {
  return (items ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    assignee: item.assignee ?? '—',
    status: item.status,
    plannedDateLabel: formatShortDate(item.plannedDate),
    completedDateLabel: formatShortDate(item.completedDate),
    note: item.note ?? '—',
    reportId: item.reportId,
    description: item.description ?? null,
  }))
}

export function mapRiskPreview(items: RiskIssue[] | null | undefined) {
  return (items ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    riskLevel: item.riskLevel,
    status: item.status,
    actionPlan: item.actionPlan ?? '—',
    impact: item.impact ?? '—',
    description: item.description ?? null,
    reportId: item.reportId,
  }))
}

export function countWorkByStatus(items: WorkItem[] | null | undefined) {
  const list = items ?? []
  return {
    total: list.length,
    done: list.filter((i) => i.status === 'DONE').length,
    active: list.filter((i) => i.status === 'IN_PROGRESS' || i.status === 'TODO').length,
    blocked: list.filter((i) => i.status === 'BLOCKED').length,
  }
}

export function countRisksByLevel(items: RiskIssue[] | null | undefined) {
  const list = items ?? []
  const open = list.filter((i) => i.status === 'OPEN' || i.status === 'IN_PROGRESS')
  const resolved = list.filter((i) => i.status === 'RESOLVED' || i.status === 'ACCEPTED')
  return {
    critical: open.filter((i) => i.riskLevel === 'CRITICAL').length,
    high: open.filter((i) => i.riskLevel === 'HIGH').length,
    medium: open.filter((i) => i.riskLevel === 'MEDIUM').length,
    low: open.filter((i) => i.riskLevel === 'LOW').length,
    openTotal: open.length,
    resolvedTotal: resolved.length,
  }
}

export function countOpenWorkItems(items: WorkItem[] | null | undefined) {
  const stats = countWorkByStatus(items)
  return stats.active + stats.blocked
}

/** Mevcut DTO’lardan türetilmiş aktivite zaman çizelgesi — yeni endpoint yok. */
export function buildActivityTimeline(input: {
  model: ProjectDetailViewModel
  history: ReportHistoryItem[] | null | undefined
  reports: WeeklyReport[] | null | undefined
  risks: RiskIssue[] | null | undefined
  workItems: WorkItem[] | null | undefined
}): TimelineEvent[] {
  const events: TimelineEvent[] = []

  mapHistoryWithIds(input.history, input.reports).forEach((row) => {
    events.push({
      id: `report-${row.year}-${row.weekNumber}`,
      kind: 'report',
      title: 'Report submitted',
      meta: `${row.year} / Hafta ${row.weekNumber} · ${row.healthLabel} · ${row.progressActual}%`,
      dateRaw: row.dateRaw,
      dateLabel: row.dateLabel,
      tone: row.health === 'RED' ? 'danger' : row.health === 'YELLOW' ? 'warning' : 'success',
    })
  })

  ;(input.risks ?? []).forEach((risk) => {
    events.push({
      id: `risk-${risk.id}`,
      kind: 'risk',
      title: 'Risk added',
      meta: `${risk.title} · ${risk.riskLevel} · ${risk.status}`,
      dateRaw: null,
      dateLabel: 'Son rapor',
      tone: risk.riskLevel === 'CRITICAL' || risk.riskLevel === 'HIGH' ? 'danger' : 'warning',
    })
  })

  ;(input.workItems ?? []).forEach((item) => {
    if (item.status === 'DONE') {
      events.push({
        id: `task-done-${item.id}`,
        kind: 'task',
        title: 'Task completed',
        meta: `${item.title}${item.assignee ? ` · ${item.assignee}` : ''}`,
        dateRaw: item.completedDate,
        dateLabel: formatShortDate(item.completedDate),
        tone: 'success',
      })
    } else if (item.status === 'IN_PROGRESS') {
      events.push({
        id: `task-wip-${item.id}`,
        kind: 'task',
        title: 'Task in progress',
        meta: `${item.title}${item.assignee ? ` · ${item.assignee}` : ''}`,
        dateRaw: item.plannedDate,
        dateLabel: formatShortDate(item.plannedDate),
        tone: 'info',
      })
    }
  })

  if (input.model.projectStatus) {
    events.push({
      id: 'status',
      kind: 'status',
      title: 'Status changed',
      meta: `Proje durumu: ${input.model.projectStatusLabel}`,
      dateRaw: input.model.startDate,
      dateLabel: input.model.startDateLabel,
      tone: 'neutral',
    })
  }

  if (input.model.managerName && input.model.managerName !== '—') {
    events.push({
      id: 'manager',
      kind: 'manager',
      title: 'Manager assigned',
      meta: input.model.managerName,
      dateRaw: input.model.startDate,
      dateLabel: input.model.startDateLabel,
      tone: 'info',
    })
  }

  return events
    .sort((a, b) => {
      const ta = a.dateRaw ? new Date(a.dateRaw).getTime() : 0
      const tb = b.dateRaw ? new Date(b.dateRaw).getTime() : 0
      if (ta !== tb) return tb - ta
      return a.title.localeCompare(b.title)
    })
    .slice(0, 12)
}

export function progressBarColor(health: string | null | undefined, behind: boolean): string {
  if (health === 'RED') return 'error.main'
  if (health === 'YELLOW' || behind) return 'warning.main'
  if (health === 'GREEN') return 'success.main'
  return 'primary.main'
}

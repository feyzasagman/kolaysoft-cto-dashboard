import type {
  ActivityLevel,
  ProjectActivityDay,
  ProjectActivityWeek,
  ProjectDashboardRow,
  ReportHistoryItem,
} from '@/types/api'

const MS_DAY = 24 * 60 * 60 * 1000

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

/** ISO week-year / week-number (UTC). */
export function getIsoWeek(date: Date): { year: number; week: number } {
  const d = startOfUtcDay(date)
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / MS_DAY + 1) / 7)
  return { year: d.getUTCFullYear(), week }
}

function mondayOfIsoWeek(year: number, week: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const day = jan4.getUTCDay() || 7
  const mondayWeek1 = new Date(jan4)
  mondayWeek1.setUTCDate(jan4.getUTCDate() - day + 1)
  const monday = new Date(mondayWeek1)
  monday.setUTCDate(mondayWeek1.getUTCDate() + (week - 1) * 7)
  return monday
}

/**
 * Seviye:
 * 0 yok | 1 sadece rapor | 2 rapor+iş | 3 rapor+iş+risk | 4 yoğun
 */
export function computeActivityLevel(input: {
  reportCount: number
  workItemCount: number
  riskCount: number
}): ActivityLevel {
  const hasReport = input.reportCount > 0
  const hasWork = input.workItemCount > 0
  const hasRisk = input.riskCount > 0
  if (!hasReport && !hasWork && !hasRisk) return 0
  if (hasReport && hasWork && hasRisk) {
    return input.workItemCount + input.riskCount >= 4 ? 4 : 3
  }
  if (hasReport && hasWork) return 2
  if (hasReport) return 1
  // Rapor yoksa mevcut list API'sinden güvenilir haftalık sinyal yok → 0
  return 0
}

function emptyWeek(year: number, weekNumber: number): ProjectActivityWeek {
  return {
    year,
    weekNumber,
    startDate: toDateKey(mondayOfIsoWeek(year, weekNumber)),
    hasReport: false,
    reportCount: 0,
    workItemCount: 0,
    riskCount: 0,
    activityCount: 0,
    level: 0,
  }
}

function lastNIsoWeeks(n: number): Array<{ year: number; week: number }> {
  const result: Array<{ year: number; week: number }> = []
  let { year, week } = getIsoWeek(new Date())
  for (let i = 0; i < n; i++) {
    result.push({ year, week })
    week -= 1
    if (week < 1) {
      year -= 1
      week = 52
    }
  }
  return result.reverse()
}

/**
 * Liste satırından son N haftalık şerit.
 * Yalnızca bilinen rapor haftalarına skor yazılır; diğer haftalar 0.
 * Sahte yoğunluk üretilmez.
 */
export function buildActivityStripFromProject(
  project: ProjectDashboardRow,
  weekCount = 12,
): ProjectActivityWeek[] {
  const weeks = lastNIsoWeeks(weekCount).map(({ year, week }) => emptyWeek(year, week))
  const current = getIsoWeek(new Date())

  const apply = (year: number, weekNumber: number, patch: Partial<ProjectActivityWeek>) => {
    const target = weeks.find((w) => w.year === year && w.weekNumber === weekNumber)
    if (!target) return
    Object.assign(target, patch)
    target.hasReport = target.reportCount > 0
    target.activityCount = target.reportCount + target.workItemCount + target.riskCount
    target.level = computeActivityLevel(target)
  }

  if (project.latestReportYear != null && project.latestReportWeek != null) {
    apply(project.latestReportYear, project.latestReportWeek, {
      reportCount: 1,
      workItemCount: project.openBlockerCount,
      riskCount: project.openRiskCount + project.criticalRiskCount,
    })
  }

  if (project.hasCurrentWeekReport) {
    const existing = weeks.find((w) => w.year === current.year && w.weekNumber === current.week)
    if (existing && existing.reportCount === 0) {
      apply(current.year, current.week, {
        reportCount: 1,
        workItemCount: 0,
        riskCount: 0,
      })
    } else if (existing) {
      apply(current.year, current.week, {
        reportCount: Math.max(1, existing.reportCount),
        workItemCount: existing.workItemCount,
        riskCount: existing.riskCount,
      })
    }
  }

  return weeks
}

export function hasStripActivity(weeks: ProjectActivityWeek[]): boolean {
  return weeks.some((w) => w.level > 0 || w.reportCount > 0)
}

/**
 * Detay sayfası: günlük grid (son weekCount hafta).
 * lastFiveReports tarihleri + güncel metrikler; sahte hücre doldurulmaz.
 */
export function buildDerivedActivityFromHistory(
  history: ReportHistoryItem[],
  project: Pick<
    ProjectDashboardRow,
    | 'openRiskCount'
    | 'criticalRiskCount'
    | 'openBlockerCount'
    | 'hasCurrentWeekReport'
    | 'latestReportDate'
    | 'latestReportYear'
    | 'latestReportWeek'
  >,
  weekCount = 26,
): ProjectActivityDay[] {
  const end = startOfUtcDay(new Date())
  const start = new Date(end.getTime() - (weekCount * 7 - 1) * MS_DAY)
  const startDow = start.getUTCDay()
  start.setUTCDate(start.getUTCDate() - startDow)

  const map = new Map<string, ProjectActivityDay>()
  for (let t = start.getTime(); t <= end.getTime(); t += MS_DAY) {
    const date = new Date(t)
    const iso = getIsoWeek(date)
    map.set(toDateKey(date), {
      date: toDateKey(date),
      weekNumber: iso.week,
      reportCount: 0,
      workItemCount: 0,
      riskCount: 0,
      activityCount: 0,
      level: 0,
    })
  }

  const mark = (
    dateKey: string,
    reportCount: number,
    workItemCount: number,
    riskCount: number,
  ) => {
    const current = map.get(dateKey)
    if (!current) return
    const next = {
      ...current,
      reportCount: Math.max(current.reportCount, reportCount),
      workItemCount: Math.max(current.workItemCount, workItemCount),
      riskCount: Math.max(current.riskCount, riskCount),
    }
    next.activityCount = next.reportCount + next.workItemCount + next.riskCount
    next.level = computeActivityLevel(next)
    map.set(dateKey, next)
  }

  for (const item of history) {
    if (!item.submittedAt) continue
    const key = item.submittedAt.slice(0, 10)
    const work = 0
    let risk = 0
    if (item.health === 'YELLOW') risk = 1
    if (item.health === 'RED') risk = 2
    mark(key, 1, work, risk)
  }

  if (project.latestReportDate) {
    mark(
      project.latestReportDate.slice(0, 10),
      1,
      project.openBlockerCount,
      project.openRiskCount + project.criticalRiskCount,
    )
  }

  if (project.hasCurrentWeekReport) {
    mark(toDateKey(end), 1, 0, 0)
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
}

export function hasCalendarActivity(days: ProjectActivityDay[]): boolean {
  return days.some((d) => d.level > 0 || d.reportCount > 0)
}

export const ACTIVITY_DATA_NOTE =
  'Aktivite, mevcut rapor tarihleri ve ilişkili risk/blocker metriklerinden türetilmiştir. Özel aktivite endpointi yoktur.'

export const ACTIVITY_EMPTY_MESSAGE = 'Aktivite verisi bulunmuyor.'

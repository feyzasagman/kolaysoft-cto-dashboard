import type {
  CriticalRisk,
  DashboardSummary,
  HealthDistribution,
  ProjectDashboardRow,
  RoleType,
} from '@/types/api'
import type {
  DashboardHeaderModel,
  DashboardKpiItem,
  HealthSlice,
  PortfolioRow,
} from '@/utils/dashboardTypes'
import { formatShortDate, healthLabel, statusLabel } from '@/utils/labels'

const KPI_TONES = {
  total: '#24292F',
  active: '#1A7F37',
  completed: '#0969DA',
  openRisk: '#9A6700',
  critical: '#CF222E',
  missing: '#656D76',
} as const

const HEALTH_COLORS: Record<HealthSlice['key'], string> = {
  GREEN: '#1A7F37',
  YELLOW: '#9A6700',
  RED: '#CF222E',
  NO_REPORT: '#656D76',
}

export function safeNumber(value: number | null | undefined): number {
  if (value == null || Number.isNaN(Number(value))) return 0
  return Number(value)
}

export function clampPercent(value: number | null | undefined): number {
  const n = safeNumber(value)
  return Math.min(100, Math.max(0, n))
}

export function mapDashboardHeader(role: RoleType | undefined, fullName?: string | null): DashboardHeaderModel {
  const titles: Record<RoleType, string> = {
    CTO: 'CTO Genel Bakış',
    ADMIN: 'Yönetim Genel Bakış',
    PROJECT_MANAGER: 'Proje Genel Bakış',
  }

  return {
    title: role ? titles[role] : 'Dashboard Genel Bakış',
    description: 'Projelerin sağlık, ilerleme, risk ve haftalık rapor durumlarının güncel özeti.',
    welcome: fullName ? `Hoş geldiniz, ${fullName}` : null,
  }
}

/** Backend DashboardSummaryResponse → UI KPI listesi (yalnızca gerçek alanlar). */
export function mapSummaryToKpis(summary: DashboardSummary | null | undefined): DashboardKpiItem[] {
  if (!summary) return []

  return [
    {
      key: 'totalProjects',
      label: 'Toplam Proje',
      value: safeNumber(summary.totalProjects),
      description: 'Sistemde kayıtlı tüm projeler',
      tone: KPI_TONES.total,
    },
    {
      key: 'activeProjects',
      label: 'Aktif Proje',
      value: safeNumber(summary.activeProjects),
      description: 'Devam eden projeler',
      tone: KPI_TONES.active,
    },
    {
      key: 'completedProjects',
      label: 'Tamamlanan Proje',
      value: safeNumber(summary.completedProjects),
      description: 'Tamamlanmış projeler',
      tone: KPI_TONES.completed,
    },
    {
      key: 'openRisks',
      label: 'Açık Risk',
      value: safeNumber(summary.openRisks),
      description: 'Çözülmemiş risk ve engeller',
      tone: KPI_TONES.openRisk,
    },
    {
      key: 'criticalRisks',
      label: 'Kritik Risk',
      value: safeNumber(summary.criticalRisks),
      description: 'Yüksek öncelikli açık riskler',
      tone: KPI_TONES.critical,
    },
    {
      key: 'projectsWithoutCurrentWeekReport',
      label: 'Eksik Haftalık Rapor',
      value: safeNumber(summary.projectsWithoutCurrentWeekReport),
      description: 'Mevcut hafta raporu bulunmayan projeler',
      tone: KPI_TONES.missing,
    },
  ]
}

export function mapHealthDistribution(
  data: HealthDistribution | null | undefined,
): { total: number; slices: HealthSlice[] } {
  const green = safeNumber(data?.green)
  const yellow = safeNumber(data?.yellow)
  const red = safeNumber(data?.red)
  const noReport = safeNumber(data?.noReport)
  const total = green + yellow + red + noReport

  const toPercent = (value: number) => (total === 0 ? 0 : Math.round((value / total) * 100))

  const slices: HealthSlice[] = [
    { key: 'GREEN', label: healthLabel('GREEN'), value: green, percent: toPercent(green), color: HEALTH_COLORS.GREEN },
    { key: 'YELLOW', label: healthLabel('YELLOW'), value: yellow, percent: toPercent(yellow), color: HEALTH_COLORS.YELLOW },
    { key: 'RED', label: healthLabel('RED'), value: red, percent: toPercent(red), color: HEALTH_COLORS.RED },
    {
      key: 'NO_REPORT',
      label: healthLabel('NO_REPORT'),
      value: noReport,
      percent: toPercent(noReport),
      color: HEALTH_COLORS.NO_REPORT,
    },
  ]

  return { total, slices }
}

export function mapPortfolioRows(rows: ProjectDashboardRow[] | null | undefined): PortfolioRow[] {
  return (rows ?? []).map((row) => ({
    id: row.projectId,
    projectId: row.projectId,
    name: row.name ?? '—',
    code: row.code ?? '—',
    managerName: row.managerName ?? '—',
    projectStatus: row.projectStatus ?? '',
    latestHealth: row.latestHealth ?? null,
    progressTarget: clampPercent(row.progressTarget),
    progressActual: clampPercent(row.progressActual),
    openRiskCount: safeNumber(row.openRiskCount),
    criticalRiskCount: safeNumber(row.criticalRiskCount),
    hasCurrentWeekReport: Boolean(row.hasCurrentWeekReport),
    latestReportDate: row.latestReportDate ?? null,
    latestReportLabel: formatShortDate(row.latestReportDate),
  }))
}

export function mapCriticalRiskPreview(risks: CriticalRisk[] | null | undefined) {
  return (risks ?? []).map((risk) => ({
    id: risk.riskId,
    projectId: risk.projectId,
    projectCode: risk.projectCode ?? '—',
    projectName: risk.projectName ?? '—',
    title: risk.title ?? '—',
    impactLevel: risk.impactLevel ?? '—',
    status: risk.status ?? '—',
    createdAtLabel: formatShortDate(risk.createdAt),
  }))
}

export function portfolioStatusLabel(status: string) {
  return statusLabel(status)
}

export function portfolioHealthLabel(health: string | null) {
  return healthLabel(health)
}

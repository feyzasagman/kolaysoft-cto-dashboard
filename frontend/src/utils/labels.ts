import type { ProjectStatus, ReportHealth, RiskLevel, RiskStatus, WorkItemStatus } from '@/types/api'

const STATUS_LABELS: Record<string, string> = {
  PLANNED: 'Planlandı',
  ACTIVE: 'Aktif',
  ON_HOLD: 'Beklemede',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
}

const HEALTH_LABELS: Record<string, string> = {
  GREEN: 'Sağlıklı',
  YELLOW: 'Dikkat',
  RED: 'Kritik',
  NO_REPORT: 'Rapor Yok',
}

const WORK_ITEM_STATUS_LABELS: Record<WorkItemStatus, string> = {
  TODO: 'Yapılacak',
  IN_PROGRESS: 'Devam Ediyor',
  DONE: 'Tamamlandı',
  BLOCKED: 'Engelli',
}

const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  LOW: 'Düşük',
  MEDIUM: 'Orta',
  HIGH: 'Yüksek',
  CRITICAL: 'Kritik',
}

const RISK_STATUS_LABELS: Record<RiskStatus, string> = {
  OPEN: 'Açık',
  IN_PROGRESS: 'Devam Ediyor',
  RESOLVED: 'Çözüldü',
  ACCEPTED: 'Kabul Edildi',
}

export function statusLabel(status: string | null | undefined): string {
  if (!status) return '—'
  return STATUS_LABELS[status] ?? status
}

export function healthLabel(health: string | null | undefined): string {
  if (!health) return HEALTH_LABELS.NO_REPORT
  return HEALTH_LABELS[health] ?? health
}

export function isProjectStatus(value: string): value is ProjectStatus {
  return ['PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'].includes(value)
}

export function isReportHealth(value: string): value is ReportHealth {
  return ['GREEN', 'YELLOW', 'RED'].includes(value)
}

export function formatShortDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function workItemStatusLabel(status: string | null | undefined): string {
  if (!status) return '—'
  return WORK_ITEM_STATUS_LABELS[status as WorkItemStatus] ?? status
}

export function riskLevelLabel(level: string | null | undefined): string {
  if (!level) return '—'
  return RISK_LEVEL_LABELS[level as RiskLevel] ?? level
}

export function riskStatusLabel(status: string | null | undefined): string {
  if (!status) return '—'
  return RISK_STATUS_LABELS[status as RiskStatus] ?? status
}

/** ISO hafta numarası (1–53). */
export function currentIsoWeek(date = new Date()): { year: number; week: number; reportDate: string } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return { year: d.getUTCFullYear(), week, reportDate: `${yyyy}-${mm}-${dd}` }
}

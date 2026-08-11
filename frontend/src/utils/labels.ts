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

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Yönetici',
  CTO: 'CTO',
  PROJECT_MANAGER: 'Proje Yöneticisi',
  MEMBER: 'Üye',
}

export function roleLabel(role: string | null | undefined): string {
  if (!role) return '—'
  return ROLE_LABELS[role] ?? role
}

export const PROJECT_STATUS_OPTIONS: Array<{ value: ProjectStatus; label: string }> = [
  { value: 'PLANNED', label: STATUS_LABELS.PLANNED },
  { value: 'ACTIVE', label: STATUS_LABELS.ACTIVE },
  { value: 'ON_HOLD', label: STATUS_LABELS.ON_HOLD },
  { value: 'COMPLETED', label: STATUS_LABELS.COMPLETED },
  { value: 'CANCELLED', label: STATUS_LABELS.CANCELLED },
]

export const ROLE_OPTIONS: Array<{ value: 'ADMIN' | 'CTO' | 'PROJECT_MANAGER'; label: string }> = [
  { value: 'PROJECT_MANAGER', label: ROLE_LABELS.PROJECT_MANAGER },
  { value: 'CTO', label: ROLE_LABELS.CTO },
  { value: 'ADMIN', label: ROLE_LABELS.ADMIN },
]

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

const SCHEDULE_LABELS: Record<string, string> = {
  ON_TRACK: 'Takvimde',
  AT_RISK: 'Risk altında',
  DELAYED: 'Gecikmiş',
  AHEAD: 'İleride',
}

export function scheduleStatusLabel(status: string | null | undefined): string {
  if (!status) return '—'
  return SCHEDULE_LABELS[status.trim().toUpperCase()] ?? status
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

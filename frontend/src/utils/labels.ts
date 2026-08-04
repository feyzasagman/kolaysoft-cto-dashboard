import type { ProjectStatus, ReportHealth } from '@/types/api'

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

import { Chip } from '@mui/material'
import {
  healthLabel,
  riskLevelLabel,
  riskStatusLabel,
  scheduleStatusLabel,
  statusLabel,
  workItemStatusLabel,
} from '@/utils/labels'

type BadgeTone = { bgcolor: string; color: string; borderColor: string }

/** Minimal enterprise badge — pastel + border + readable text. */
const badgeBaseSx = {
  height: 22,
  borderRadius: '999px',
  fontWeight: 650,
  fontSize: '0.6875rem',
  letterSpacing: '0.01em',
  border: '1px solid',
  '& .MuiChip-label': { px: 1 },
} as const

const healthSx: Record<string, BadgeTone> = {
  GREEN: { bgcolor: '#DAFBE1', color: '#116329', borderColor: '#B4EFC4' },
  YELLOW: { bgcolor: '#FFF8C5', color: '#7D4E00', borderColor: '#F0E09A' },
  RED: { bgcolor: '#FFEBE9', color: '#A40E26', borderColor: '#FFC1C0' },
  NO_REPORT: { bgcolor: '#F6F8FA', color: '#656D76', borderColor: '#D0D7DE' },
}

const statusSx: Record<string, BadgeTone> = {
  PLANNED: { bgcolor: '#DDF4FF', color: '#0550AE', borderColor: '#B6E3FF' },
  ACTIVE: { bgcolor: '#DAFBE1', color: '#116329', borderColor: '#B4EFC4' },
  ON_HOLD: { bgcolor: '#FFF8C5', color: '#7D4E00', borderColor: '#F0E09A' },
  COMPLETED: { bgcolor: '#F6F8FA', color: '#1F2328', borderColor: '#D0D7DE' },
  CANCELLED: { bgcolor: '#FFEBE9', color: '#A40E26', borderColor: '#FFC1C0' },
}

const workItemSx: Record<string, BadgeTone> = {
  TODO: { bgcolor: '#F6F8FA', color: '#656D76', borderColor: '#D0D7DE' },
  IN_PROGRESS: { bgcolor: '#DDF4FF', color: '#0550AE', borderColor: '#B6E3FF' },
  DONE: { bgcolor: '#DAFBE1', color: '#116329', borderColor: '#B4EFC4' },
  BLOCKED: { bgcolor: '#FFEBE9', color: '#A40E26', borderColor: '#FFC1C0' },
}

const riskLevelSx: Record<string, BadgeTone> = {
  LOW: { bgcolor: '#DAFBE1', color: '#116329', borderColor: '#B4EFC4' },
  MEDIUM: { bgcolor: '#FFF8C5', color: '#7D4E00', borderColor: '#F0E09A' },
  HIGH: { bgcolor: '#FFF1E5', color: '#9A6700', borderColor: '#FFD8B5' },
  CRITICAL: { bgcolor: '#FFEBE9', color: '#A40E26', borderColor: '#FFC1C0' },
}

/** Ortak enterprise badge — Status / Health / Report ve diğerleri. */
export function EnterpriseBadge({
  label,
  tone,
  ariaLabel,
}: {
  label: string
  tone: BadgeTone
  ariaLabel: string
}) {
  return (
    <Chip
      size="small"
      variant="outlined"
      label={label}
      aria-label={ariaLabel}
      sx={{ ...badgeBaseSx, ...tone }}
    />
  )
}

export type { BadgeTone }

export function HealthBadge({ health }: { health: string | null | undefined }) {
  const key = health && healthSx[health] ? health : 'NO_REPORT'
  return (
    <EnterpriseBadge
      label={healthLabel(health)}
      tone={healthSx[key]}
      ariaLabel={`Sağlık: ${healthLabel(health)}`}
    />
  )
}

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const key = status && statusSx[status] ? status : 'PLANNED'
  return (
    <EnterpriseBadge
      label={statusLabel(status)}
      tone={statusSx[key] ?? statusSx.PLANNED}
      ariaLabel={`Durum: ${statusLabel(status)}`}
    />
  )
}

export function WorkItemStatusBadge({ status }: { status: string | null | undefined }) {
  return (
    <EnterpriseBadge
      label={workItemStatusLabel(status)}
      tone={(status && workItemSx[status]) || workItemSx.TODO}
      ariaLabel={`İş kalemi durumu: ${workItemStatusLabel(status)}`}
    />
  )
}

export function RiskLevelBadge({ level }: { level: string | null | undefined }) {
  return (
    <EnterpriseBadge
      label={riskLevelLabel(level)}
      tone={(level && riskLevelSx[level]) || riskLevelSx.MEDIUM}
      ariaLabel={`Risk seviyesi: ${riskLevelLabel(level)}`}
    />
  )
}

export function RiskStatusBadge({ status }: { status: string | null | undefined }) {
  return (
    <EnterpriseBadge
      label={riskStatusLabel(status)}
      tone={{ bgcolor: '#F6F8FA', color: '#656D76', borderColor: '#D0D7DE' }}
      ariaLabel={`Risk durumu: ${riskStatusLabel(status)}`}
    />
  )
}

/** Project status alias — Day 13 naming. */
export const ProjectStatusBadge = StatusBadge

const scheduleSx: Record<string, BadgeTone> = {
  ON_TRACK: { bgcolor: '#DAFBE1', color: '#116329', borderColor: '#B4EFC4' },
  AT_RISK: { bgcolor: '#FFF8C5', color: '#7D4E00', borderColor: '#F0E09A' },
  DELAYED: { bgcolor: '#FFEBE9', color: '#A40E26', borderColor: '#FFC1C0' },
  DELAY: { bgcolor: '#FFEBE9', color: '#A40E26', borderColor: '#FFC1C0' },
  AHEAD: { bgcolor: '#DDF4FF', color: '#0550AE', borderColor: '#B6E3FF' },
}

export function ScheduleStatusBadge({ status }: { status: string | null | undefined }) {
  const key = (status ?? '').trim().toUpperCase()
  const tone = scheduleSx[key] ?? { bgcolor: '#F6F8FA', color: '#656D76', borderColor: '#D0D7DE' }
  return (
    <EnterpriseBadge
      label={scheduleStatusLabel(status)}
      tone={tone}
      ariaLabel={`Takvim durumu: ${scheduleStatusLabel(status)}`}
    />
  )
}

export function ReportAvailabilityBadge({ available }: { available: boolean }) {
  const tone = available
    ? { bgcolor: '#DAFBE1', color: '#116329', borderColor: '#B4EFC4' }
    : { bgcolor: '#FFF8C5', color: '#7D4E00', borderColor: '#F0E09A' }
  const label = available ? 'Rapor var' : 'Rapor eksik'
  return (
    <EnterpriseBadge
      label={label}
      tone={tone}
      ariaLabel={`Mevcut hafta raporu: ${label}`}
    />
  )
}

const roleSx: Record<string, BadgeTone> = {
  ADMIN: { bgcolor: '#DDF4FF', color: '#0550AE', borderColor: '#B6E3FF' },
  CTO: { bgcolor: '#DAFBE1', color: '#116329', borderColor: '#B4EFC4' },
  PROJECT_MANAGER: { bgcolor: '#FFF8C5', color: '#7D4E00', borderColor: '#F0E09A' },
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  CTO: 'CTO',
  PROJECT_MANAGER: 'Proje Yöneticisi',
}

export function RoleBadge({ role }: { role: string | null | undefined }) {
  const key = role ?? ''
  const label = ROLE_LABELS[key] ?? role ?? '—'
  return (
    <EnterpriseBadge
      label={label}
      tone={roleSx[key] ?? { bgcolor: '#F6F8FA', color: '#656D76', borderColor: '#D0D7DE' }}
      ariaLabel={`Rol: ${label}`}
    />
  )
}

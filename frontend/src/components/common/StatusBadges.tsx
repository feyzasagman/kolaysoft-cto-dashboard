import { Chip } from '@mui/material'
import {
  healthLabel,
  riskLevelLabel,
  riskStatusLabel,
  statusLabel,
  workItemStatusLabel,
} from '@/utils/labels'

const healthSx: Record<string, { bgcolor: string; color: string; borderColor: string }> = {
  GREEN: { bgcolor: '#DAFBE1', color: '#116329', borderColor: '#4AC26B' },
  YELLOW: { bgcolor: '#FFF8C5', color: '#7D4E00', borderColor: '#D4A72C' },
  RED: { bgcolor: '#FFEBE9', color: '#A40E26', borderColor: '#FF8182' },
  NO_REPORT: { bgcolor: '#F6F8FA', color: '#656D76', borderColor: '#D0D7DE' },
}

const statusSx: Record<string, { bgcolor: string; color: string; borderColor: string }> = {
  PLANNED: { bgcolor: '#DDF4FF', color: '#0550AE', borderColor: '#54AEFF' },
  ACTIVE: { bgcolor: '#DAFBE1', color: '#116329', borderColor: '#4AC26B' },
  ON_HOLD: { bgcolor: '#FFF8C5', color: '#7D4E00', borderColor: '#D4A72C' },
  COMPLETED: { bgcolor: '#F6F8FA', color: '#1F2328', borderColor: '#D0D7DE' },
  CANCELLED: { bgcolor: '#FFEBE9', color: '#A40E26', borderColor: '#FF8182' },
}

export function HealthBadge({ health }: { health: string | null | undefined }) {
  const key = health && healthSx[health] ? health : 'NO_REPORT'
  const styles = healthSx[key]
  return (
    <Chip
      size="small"
      variant="outlined"
      label={healthLabel(health)}
      aria-label={`Sağlık: ${healthLabel(health)}`}
      sx={{ ...styles, fontWeight: 600 }}
    />
  )
}

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const key = status && statusSx[status] ? status : 'PLANNED'
  const styles = statusSx[key] ?? statusSx.PLANNED
  return (
    <Chip
      size="small"
      variant="outlined"
      label={statusLabel(status)}
      aria-label={`Durum: ${statusLabel(status)}`}
      sx={{ ...styles, fontWeight: 600 }}
    />
  )
}

const workItemSx: Record<string, { bgcolor: string; color: string; borderColor: string }> = {
  TODO: { bgcolor: '#F6F8FA', color: '#656D76', borderColor: '#D0D7DE' },
  IN_PROGRESS: { bgcolor: '#DDF4FF', color: '#0550AE', borderColor: '#54AEFF' },
  DONE: { bgcolor: '#DAFBE1', color: '#116329', borderColor: '#4AC26B' },
  BLOCKED: { bgcolor: '#FFEBE9', color: '#A40E26', borderColor: '#FF8182' },
}

const riskLevelSx: Record<string, { bgcolor: string; color: string; borderColor: string }> = {
  LOW: { bgcolor: '#DAFBE1', color: '#116329', borderColor: '#4AC26B' },
  MEDIUM: { bgcolor: '#FFF8C5', color: '#7D4E00', borderColor: '#D4A72C' },
  HIGH: { bgcolor: '#FFF1E5', color: '#9A6700', borderColor: '#FB8F44' },
  CRITICAL: { bgcolor: '#FFEBE9', color: '#A40E26', borderColor: '#FF8182' },
}

export function WorkItemStatusBadge({ status }: { status: string | null | undefined }) {
  const styles = (status && workItemSx[status]) || workItemSx.TODO
  return (
    <Chip
      size="small"
      variant="outlined"
      label={workItemStatusLabel(status)}
      aria-label={`İş kalemi durumu: ${workItemStatusLabel(status)}`}
      sx={{ ...styles, fontWeight: 600 }}
    />
  )
}

export function RiskLevelBadge({ level }: { level: string | null | undefined }) {
  const styles = (level && riskLevelSx[level]) || riskLevelSx.MEDIUM
  return (
    <Chip
      size="small"
      variant="outlined"
      label={riskLevelLabel(level)}
      aria-label={`Risk seviyesi: ${riskLevelLabel(level)}`}
      sx={{ ...styles, fontWeight: 600 }}
    />
  )
}

export function RiskStatusBadge({ status }: { status: string | null | undefined }) {
  return (
    <Chip
      size="small"
      variant="outlined"
      label={riskStatusLabel(status)}
      aria-label={`Risk durumu: ${riskStatusLabel(status)}`}
      sx={{ fontWeight: 600 }}
    />
  )
}

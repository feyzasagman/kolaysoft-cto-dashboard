import { Avatar, Tooltip } from '@mui/material'
import { memo, useMemo } from 'react'

const PALETTE = ['#0969DA', '#1A7F37', '#8250DF', '#BF3989', '#CF222E', '#9A6700', '#0550AE']

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function toneFor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) hash = (hash + name.charCodeAt(i) * (i + 1)) % PALETTE.length
  return PALETTE[hash]
}

interface UserAvatarProps {
  name?: string | null
  size?: number
  showTooltip?: boolean
}

export const UserAvatar = memo(function UserAvatar({
  name,
  size = 28,
  showTooltip = true,
}: UserAvatarProps) {
  const label = name?.trim() || '—'
  const avatar = useMemo(
    () => (
      <Avatar
        sx={{
          width: size,
          height: size,
          fontSize: size * 0.38,
          fontWeight: 700,
          bgcolor: label === '—' ? '#8C959F' : toneFor(label),
        }}
        aria-label={label === '—' ? 'Yönetici yok' : label}
      >
        {initials(label)}
      </Avatar>
    ),
    [label, size],
  )

  if (!showTooltip || label === '—') return avatar
  return (
    <Tooltip title={label} describeChild>
      <span style={{ display: 'inline-flex' }}>{avatar}</span>
    </Tooltip>
  )
})

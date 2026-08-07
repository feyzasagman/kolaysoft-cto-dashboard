/** Kısa göreli zaman — "3 dk önce", "2 sa önce". */
export function formatRelativeTime(
  value: string | Date | null | undefined,
  now: Date = new Date(),
): string {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '—'

  const diffMs = now.getTime() - date.getTime()
  const abs = Math.abs(diffMs)
  const minutes = Math.floor(abs / 60_000)
  const hours = Math.floor(abs / 3_600_000)
  const days = Math.floor(abs / 86_400_000)

  if (minutes < 1) return 'az önce'
  if (minutes < 60) return `${minutes} dk önce`
  if (hours < 24) return `${hours} sa önce`
  if (days < 7) return `${days} gün önce`

  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

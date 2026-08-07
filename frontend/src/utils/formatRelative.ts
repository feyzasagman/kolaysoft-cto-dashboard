/** Kısa göreli zaman — varsayılan TR; dashboard header için EN. */
export function formatRelativeTime(
  value: string | Date | null | undefined,
  now: Date = new Date(),
  locale: 'tr' | 'en' = 'tr',
): string {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '—'

  const diffMs = now.getTime() - date.getTime()
  const abs = Math.abs(diffMs)
  const minutes = Math.floor(abs / 60_000)
  const hours = Math.floor(abs / 3_600_000)
  const days = Math.floor(abs / 86_400_000)

  if (locale === 'en') {
    if (minutes < 1) return 'just now'
    if (minutes === 1) return '1 minute ago'
    if (minutes < 60) return `${minutes} minutes ago`
    if (hours === 1) return '1 hour ago'
    if (hours < 24) return `${hours} hours ago`
    if (days === 1) return '1 day ago'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

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

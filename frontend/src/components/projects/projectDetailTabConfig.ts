export type ProjectDetailTabId =
  | 'overview'
  | 'reports'
  | 'risks'
  | 'workItems'
  | 'history'

export const PROJECT_DETAIL_TABS: Array<{ id: ProjectDetailTabId; label: string }> = [
  { id: 'overview', label: 'Genel Bakış' },
  { id: 'reports', label: 'Raporlar' },
  { id: 'risks', label: 'Riskler' },
  { id: 'workItems', label: 'İş Kalemleri' },
  { id: 'history', label: 'Geçmiş' },
]

export function isProjectDetailTab(value: string | null): value is ProjectDetailTabId {
  return PROJECT_DETAIL_TABS.some((t) => t.id === value)
}

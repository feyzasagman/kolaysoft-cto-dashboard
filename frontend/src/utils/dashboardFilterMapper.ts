import type { ProjectStatus, ReportHealth, RiskLevel } from '@/types/api'

/** URL / UI dashboard filtre state — yalnızca backend’in desteklediği alanlar. */
export interface DashboardFilterState {
  search: string
  projectStatus: ProjectStatus | ''
  health: ReportHealth | ''
  managerId: string
  hasCurrentWeekReport: '' | 'true' | 'false'
  riskLevel: RiskLevel | ''
  page: number
  size: number
  sort: string
}

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilterState = {
  search: '',
  projectStatus: '',
  health: '',
  managerId: '',
  hasCurrentWeekReport: '',
  riskLevel: '',
  page: 0,
  size: 20,
  sort: 'name,asc',
}

/** Backend PROJECT_SORT_FIELDS: name, code, status, createdAt, id */
export const DASHBOARD_SORT_OPTIONS = [
  { value: 'name,asc', label: 'Proje adı (A→Z)' },
  { value: 'name,desc', label: 'Proje adı (Z→A)' },
  { value: 'status,asc', label: 'Durum (A→Z)' },
  { value: 'status,desc', label: 'Durum (Z→A)' },
  { value: 'code,asc', label: 'Kod (A→Z)' },
  { value: 'createdAt,desc', label: 'Oluşturma (yeni)' },
  { value: 'id,desc', label: 'ID (yeni)' },
] as const

export function parseDashboardFilters(params: URLSearchParams): DashboardFilterState {
  const sizeRaw = Number(params.get('size') || DEFAULT_DASHBOARD_FILTERS.size)
  const size = [10, 20, 50].includes(sizeRaw) ? sizeRaw : 20
  const pageRaw = Number(params.get('page') || 0)
  const page = Number.isFinite(pageRaw) && pageRaw >= 0 ? pageRaw : 0
  const sort = params.get('sort') || DEFAULT_DASHBOARD_FILTERS.sort
  const allowedSort = DASHBOARD_SORT_OPTIONS.some((o) => o.value === sort)
    ? sort
    : DEFAULT_DASHBOARD_FILTERS.sort

  const projectStatus = (params.get('projectStatus') || '') as ProjectStatus | ''
  const health = (params.get('health') || '') as ReportHealth | ''
  const hasCurrentWeekReport = (params.get('hasCurrentWeekReport') || '') as '' | 'true' | 'false'
  const riskLevel = (params.get('riskLevel') || '') as RiskLevel | ''

  return {
    search: params.get('search') || '',
    projectStatus: ['PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'].includes(projectStatus)
      ? projectStatus
      : '',
    health: ['GREEN', 'YELLOW', 'RED'].includes(health) ? health : '',
    managerId: params.get('managerId') || '',
    hasCurrentWeekReport: ['true', 'false'].includes(hasCurrentWeekReport)
      ? hasCurrentWeekReport
      : '',
    riskLevel: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(riskLevel) ? riskLevel : '',
    page,
    size,
    sort: allowedSort,
  }
}

/** Boş string alanları URL’e yazılmaz. */
export function toSearchParams(filters: DashboardFilterState): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.search.trim()) params.set('search', filters.search.trim())
  if (filters.projectStatus) params.set('projectStatus', filters.projectStatus)
  if (filters.health) params.set('health', filters.health)
  if (filters.managerId) params.set('managerId', filters.managerId)
  if (filters.hasCurrentWeekReport) params.set('hasCurrentWeekReport', filters.hasCurrentWeekReport)
  if (filters.riskLevel) params.set('riskLevel', filters.riskLevel)
  if (filters.page > 0) params.set('page', String(filters.page))
  if (filters.size !== 20) params.set('size', String(filters.size))
  if (filters.sort !== 'name,asc') params.set('sort', filters.sort)
  return params
}

export function toApiProjectParams(filters: DashboardFilterState) {
  return {
    page: filters.page,
    size: filters.size,
    sort: filters.sort,
    search: filters.search.trim() || undefined,
    projectStatus: filters.projectStatus || undefined,
    health: filters.health || undefined,
    managerId: filters.managerId ? Number(filters.managerId) : undefined,
    riskLevel: filters.riskLevel || undefined,
    hasCurrentWeekReport:
      filters.hasCurrentWeekReport === ''
        ? undefined
        : filters.hasCurrentWeekReport === 'true',
  }
}

export function hasActiveFilters(filters: DashboardFilterState): boolean {
  return Boolean(
    filters.search.trim() ||
      filters.projectStatus ||
      filters.health ||
      filters.managerId ||
      filters.hasCurrentWeekReport ||
      filters.riskLevel,
  )
}

/** Detay sayfasından geri dönüş için query string. */
export function dashboardReturnQuery(filters: DashboardFilterState): string {
  const q = toSearchParams(filters).toString()
  return q ? `?${q}` : ''
}

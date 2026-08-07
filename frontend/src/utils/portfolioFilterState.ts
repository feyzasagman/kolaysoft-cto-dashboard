import type { ProjectStatus, ReportHealth } from '@/types/api'

export interface PortfolioFilterState {
  search: string
  projectStatus: ProjectStatus | ''
  health: ReportHealth | ''
  managerId: string
  hasCurrentWeekReport: '' | 'true' | 'false'
  sort: string
}

export const DEFAULT_PORTFOLIO_FILTERS: PortfolioFilterState = {
  search: '',
  projectStatus: '',
  health: '',
  managerId: '',
  hasCurrentWeekReport: '',
  sort: 'name,asc',
}

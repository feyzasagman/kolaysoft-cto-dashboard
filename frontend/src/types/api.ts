export type RoleType = 'ADMIN' | 'CTO' | 'PROJECT_MANAGER'

export type ProjectStatus = 'PLANNED' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'

export type ReportHealth = 'GREEN' | 'YELLOW' | 'RED'

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface ErrorDetail {
  code: string
  path: string
  timestamp: string
  fields?: Record<string, string> | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  userId: number
  fullName: string
  email: string
  role: RoleType
}

export interface AuthUser {
  userId: number
  fullName: string
  email: string
  role: RoleType
}

export interface DashboardSummary {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  onHoldProjects: number
  cancelledProjects: number
  riskyProjects: number
  totalReports: number
  submittedReports: number
  draftReports: number
  openRisks: number
  criticalRisks: number
  openBlockers: number
  projectsWithoutCurrentWeekReport: number
}

export interface ProjectDashboardRow {
  projectId: number
  code: string
  name: string
  managerId: number | null
  managerName: string | null
  projectStatus: string
  latestHealth: string | null
  latestReportYear: number | null
  latestReportWeek: number | null
  progressTarget: number | null
  progressActual: number | null
  openRiskCount: number
  criticalRiskCount: number
  openBlockerCount: number
  latestReportDate: string | null
  hasCurrentWeekReport: boolean
}

export interface WeeklyReport {
  id: number
  projectId: number
  projectCode: string
  projectName: string
  year: number
  weekNumber: number
  reportDate: string
  plannedProgress: number | null
  actualProgress: number | null
  projectStatus: string | null
  scheduleStatus: string | null
  completedWork: string | null
  plannedWork: string | null
  overallNote: string | null
}

export interface UserRow {
  id: number
  fullName: string
  email: string
  role: RoleType
  active: boolean
  createdAt: string
}

export interface PageQuery {
  page?: number
  size?: number
  sort?: string
  search?: string
}

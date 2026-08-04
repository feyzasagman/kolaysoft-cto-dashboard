export type RoleType = 'ADMIN' | 'CTO' | 'PROJECT_MANAGER'

export type ProjectStatus = 'PLANNED' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'

export type ReportHealth = 'GREEN' | 'YELLOW' | 'RED'

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type WorkItemStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'

export type RiskStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ACCEPTED'

export type ActivityLevel = 0 | 1 | 2 | 3 | 4

export type DashboardViewMode = 'cards' | 'list'

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

export interface HealthDistribution {
  green: number
  yellow: number
  red: number
  noReport: number
}

export interface CriticalRisk {
  riskId: number
  projectId: number
  projectCode: string
  projectName: string
  weeklyReportId: number
  title: string
  type: string
  impactLevel: string
  status: string
  mitigationPlan: string | null
  createdAt: string | null
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

export interface LatestReportSummary {
  reportId: number
  projectId: number
  projectCode: string
  projectName: string
  managerId: number | null
  managerName: string | null
  year: number
  weekNumber: number
  overallHealth: string | null
  progressTarget: number | null
  progressActual: number | null
  reportStatus: string
  submittedAt: string | null
  createdAt: string | null
  openRiskCount: number
  openBlockerCount: number
}

export interface ReportHistoryItem {
  year: number
  weekNumber: number
  health: string | null
  progressTarget: number | null
  progressActual: number | null
  submittedAt: string | null
}

export interface ProjectDashboardDetail {
  projectId: number
  code: string
  name: string
  description: string | null
  projectStatus: string
  startDate: string | null
  targetEndDate: string | null
  managerId: number | null
  managerName: string | null
  managerEmail: string | null
  latestReport: LatestReportSummary | null
  latestHealth: string | null
  progressTarget: number | null
  progressActual: number | null
  openRisks: number
  openBlockers: number
  reportHistoryCount: number
  lastFiveReports: ReportHistoryItem[]
}

/** Backend ProjectResponse — customer alanı DTO’da yok. */
export interface ProjectResponse {
  id: number
  code: string
  name: string
  description: string | null
  managerId: number | null
  managerFullName: string | null
  managerEmail: string | null
  status: string
  startDate: string | null
  targetEndDate: string | null
  createdAt: string
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

export interface WeeklyReportRequest {
  projectId: number
  weekNumber: number
  reportDate: string
  plannedProgress?: number | null
  actualProgress?: number | null
  projectStatus?: string | null
  scheduleStatus?: string | null
  completedWork?: string | null
  plannedWork?: string | null
  overallNote?: string | null
}

export type WeeklyReportUpdateRequest = Omit<WeeklyReportRequest, 'projectId'>

export interface WorkItem {
  id: number
  reportId: number
  title: string
  description: string | null
  assignee: string | null
  status: WorkItemStatus | string
  plannedDate: string | null
  completedDate: string | null
  note: string | null
}

export interface WorkItemRequest {
  reportId: number
  title: string
  description?: string | null
  assignee?: string | null
  status: WorkItemStatus
  plannedDate?: string | null
  completedDate?: string | null
  note?: string | null
}

export type WorkItemUpdateRequest = Omit<WorkItemRequest, 'reportId'>

export interface RiskIssue {
  id: number
  reportId: number
  title: string
  description: string | null
  riskLevel: RiskLevel | string
  impact: string | null
  actionPlan: string | null
  status: RiskStatus | string
}

export interface RiskIssueRequest {
  reportId: number
  title: string
  description?: string | null
  riskLevel: RiskLevel
  impact?: string | null
  actionPlan?: string | null
  status: RiskStatus
}

export type RiskIssueUpdateRequest = Omit<RiskIssueRequest, 'reportId'>

/** PM proje listesi satırı — dashboard detail + raporlardan türetilir. */
export interface AssignedProjectRow {
  projectId: number
  code: string
  name: string
  /** Backend ProjectResponse/DashboardDetail’de customer yok. */
  customer: string | null
  projectStatus: string
  startDate: string | null
  targetEndDate: string | null
  latestReportYear: number | null
  latestReportWeek: number | null
  hasCurrentWeekReport: boolean
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

/** Frontend aktivite gün modeli (özel backend endpointi yok). */
export interface ProjectActivityDay {
  date: string
  weekNumber: number
  reportCount: number
  workItemCount: number
  riskCount: number
  activityCount: number
  level: ActivityLevel
}

/** Ana dashboard şeridi için haftalık özet hücre. */
export interface ProjectActivityWeek {
  year: number
  weekNumber: number
  startDate: string
  hasReport: boolean
  reportCount: number
  workItemCount: number
  riskCount: number
  activityCount: number
  level: ActivityLevel
}

export interface ProjectFiltersState {
  search: string
  managerId: string
  projectStatus: ProjectStatus | ''
  health: ReportHealth | ''
  riskLevel: RiskLevel | ''
  hasCurrentWeekReport: '' | 'true' | 'false'
  missingReport: boolean
}

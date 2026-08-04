import { apiClient } from '@/api/axiosInstance'
import type {
  ApiResponse,
  CriticalRisk,
  DashboardSummary,
  HealthDistribution,
  LoginRequest,
  LoginResponse,
  PageQuery,
  PageResponse,
  ProjectDashboardDetail,
  ProjectDashboardRow,
  ProjectResponse,
  ProjectStatus,
  ReportHealth,
  RiskIssue,
  RiskIssueRequest,
  RiskIssueUpdateRequest,
  RiskLevel,
  RiskStatus,
  RoleType,
  UserRow,
  WeeklyReport,
  WeeklyReportRequest,
  WeeklyReportUpdateRequest,
  WorkItem,
  WorkItemRequest,
  WorkItemStatus,
  WorkItemUpdateRequest,
} from '@/types/api'

export const authApi = {
  login(payload: LoginRequest) {
    return apiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload)
  },
}

export const dashboardApi = {
  getSummary() {
    return apiClient.get<ApiResponse<DashboardSummary>>('/dashboard/summary')
  },

  getHealthDistribution() {
    return apiClient.get<ApiResponse<HealthDistribution>>('/dashboard/health-distribution')
  },

  getCriticalRisks(params?: { limit?: number; level?: RiskLevel; status?: string; projectId?: number }) {
    return apiClient.get<ApiResponse<CriticalRisk[]>>('/dashboard/critical-risks', { params })
  },

  getProjects(params: PageQuery & {
    managerId?: number
    projectStatus?: ProjectStatus
    health?: ReportHealth
    riskLevel?: RiskLevel
    hasCurrentWeekReport?: boolean
  }) {
    return apiClient.get<ApiResponse<PageResponse<ProjectDashboardRow>>>('/dashboard/projects', {
      params,
    })
  },

  getProjectDetail(projectId: number) {
    return apiClient.get<ApiResponse<ProjectDashboardDetail>>(`/dashboard/projects/${projectId}`)
  },
}

/** ADMIN/CTO proje yönetimi. PM bu listeye erişemez (403). */
export const projectsApi = {
  getProjects(params: PageQuery & {
    status?: ProjectStatus
    managerId?: number
  }) {
    return apiClient.get<ApiResponse<PageResponse<ProjectResponse>>>('/projects', { params })
  },

  getProjectById(id: number) {
    return apiClient.get<ApiResponse<ProjectResponse>>(`/projects/${id}`)
  },

  createProject(payload: {
    code: string
    name: string
    description?: string | null
    managerId: number
    status?: ProjectStatus
    startDate?: string | null
    targetEndDate?: string | null
  }) {
    return apiClient.post<ApiResponse<ProjectResponse>>('/projects', payload)
  },
}

export const reportsApi = {
  getReports(params: PageQuery & {
    projectId?: number
    year?: number
    weekNumber?: number
  }) {
    return apiClient.get<ApiResponse<PageResponse<WeeklyReport>>>('/reports', { params })
  },

  getReportsByProject(projectId: number, params?: PageQuery) {
    return apiClient.get<ApiResponse<PageResponse<WeeklyReport>>>(`/reports/project/${projectId}`, {
      params,
    })
  },

  getReportById(id: number) {
    return apiClient.get<ApiResponse<WeeklyReport>>(`/reports/${id}`)
  },

  createReport(payload: WeeklyReportRequest) {
    return apiClient.post<ApiResponse<WeeklyReport>>('/reports', payload)
  },

  updateReport(id: number, payload: WeeklyReportUpdateRequest) {
    return apiClient.put<ApiResponse<WeeklyReport>>(`/reports/${id}`, payload)
  },

  deleteReport(id: number) {
    return apiClient.delete<ApiResponse<null>>(`/reports/${id}`)
  },
}

export const workItemsApi = {
  getWorkItems(params: PageQuery & {
    reportId?: number
    status?: WorkItemStatus
  }) {
    return apiClient.get<ApiResponse<PageResponse<WorkItem>>>('/work-items', { params })
  },

  createWorkItem(payload: WorkItemRequest) {
    return apiClient.post<ApiResponse<WorkItem>>('/work-items', payload)
  },

  updateWorkItem(id: number, payload: WorkItemUpdateRequest) {
    return apiClient.put<ApiResponse<WorkItem>>(`/work-items/${id}`, payload)
  },

  deleteWorkItem(id: number) {
    return apiClient.delete<ApiResponse<null>>(`/work-items/${id}`)
  },
}

export const riskIssuesApi = {
  getRisks(params: PageQuery & {
    reportId?: number
    riskLevel?: RiskLevel
    status?: RiskStatus
  }) {
    return apiClient.get<ApiResponse<PageResponse<RiskIssue>>>('/risks', { params })
  },

  createRisk(payload: RiskIssueRequest) {
    return apiClient.post<ApiResponse<RiskIssue>>('/risks', payload)
  },

  updateRisk(id: number, payload: RiskIssueUpdateRequest) {
    return apiClient.put<ApiResponse<RiskIssue>>(`/risks/${id}`, payload)
  },

  deleteRisk(id: number) {
    return apiClient.delete<ApiResponse<null>>(`/risks/${id}`)
  },
}

export const usersApi = {
  getUsers(params: PageQuery & {
    role?: RoleType
    active?: boolean
  }) {
    return apiClient.get<ApiResponse<PageResponse<UserRow>>>('/users', { params })
  },

  createUser(payload: {
    fullName: string
    email: string
    password: string
    role: RoleType
  }) {
    return apiClient.post<ApiResponse<UserRow>>('/users', payload)
  },
}

import { apiClient } from '@/api/axiosInstance'
import type {
  ApiResponse,
  DashboardSummary,
  LoginRequest,
  LoginResponse,
  PageQuery,
  PageResponse,
  ProjectDashboardDetail,
  ProjectDashboardRow,
  ProjectStatus,
  ReportHealth,
  RiskLevel,
  RoleType,
  UserRow,
  WeeklyReport,
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

export const reportsApi = {
  getReports(params: PageQuery & {
    projectId?: number
    year?: number
    weekNumber?: number
  }) {
    return apiClient.get<ApiResponse<PageResponse<WeeklyReport>>>('/reports', { params })
  },

  getReportById(id: number) {
    return apiClient.get<ApiResponse<WeeklyReport>>(`/reports/${id}`)
  },
}

export const usersApi = {
  getUsers(params: PageQuery & {
    role?: RoleType
    active?: boolean
  }) {
    return apiClient.get<ApiResponse<PageResponse<UserRow>>>('/users', { params })
  },
}

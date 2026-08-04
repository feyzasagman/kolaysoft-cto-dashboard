import { useMutation, useQuery } from '@tanstack/react-query'
import { authApi, dashboardApi, reportsApi, usersApi } from '@/services/apiServices'
import type {
  LoginRequest,
  PageQuery,
  ProjectStatus,
  ReportHealth,
  RoleType,
} from '@/types/api'

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const { data } = await authApi.login(payload)
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Giriş başarısız.')
      }
      return data.data
    },
  })
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const { data } = await dashboardApi.getSummary()
      return data.data
    },
  })
}

export function useDashboardProjects(params: PageQuery & {
  projectStatus?: ProjectStatus | ''
  health?: ReportHealth | ''
}) {
  return useQuery({
    queryKey: ['dashboard', 'projects', params],
    queryFn: async () => {
      const { data } = await dashboardApi.getProjects({
        ...params,
        projectStatus: params.projectStatus || undefined,
        health: params.health || undefined,
      })
      return data.data
    },
  })
}

export function useWeeklyReports(params: PageQuery) {
  return useQuery({
    queryKey: ['reports', params],
    queryFn: async () => {
      const { data } = await reportsApi.getReports(params)
      return data.data
    },
  })
}

export function useWeeklyReport(id: number | null) {
  return useQuery({
    queryKey: ['reports', id],
    enabled: id != null,
    queryFn: async () => {
      const { data } = await reportsApi.getReportById(id as number)
      return data.data
    },
  })
}

export function useUsers(params: PageQuery & { role?: RoleType | ''; active?: boolean | '' }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const { data } = await usersApi.getUsers({
        ...params,
        role: params.role || undefined,
        active: params.active === '' || params.active === undefined ? undefined : params.active,
      })
      return data.data
    },
  })
}

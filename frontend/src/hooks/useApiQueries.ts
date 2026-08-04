import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  authApi,
  dashboardApi,
  projectsApi,
  reportsApi,
  riskIssuesApi,
  usersApi,
  workItemsApi,
} from '@/services/apiServices'
import type {
  AssignedProjectRow,
  LoginRequest,
  PageQuery,
  ProjectStatus,
  ReportHealth,
  RiskIssueRequest,
  RiskIssueUpdateRequest,
  RiskLevel,
  RiskStatus,
  RoleType,
  WeeklyReportRequest,
  WeeklyReportUpdateRequest,
  WorkItemRequest,
  WorkItemStatus,
  WorkItemUpdateRequest,
} from '@/types/api'
import { getKnownProjectIds, rememberProjectIds } from '@/utils/projectCache'

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

export function useHealthDistribution() {
  return useQuery({
    queryKey: ['dashboard', 'health-distribution'],
    queryFn: async () => {
      const { data } = await dashboardApi.getHealthDistribution()
      return data.data
    },
  })
}

export function useCriticalRisks(limit = 8) {
  return useQuery({
    queryKey: ['dashboard', 'critical-risks', limit],
    queryFn: async () => {
      const { data } = await dashboardApi.getCriticalRisks({ limit })
      return data.data
    },
  })
}

export function useDashboardProjects(
  params: PageQuery & {
    projectStatus?: ProjectStatus | ''
    health?: ReportHealth | ''
    riskLevel?: RiskLevel | ''
    hasCurrentWeekReport?: boolean
  },
  enabled = true,
) {
  return useQuery({
    queryKey: ['dashboard', 'projects', params],
    enabled,
    queryFn: async () => {
      const { data } = await dashboardApi.getProjects({
        ...params,
        projectStatus: params.projectStatus || undefined,
        health: params.health || undefined,
        riskLevel: params.riskLevel || undefined,
      })
      return data.data
    },
  })
}

export function useProjectDetail(projectId: number | null) {
  return useQuery({
    queryKey: ['dashboard', 'project', projectId],
    enabled: projectId != null && projectId > 0,
    queryFn: async () => {
      const { data } = await dashboardApi.getProjectDetail(projectId as number)
      return data.data
    },
  })
}

/**
 * PM atanmış projeler:
 * - Backend’de PM proje listesi yok (GET /projects ve /dashboard/projects → 403).
 * - Raporlardan + bilinen proje id önbelleğinden id toplanır,
 *   her biri GET /dashboard/projects/{id} ile doğrulanır (PM erişebilir).
 */
export function useAssignedProjects(enabled = true) {
  return useQuery({
    queryKey: ['projects', 'assigned'],
    enabled,
    queryFn: async (): Promise<AssignedProjectRow[]> => {
      const { data: reportsPage } = await reportsApi.getReports({
        page: 0,
        size: 100,
        sort: 'reportDate,desc',
      })
      const fromReports = (reportsPage.data?.content ?? []).map((r) => r.projectId)
      const ids = Array.from(new Set([...fromReports, ...getKnownProjectIds()]))
      rememberProjectIds(ids)

      const rows: AssignedProjectRow[] = []
      await Promise.all(
        ids.map(async (projectId) => {
          try {
            const { data } = await dashboardApi.getProjectDetail(projectId)
            const detail = data.data
            if (!detail) return
            rows.push({
              projectId: detail.projectId,
              code: detail.code,
              name: detail.name,
              customer: null,
              projectStatus: detail.projectStatus,
              startDate: detail.startDate,
              targetEndDate: detail.targetEndDate,
              latestReportYear: detail.latestReport?.year ?? null,
              latestReportWeek: detail.latestReport?.weekNumber ?? null,
              hasCurrentWeekReport: Boolean(detail.latestReport),
            })
          } catch {
            // erişilemeyen id’leri atla
          }
        }),
      )

      // hasCurrentWeekReport için rapor listesinden daha doğru kontrol
      const current = new Date()
      const isoWeek = (() => {
        const d = new Date(Date.UTC(current.getFullYear(), current.getMonth(), current.getDate()))
        const day = d.getUTCDay() || 7
        d.setUTCDate(d.getUTCDate() + 4 - day)
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
        return {
          year: d.getUTCFullYear(),
          week: Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7),
        }
      })()

      const reportContent = reportsPage.data?.content ?? []
      return rows
        .map((row) => {
          const hasCurrent = reportContent.some(
            (r) =>
              r.projectId === row.projectId &&
              r.year === isoWeek.year &&
              r.weekNumber === isoWeek.week,
          )
          const latest = reportContent.find((r) => r.projectId === row.projectId)
          return {
            ...row,
            hasCurrentWeekReport: hasCurrent,
            latestReportYear: latest?.year ?? row.latestReportYear,
            latestReportWeek: latest?.weekNumber ?? row.latestReportWeek,
          }
        })
        .sort((a, b) => a.name.localeCompare(b.name, 'tr'))
    },
  })
}

export function useAdminProjects(params: PageQuery & { status?: ProjectStatus | ''; managerId?: number }, enabled = true) {
  return useQuery({
    queryKey: ['projects', 'admin', params],
    enabled,
    queryFn: async () => {
      const { data } = await projectsApi.getProjects({
        ...params,
        status: params.status || undefined,
      })
      return data.data
    },
  })
}

export function useWeeklyReports(params: PageQuery & {
  projectId?: number
  year?: number
  weekNumber?: number
}) {
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
    enabled: id != null && id > 0,
    queryFn: async () => {
      const { data } = await reportsApi.getReportById(id as number)
      return data.data
    },
  })
}

export function useCreateWeeklyReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: WeeklyReportRequest) => {
      const { data } = await reportsApi.createReport(payload)
      return data.data
    },
    onSuccess: (report) => {
      if (report?.projectId) rememberProjectIds([report.projectId])
      void queryClient.invalidateQueries({ queryKey: ['reports'] })
      void queryClient.invalidateQueries({ queryKey: ['projects', 'assigned'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateWeeklyReport(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: WeeklyReportUpdateRequest) => {
      const { data } = await reportsApi.updateReport(id, payload)
      return data.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reports'] })
      void queryClient.invalidateQueries({ queryKey: ['reports', id] })
      void queryClient.invalidateQueries({ queryKey: ['projects', 'assigned'] })
    },
  })
}

export function useWorkItems(reportId: number | null) {
  return useQuery({
    queryKey: ['work-items', { reportId }],
    enabled: reportId != null && reportId > 0,
    queryFn: async () => {
      const { data } = await workItemsApi.getWorkItems({
        reportId: reportId as number,
        page: 0,
        size: 100,
        sort: 'id,asc',
      })
      return data.data
    },
  })
}

export function useCreateWorkItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: WorkItemRequest) => {
      const { data } = await workItemsApi.createWorkItem(payload)
      return data.data
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['work-items', { reportId: variables.reportId }] })
    },
  })
}

export function useUpdateWorkItem(reportId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: WorkItemUpdateRequest }) => {
      const { data } = await workItemsApi.updateWorkItem(id, payload)
      return data.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['work-items', { reportId }] })
    },
  })
}

export function useDeleteWorkItem(reportId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await workItemsApi.deleteWorkItem(id)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['work-items', { reportId }] })
    },
  })
}

export function useRiskIssues(reportId: number | null) {
  return useQuery({
    queryKey: ['risks', { reportId }],
    enabled: reportId != null && reportId > 0,
    queryFn: async () => {
      const { data } = await riskIssuesApi.getRisks({
        reportId: reportId as number,
        page: 0,
        size: 100,
        sort: 'id,asc',
      })
      return data.data
    },
  })
}

export function useCreateRiskIssue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: RiskIssueRequest) => {
      const { data } = await riskIssuesApi.createRisk(payload)
      return data.data
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['risks', { reportId: variables.reportId }] })
    },
  })
}

export function useUpdateRiskIssue(reportId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: RiskIssueUpdateRequest }) => {
      const { data } = await riskIssuesApi.updateRisk(id, payload)
      return data.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['risks', { reportId }] })
    },
  })
}

export function useDeleteRiskIssue(reportId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await riskIssuesApi.deleteRisk(id)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['risks', { reportId }] })
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

export type { WorkItemStatus, RiskStatus }

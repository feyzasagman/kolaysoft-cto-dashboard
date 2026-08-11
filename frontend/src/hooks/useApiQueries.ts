import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  authApi,
  dashboardApi,
  projectAssignmentsApi,
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

export function useDashboardSummary(enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    enabled,
    queryFn: async () => {
      const { data } = await dashboardApi.getSummary()
      return data.data
    },
  })
}

export function useHealthDistribution(enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'health-distribution'],
    enabled,
    queryFn: async () => {
      const { data } = await dashboardApi.getHealthDistribution()
      return data.data
    },
  })
}

export function useCriticalRisks(limit = 8, enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'critical-risks', limit],
    enabled,
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
    managerId?: number
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
        managerId: params.managerId,
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

export function useProjectReports(projectId: number | null, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'project', projectId],
    enabled: enabled && projectId != null && projectId > 0,
    queryFn: async () => {
      const { data } = await reportsApi.getReportsByProject(projectId as number, {
        page: 0,
        size: 10,
        sort: 'reportDate,desc',
      })
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

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      fullName: string
      email: string
      password: string
      role: RoleType
    }) => {
      const { data } = await usersApi.createUser(payload)
      if (!data.success || !data.data) throw new Error(data.message || 'Kullanıcı oluşturulamadı.')
      return data.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number
      payload: { fullName: string; email: string; password?: string; role: RoleType }
    }) => {
      const { data } = await usersApi.updateUser(id, payload)
      if (!data.success || !data.data) throw new Error(data.message || 'Kullanıcı güncellenemedi.')
      return data.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const { data } = await usersApi.updateUserStatus(id, active)
      if (!data.success || !data.data) throw new Error(data.message || 'Durum güncellenemedi.')
      return data.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      code: string
      name: string
      description?: string | null
      managerId: number
      status?: ProjectStatus
      startDate?: string | null
      targetEndDate?: string | null
    }) => {
      const { data } = await projectsApi.createProject(payload)
      if (!data.success || !data.data) throw new Error(data.message || 'Proje oluşturulamadı.')
      return data.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'projects'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] })
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number
      payload: {
        code: string
        name: string
        description?: string | null
        managerId: number
        status: ProjectStatus
        startDate?: string | null
        targetEndDate?: string | null
      }
    }) => {
      const { data } = await projectsApi.updateProject(id, payload)
      if (!data.success || !data.data) throw new Error(data.message || 'Proje güncellenemedi.')
      return data.data
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'projects'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'project', variables.id] })
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
      void queryClient.invalidateQueries({ queryKey: ['project-assignments', variables.id] })
    },
  })
}

export function useProjectAssignments(projectId: number | null, enabled = true) {
  return useQuery({
    queryKey: ['project-assignments', projectId],
    enabled: enabled && projectId != null && projectId > 0,
    queryFn: async () => {
      const { data } = await projectAssignmentsApi.list(projectId as number)
      return data.data ?? []
    },
  })
}

export function useAssignProjectUser(projectId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { userId: number; assignmentRole?: string | null }) => {
      const { data } = await projectAssignmentsApi.assign(projectId, payload)
      if (!data.success || !data.data) throw new Error(data.message || 'Atama yapılamadı.')
      return data.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['project-assignments', projectId] })
      void queryClient.invalidateQueries({ queryKey: ['projects', 'assigned'] })
    },
  })
}

export function useRemoveProjectAssignment(projectId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: number) => {
      const { data } = await projectAssignmentsApi.remove(projectId, userId)
      if (!data.success) throw new Error(data.message || 'Atama kaldırılamadı.')
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['project-assignments', projectId] })
      void queryClient.invalidateQueries({ queryKey: ['projects', 'assigned'] })
    },
  })
}

export type { WorkItemStatus, RiskStatus }

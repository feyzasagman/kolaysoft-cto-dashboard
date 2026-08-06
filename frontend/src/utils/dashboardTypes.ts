import type {
  CriticalRisk,
  DashboardSummary,
  HealthDistribution,
  ProjectDashboardRow,
  RoleType,
} from '@/types/api'

export interface DashboardKpiItem {
  key: string
  label: string
  value: number
  description: string
  tone: string
}

export interface HealthSlice {
  key: 'GREEN' | 'YELLOW' | 'RED' | 'NO_REPORT'
  label: string
  value: number
  percent: number
  color: string
}

export interface PortfolioRow {
  id: number
  projectId: number
  name: string
  code: string
  managerName: string
  projectStatus: string
  latestHealth: string | null
  progressTarget: number
  progressActual: number
  openRiskCount: number
  criticalRiskCount: number
  hasCurrentWeekReport: boolean
  latestReportDate: string | null
  latestReportLabel: string
}

export interface DashboardHeaderModel {
  title: string
  description: string
  welcome: string | null
}

export type { DashboardSummary, HealthDistribution, ProjectDashboardRow, CriticalRisk, RoleType }

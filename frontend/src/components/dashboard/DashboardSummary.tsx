import {
  AssignmentLateOutlined,
  FolderOpenOutlined,
  ReportProblemOutlined,
  TaskAltOutlined,
  WarningAmberOutlined,
  WorkOutlineOutlined,
} from '@mui/icons-material'
import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import { KpiCard, KpiCardSkeleton, type KpiTrend } from '@/components/dashboard/KpiCard'
import { kpiGridSx } from '@/theme/dashboardTokens'
import type { DashboardSummary } from '@/types/api'
import { mapSummaryToKpis } from '@/utils/dashboardMapper'

const ICONS: Record<string, ReactNode> = {
  totalProjects: <FolderOpenOutlined fontSize="small" />,
  activeProjects: <WorkOutlineOutlined fontSize="small" />,
  completedProjects: <TaskAltOutlined fontSize="small" />,
  openRisks: <WarningAmberOutlined fontSize="small" />,
  criticalRisks: <ReportProblemOutlined fontSize="small" />,
  projectsWithoutCurrentWeekReport: <AssignmentLateOutlined fontSize="small" />,
}

function trendFor(key: string, value: number): { trend: KpiTrend; trendLabel: string } {
  if (key === 'criticalRisks') {
    if (value === 0) return { trend: 'up', trendLabel: 'Temiz' }
    if (value >= 3) return { trend: 'down', trendLabel: 'Dikkat' }
    return { trend: 'flat', trendLabel: 'İzle' }
  }
  if (key === 'projectsWithoutCurrentWeekReport') {
    if (value === 0) return { trend: 'up', trendLabel: 'Güncel' }
    return { trend: 'down', trendLabel: 'Eksik' }
  }
  if (key === 'openRisks') {
    if (value === 0) return { trend: 'up', trendLabel: 'Temiz' }
    return { trend: 'flat', trendLabel: 'Açık' }
  }
  return { trend: 'flat', trendLabel: 'Güncel' }
}

interface DashboardSummaryProps {
  summary: DashboardSummary | null | undefined
  loading?: boolean
}

export function DashboardSummaryCards({ summary, loading = false }: DashboardSummaryProps) {
  if (loading) {
    return (
      <Box sx={kpiGridSx} aria-busy="true" aria-label="Özet metrikler yükleniyor">
        {Array.from({ length: 6 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </Box>
    )
  }

  const cards = mapSummaryToKpis(summary)

  return (
    <Box sx={kpiGridSx} aria-label="Özet metrik kartları" className="fade-in-up">
      {cards.map((card) => {
        const { trend, trendLabel } = trendFor(card.key, card.value)
        return (
          <KpiCard
            key={card.key}
            label={card.label}
            value={card.value}
            secondary={card.description}
            tooltip={card.description}
            icon={ICONS[card.key]}
            tone={card.tone}
            trend={trend}
            trendLabel={trendLabel}
          />
        )
      })}
    </Box>
  )
}

/** Day 13 export alias */
export { DashboardSummaryCards as DashboardSummary }

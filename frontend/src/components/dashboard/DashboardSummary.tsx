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
import { KpiCard, KpiCardSkeleton } from '@/components/dashboard/KpiCard'
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

interface DashboardSummaryProps {
  summary: DashboardSummary | null | undefined
  loading?: boolean
}

export function DashboardSummaryCards({ summary, loading = false }: DashboardSummaryProps) {
  if (loading) {
    return (
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
        }}
        aria-busy="true"
        aria-label="Özet metrikler yükleniyor"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </Box>
    )
  }

  const cards = mapSummaryToKpis(summary)

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(3, minmax(0, 1fr))',
        },
      }}
      aria-label="Özet metrik kartları"
    >
      {cards.map((card) => (
        <KpiCard
          key={card.key}
          label={card.label}
          value={card.value}
          secondary={card.description}
          tooltip={card.description}
          icon={ICONS[card.key]}
          tone={card.tone}
        />
      ))}
    </Box>
  )
}

/** Day 13 export alias */
export { DashboardSummaryCards as DashboardSummary }

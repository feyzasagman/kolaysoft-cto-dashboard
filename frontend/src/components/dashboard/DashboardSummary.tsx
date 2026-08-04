import {
  AssessmentOutlined,
  FolderOpenOutlined,
  ReportProblemOutlined,
  TaskAltOutlined,
  WarningAmberOutlined,
  WorkOutlineOutlined,
} from '@mui/icons-material'
import { Box, Paper, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import type { DashboardSummary } from '@/types/api'

interface SummaryCardProps {
  title: string
  value: number
  description: string
  icon: ReactNode
  tone?: string
}

export function SummaryCard({ title, value, description, icon, tone = '#1F6F54' }: SummaryCardProps) {
  return (
    <Paper sx={{ p: 1.75, height: '100%' }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1,
            display: 'grid',
            placeItems: 'center',
            bgcolor: `${tone}14`,
            color: tone,
            border: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  )
}

interface DashboardSummaryProps {
  summary: DashboardSummary
}

export function DashboardSummaryCards({ summary }: DashboardSummaryProps) {
  const cards = [
    {
      title: 'Toplam Proje',
      value: summary.totalProjects,
      description: 'Kayıtlı tüm projeler',
      icon: <FolderOpenOutlined fontSize="small" />,
      tone: '#24292F',
    },
    {
      title: 'Aktif Proje',
      value: summary.activeProjects,
      description: 'Devam eden çalışmalar',
      icon: <WorkOutlineOutlined fontSize="small" />,
      tone: '#1F6F54',
    },
    {
      title: 'Tamamlanan Proje',
      value: summary.completedProjects,
      description: 'Kapanmış projeler',
      icon: <TaskAltOutlined fontSize="small" />,
      tone: '#1A7F37',
    },
    {
      title: 'Açık Risk',
      value: summary.openRisks,
      description: 'OPEN / IN_PROGRESS',
      icon: <WarningAmberOutlined fontSize="small" />,
      tone: '#9A6700',
    },
    {
      title: 'Kritik Risk',
      value: summary.criticalRisks,
      description: 'Öncelikli riskler',
      icon: <ReportProblemOutlined fontSize="small" />,
      tone: '#CF222E',
    },
    {
      title: 'Gönderilen Rapor',
      value: summary.submittedReports,
      description: 'Haftalık raporlar',
      icon: <AssessmentOutlined fontSize="small" />,
      tone: '#0969DA',
    },
  ]

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
    >
      {cards.map((card) => (
        <SummaryCard key={card.title} {...card} />
      ))}
    </Box>
  )
}

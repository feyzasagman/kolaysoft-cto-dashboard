import {
  AssessmentOutlined,
  FolderOpenOutlined,
  ReportProblemOutlined,
  TaskAltOutlined,
  WarningAmberOutlined,
  WorkOutlineOutlined,
} from '@mui/icons-material'
import { Alert, Box, Paper, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { LoadingState } from '@/components/common/LoadingState'
import { useDashboardSummary } from '@/hooks/useApiQueries'
import { getErrorMessage } from '@/utils/errorUtils'

interface SummaryCardProps {
  title: string
  value: number | undefined
  icon: ReactNode
  accent: string
}

function SummaryCard({ title, value, icon, accent }: SummaryCardProps) {
  return (
    <Paper
      sx={{
        p: 2.5,
        height: '100%',
        background: `linear-gradient(145deg, #ffffff 0%, ${accent}14 100%)`,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: `${accent}22`,
            color: accent,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {value ?? '—'}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  )
}

export function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboardSummary()

  if (isLoading) {
    return <LoadingState label="Dashboard özeti yükleniyor..." />
  }

  if (isError) {
    return <Alert severity="error">{getErrorMessage(error)}</Alert>
  }

  const cards = [
    {
      title: 'Total Projects',
      value: data?.totalProjects,
      icon: <FolderOpenOutlined />,
      accent: '#0F6B5C',
    },
    {
      title: 'Active Projects',
      value: data?.activeProjects,
      icon: <WorkOutlineOutlined />,
      accent: '#1F3A5F',
    },
    {
      title: 'Completed Projects',
      value: data?.completedProjects,
      icon: <TaskAltOutlined />,
      accent: '#2E7D4F',
    },
    {
      title: 'Open Risks',
      value: data?.openRisks,
      icon: <WarningAmberOutlined />,
      accent: '#C47B16',
    },
    {
      title: 'Critical Risks',
      value: data?.criticalRisks,
      icon: <ReportProblemOutlined />,
      accent: '#B42318',
    },
    {
      title: 'Submitted Reports',
      value: data?.submittedReports,
      icon: <AssessmentOutlined />,
      accent: '#0F6B5C',
    },
  ]

  return (
    <Box>
      <Typography variant="h5" mb={0.5}>
        CTO Overview
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Proje sağlığı, riskler ve rapor durumu özeti.
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
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
    </Box>
  )
}

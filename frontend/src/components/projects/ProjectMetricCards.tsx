import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined'
import { Box, Stack, Tooltip, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import type { ProjectDetailViewModel } from '@/utils/projectDetailMapper'

interface Metric {
  key: string
  label: string
  value: string | number
  hint: string
  icon: ReactNode
  tone: string
}

interface ProjectMetricCardsProps {
  model: ProjectDetailViewModel
  completedTasks: number
  teamMembers?: number
}

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <Tooltip title={metric.hint} enterDelay={250} describeChild>
      <Box
        sx={{
          ...surfaceSx,
          p: DASH.cardPadding,
          minHeight: 112,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
          '&:hover': {
            borderColor: '#AFB8C1',
            boxShadow: 2,
            transform: DASH.hoverLift,
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              display: 'grid',
              placeItems: 'center',
              bgcolor: `${metric.tone}14`,
              color: metric.tone,
              border: DASH.border,
              borderColor: 'divider',
            }}
            aria-hidden
          >
            {metric.icon}
          </Box>
        </Stack>
        <Typography variant="overline" sx={{ mb: 0.5 }}>
          {metric.label}
        </Typography>
        <Typography
          sx={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em' }}
          aria-label={`${metric.label}: ${metric.value}`}
        >
          {metric.value}
        </Typography>
        <Typography variant="caption" color="text.secondary" mt="auto" pt={1}>
          {metric.hint}
        </Typography>
      </Box>
    </Tooltip>
  )
}

export function ProjectMetricCards({
  model,
  completedTasks,
  teamMembers = 1,
}: ProjectMetricCardsProps) {
  const metrics: Metric[] = [
    {
      key: 'progress',
      label: 'Overall Progress',
      value: `${model.progressActual}%`,
      hint: `Hedef ${model.progressTarget}%`,
      icon: <TrendingUpOutlinedIcon fontSize="small" />,
      tone: '#0969DA',
    },
    {
      key: 'risks',
      label: 'Open Risks',
      value: model.openRisks,
      hint: `${model.openBlockers} blocker`,
      icon: <ReportProblemOutlinedIcon fontSize="small" />,
      tone: '#CF222E',
    },
    {
      key: 'tasks',
      label: 'Completed Tasks',
      value: completedTasks,
      hint: 'Son rapordaki tamamlananlar',
      icon: <TaskAltOutlinedIcon fontSize="small" />,
      tone: '#1A7F37',
    },
    {
      key: 'reports',
      label: 'Weekly Reports',
      value: model.reportHistoryCount,
      hint: model.hasCurrentWeekReport ? 'Bu hafta rapor var' : 'Bu hafta rapor eksik',
      icon: <AssessmentOutlinedIcon fontSize="small" />,
      tone: '#0550AE',
    },
    {
      key: 'team',
      label: 'Team Members',
      value: teamMembers,
      hint: 'Project manager',
      icon: <GroupOutlinedIcon fontSize="small" />,
      tone: '#656D76',
    },
    {
      key: 'health',
      label: 'Project Health',
      value: model.healthLabel,
      hint: 'Son haftalık rapora göre',
      icon: <FavoriteBorderOutlinedIcon fontSize="small" />,
      tone:
        model.health === 'RED' ? '#CF222E' : model.health === 'YELLOW' ? '#9A6700' : '#1A7F37',
    },
  ]

  return (
    <Box
      className="fade-in-up"
      sx={{
        display: 'grid',
        gap: DASH.cardGap,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(3, minmax(0, 1fr))',
        },
        mb: DASH.sectionGap,
      }}
      aria-label="Proje özet metrikleri"
    >
      {metrics.map((metric) => (
        <MetricCard key={metric.key} metric={metric} />
      ))}
    </Box>
  )
}

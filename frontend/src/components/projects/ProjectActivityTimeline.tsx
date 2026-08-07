import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined'
import { Box, Stack, Typography } from '@mui/material'
import { EmptyState } from '@/components/common/EmptyState'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import type { TimelineEvent } from '@/utils/projectDetailMapper'

interface ProjectActivityTimelineProps {
  events: TimelineEvent[]
}

const KIND_ICON = {
  report: <TimelineOutlinedIcon fontSize="small" />,
  risk: <ReportProblemOutlinedIcon fontSize="small" />,
  task: <TaskAltOutlinedIcon fontSize="small" />,
  status: <FlagOutlinedIcon fontSize="small" />,
  manager: <AssignmentIndOutlinedIcon fontSize="small" />,
} as const

const TONE_COLOR = {
  neutral: '#656D76',
  success: '#1A7F37',
  warning: '#9A6700',
  danger: '#CF222E',
  info: '#0969DA',
} as const

export function ProjectActivityTimeline({ events }: ProjectActivityTimelineProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={<TimelineOutlinedIcon />}
        title="Henüz aktivite yok"
        description="Rapor, risk ve iş kalemi hareketleri burada zaman çizelgesi olarak görünür."
      />
    )
  }

  return (
    <Box
      component="ol"
      aria-label="Aktivite zaman çizelgesi"
      sx={{ listStyle: 'none', m: 0, p: 0, position: 'relative' }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          left: 19,
          top: 8,
          bottom: 8,
          width: 2,
          bgcolor: 'divider',
          display: { xs: 'none', sm: 'block' },
        }}
      />
      <Stack spacing={DASH.space2}>
        {events.map((event) => (
          <Box
            key={event.id}
            component="li"
            sx={{
              ...surfaceSx,
              p: DASH.space2,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '40px 1fr' },
              gap: DASH.space2,
              transition: 'border-color 160ms ease, box-shadow 160ms ease',
              '&:hover': { borderColor: '#AFB8C1', boxShadow: 1 },
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: { xs: 'none', sm: 'grid' },
                placeItems: 'center',
                bgcolor: `${TONE_COLOR[event.tone]}14`,
                color: TONE_COLOR[event.tone],
                border: DASH.border,
                borderColor: 'divider',
                zIndex: 1,
              }}
              aria-hidden
            >
              {KIND_ICON[event.kind]}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={0.5}
                mb={0.5}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  {event.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {event.dateLabel}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {event.meta}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

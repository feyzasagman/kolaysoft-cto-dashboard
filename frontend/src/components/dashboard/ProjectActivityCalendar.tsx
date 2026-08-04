import { Box, Stack, Typography } from '@mui/material'
import { ProjectActivityCell } from '@/components/dashboard/ProjectActivityCell'
import { ACTIVITY_LEVEL_COLORS } from '@/theme/appTheme'
import type { ProjectActivityDay } from '@/types/api'
import {
  ACTIVITY_DATA_NOTE,
  ACTIVITY_EMPTY_MESSAGE,
  hasCalendarActivity,
} from '@/utils/projectActivity'

interface ProjectActivityCalendarProps {
  data: ProjectActivityDay[]
  loading?: boolean
  emptyMessage?: string
  showNote?: boolean
}

function buildWeeks(data: ProjectActivityDay[]): ProjectActivityDay[][] {
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date))
  if (sorted.length === 0) return []

  const first = new Date(`${sorted[0].date}T00:00:00Z`)
  const pad = first.getUTCDay()
  const cells: Array<ProjectActivityDay | null> = [
    ...Array.from({ length: pad }, () => null),
    ...sorted,
  ]

  const weeks: ProjectActivityDay[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    const chunk = cells.slice(i, i + 7)
    while (chunk.length < 7) chunk.push(null)
    weeks.push(
      chunk.map((day, index) => {
        if (day) return day
        return {
          date: `pad-${i}-${index}`,
          weekNumber: 0,
          activityCount: 0,
          reportCount: 0,
          workItemCount: 0,
          riskCount: 0,
          level: 0,
        }
      }),
    )
  }
  return weeks
}

const WEEKDAY_LABELS = ['P', 'P', 'S', 'Ç', 'P', 'C', 'C']

export function ProjectActivityCalendar({
  data,
  loading = false,
  emptyMessage = ACTIVITY_EMPTY_MESSAGE,
  showNote = true,
}: ProjectActivityCalendarProps) {
  const weeks = buildWeeks(data)
  const hasActivity = hasCalendarActivity(data)

  if (loading) {
    return (
      <Box sx={{ height: 96, bgcolor: 'action.hover', borderRadius: 1 }} aria-busy="true" />
    )
  }

  if (!hasActivity) {
    return (
      <Typography variant="body2" color="text.secondary">
        {emptyMessage}
      </Typography>
    )
  }

  return (
    <Box>
      <Stack direction="row" spacing={0.75} alignItems="flex-start">
        <Stack spacing="3px" sx={{ pt: '1px', width: 12 }}>
          {WEEKDAY_LABELS.map((label, index) => (
            <Typography
              key={`${label}-${index}`}
              variant="caption"
              sx={{
                height: 11,
                lineHeight: '11px',
                fontSize: 9,
                color: 'text.secondary',
                visibility: index % 2 === 1 ? 'visible' : 'hidden',
              }}
            >
              {label}
            </Typography>
          ))}
        </Stack>

        <Box sx={{ overflowX: 'auto', pb: 0.5, maxWidth: '100%' }}>
          <Stack direction="row" spacing="3px">
            {weeks.map((week, weekIndex) => (
              <Stack key={weekIndex} spacing="3px">
                {week.map((day) =>
                  day.date.startsWith('pad-') ? (
                    <Box
                      key={day.date}
                      sx={{ width: 11, height: 11, borderRadius: '2px', bgcolor: 'transparent' }}
                    />
                  ) : (
                    <ProjectActivityCell key={day.date} day={day} />
                  ),
                )}
              </Stack>
            ))}
          </Stack>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center" mt={1}>
        <Typography variant="caption">Az</Typography>
        {ACTIVITY_LEVEL_COLORS.map((color, level) => (
          <Box
            key={color}
            sx={{
              width: 11,
              height: 11,
              borderRadius: '2px',
              bgcolor: color,
              border: '1px solid rgba(27,31,35,0.06)',
            }}
            aria-label={`Aktivite seviyesi ${level}`}
          />
        ))}
        <Typography variant="caption">Çok</Typography>
      </Stack>

      {showNote && (
        <Typography variant="caption" color="text.secondary" display="block" mt={0.75}>
          {ACTIVITY_DATA_NOTE}
        </Typography>
      )}
    </Box>
  )
}

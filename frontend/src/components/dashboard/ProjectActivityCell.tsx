import { Box, Tooltip } from '@mui/material'
import { ACTIVITY_LEVEL_COLORS } from '@/theme/appTheme'
import type { ProjectActivityDay } from '@/types/api'

interface ProjectActivityCellProps {
  day: ProjectActivityDay
}

export function ProjectActivityCell({ day }: ProjectActivityCellProps) {
  const color = ACTIVITY_LEVEL_COLORS[day.level] ?? ACTIVITY_LEVEL_COLORS[0]
  const label = [
    day.date,
    `Hafta: ${day.weekNumber}`,
    `Aktivite: ${day.activityCount}`,
    `Rapor: ${day.reportCount}`,
    `İş kalemi: ${day.workItemCount}`,
    `Risk: ${day.riskCount}`,
    `Seviye: ${day.level}`,
  ].join(' · ')

  return (
    <Tooltip title={label} enterDelay={200} describeChild>
      <Box
        component="button"
        type="button"
        aria-label={label}
        tabIndex={0}
        sx={{
          width: 11,
          height: 11,
          borderRadius: '2px',
          bgcolor: color,
          border: '1px solid rgba(27, 31, 35, 0.06)',
          p: 0,
          cursor: 'default',
          display: 'block',
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 1,
          },
        }}
      />
    </Tooltip>
  )
}

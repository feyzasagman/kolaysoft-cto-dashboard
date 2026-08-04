import { Box, Stack, Tooltip, Typography } from '@mui/material'
import { ACTIVITY_LEVEL_COLORS } from '@/theme/appTheme'
import type { ProjectActivityWeek } from '@/types/api'
import { ACTIVITY_EMPTY_MESSAGE, hasStripActivity } from '@/utils/projectActivity'

interface ProjectActivityStripProps {
  weeks: ProjectActivityWeek[]
  loading?: boolean
}

export function ProjectActivityStrip({ weeks, loading = false }: ProjectActivityStripProps) {
  if (loading) {
    return (
      <Box
        sx={{ height: 28, borderRadius: 1, bgcolor: 'action.hover' }}
        aria-busy="true"
        aria-label="Aktivite şeridi yükleniyor"
      />
    )
  }

  if (!hasStripActivity(weeks)) {
    return (
      <Typography variant="caption" color="text.secondary">
        {ACTIVITY_EMPTY_MESSAGE}
      </Typography>
    )
  }

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" mb={0.75}>
        Son 12 haftalık aktivite
      </Typography>
      <Box sx={{ overflowX: 'auto', pb: 0.5 }}>
        <Stack direction="row" spacing={0.5} alignItems="flex-end" minWidth="max-content">
          {weeks.map((week) => {
            const color = ACTIVITY_LEVEL_COLORS[week.level] ?? ACTIVITY_LEVEL_COLORS[0]
            const label = [
              `${week.year} / ${week.weekNumber}. Hafta`,
              `Rapor: ${week.hasReport ? 'Var' : 'Yok'}`,
              `İş Kalemi: ${week.workItemCount}`,
              `Risk Güncellemesi: ${week.riskCount}`,
            ].join('\n')

            return (
              <Tooltip
                key={`${week.year}-W${week.weekNumber}`}
                title={<Box sx={{ whiteSpace: 'pre-line' }}>{label}</Box>}
                enterDelay={150}
                describeChild
              >
                <Box
                  component="button"
                  type="button"
                  tabIndex={0}
                  aria-label={label.replace(/\n/g, ', ')}
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: '3px',
                    bgcolor: color,
                    border: '1px solid rgba(27,31,35,0.08)',
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
          })}
        </Stack>
      </Box>
      <Stack direction="row" spacing={0.75} alignItems="center" mt={0.75}>
        <Typography variant="caption">Az</Typography>
        {ACTIVITY_LEVEL_COLORS.map((color, level) => (
          <Box
            key={color}
            sx={{
              width: 10,
              height: 10,
              borderRadius: '2px',
              bgcolor: color,
              border: '1px solid rgba(27,31,35,0.06)',
            }}
            aria-label={`Seviye ${level}`}
          />
        ))}
        <Typography variant="caption">Çok</Typography>
      </Stack>
    </Box>
  )
}

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import TimelapseIcon from '@mui/icons-material/Timelapse'
import BlockIcon from '@mui/icons-material/Block'
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined'
import { Box, LinearProgress, Skeleton, Stack, Typography } from '@mui/material'
import { EmptyState } from '@/components/common/EmptyState'
import { WorkItemStatusBadge } from '@/components/common/StatusBadges'
import { UserAvatar } from '@/components/common/UserAvatar'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import { mapActiveWorkItems } from '@/utils/projectDetailMapper'
import type { WorkItem } from '@/types/api'

interface ProjectWorkItemsChecklistProps {
  items: WorkItem[] | null | undefined
  loading?: boolean
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'DONE') return <CheckCircleOutlineIcon fontSize="small" color="success" />
  if (status === 'IN_PROGRESS') return <TimelapseIcon fontSize="small" color="primary" />
  if (status === 'BLOCKED') return <BlockIcon fontSize="small" color="error" />
  return <RadioButtonUncheckedIcon fontSize="small" color="disabled" />
}

function progressFor(status: string) {
  if (status === 'DONE') return 100
  if (status === 'IN_PROGRESS') return 55
  if (status === 'BLOCKED') return 25
  return 8
}

export function ProjectWorkItemsChecklist({
  items,
  loading = false,
}: ProjectWorkItemsChecklistProps) {
  const rows = mapActiveWorkItems(items)

  if (loading) {
    return (
      <Stack spacing={DASH.space1} aria-busy="true" aria-label="İş kalemleri yükleniyor">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={72} />
        ))}
      </Stack>
    )
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<ChecklistOutlinedIcon />}
        title="İş kalemi bulunmuyor"
        description="Son haftalık rapora bağlı iş kalemleri burada checklist olarak görünür."
      />
    )
  }

  return (
    <Stack spacing={DASH.space1} role="list" aria-label="İş kalemleri listesi">
      {rows.map((item) => (
        <Box
          key={item.id}
          role="listitem"
          sx={{
            ...surfaceSx,
            px: DASH.space2,
            py: 1.5,
            transition: 'border-color 160ms ease, background-color 160ms ease',
            '&:hover': { borderColor: '#AFB8C1', bgcolor: 'action.hover' },
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box sx={{ mt: 0.25 }} aria-hidden>
              <StatusIcon status={item.status} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={1}
                mb={0.75}
              >
                <Typography variant="body2" fontWeight={700} noWrap>
                  {item.title}
                </Typography>
                <WorkItemStatusBadge status={item.status} />
              </Stack>
              <Stack
                direction="row"
                spacing={DASH.space2}
                useFlexGap
                flexWrap="wrap"
                alignItems="center"
                mb={1}
              >
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <UserAvatar name={item.assignee} size={22} />
                  <Typography variant="caption" color="text.secondary">
                    {item.assignee}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Plan: {item.plannedDateLabel}
                </Typography>
                {item.status === 'DONE' && (
                  <Typography variant="caption" color="text.secondary">
                    Bitti: {item.completedDateLabel}
                  </Typography>
                )}
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progressFor(item.status)}
                aria-label={`${item.title} ilerleme`}
                sx={{ height: 5, maxWidth: 240 }}
              />
            </Box>
          </Stack>
        </Box>
      ))}
    </Stack>
  )
}

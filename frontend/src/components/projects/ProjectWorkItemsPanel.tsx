import BlockIcon from '@mui/icons-material/Block'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import TimelapseIcon from '@mui/icons-material/Timelapse'
import { Box, Link, Skeleton, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { WorkItemStatusBadge } from '@/components/common/StatusBadges'
import { UserAvatar } from '@/components/common/UserAvatar'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import { mapActiveWorkItems } from '@/utils/projectDetailMapper'
import type { WorkItem } from '@/types/api'

interface ProjectWorkItemsPanelProps {
  items: WorkItem[] | null | undefined
  loading?: boolean
  dense?: boolean
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'DONE') return <CheckCircleOutlineIcon fontSize="small" color="success" />
  if (status === 'IN_PROGRESS') return <TimelapseIcon fontSize="small" color="primary" />
  if (status === 'BLOCKED') return <BlockIcon fontSize="small" color="error" />
  return <RadioButtonUncheckedIcon fontSize="small" color="disabled" />
}

export function ProjectWorkItemsPanel({
  items,
  loading = false,
  dense = false,
}: ProjectWorkItemsPanelProps) {
  const rows = mapActiveWorkItems(items)
  const visible = dense ? rows.slice(0, 5) : rows

  if (loading) {
    return (
      <Stack spacing={1} aria-busy="true" aria-label="İş kalemleri yükleniyor">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={64} />
        ))}
      </Stack>
    )
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<ChecklistOutlinedIcon />}
        title="Aktif iş kalemi bulunmuyor."
        description="Son haftalık rapora bağlı iş kalemleri burada listelenir."
      />
    )
  }

  return (
    <Box>
      <Typography variant="h5" component="h3" mb={0.35}>
        Work Items
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={DASH.space2}>
        Son rapordaki iş kalemleri · öncelik alanı backend’de yok
      </Typography>

      <Stack spacing={DASH.space1} role="list" aria-label="İş kalemleri">
        {visible.map((item) => (
          <Box
            key={item.id}
            role="listitem"
            sx={{
              ...surfaceSx,
              px: DASH.space2,
              py: 1.25,
              display: 'grid',
              gridTemplateColumns: { xs: '24px 1fr', md: '24px 1fr auto' },
              gap: DASH.space2,
              alignItems: 'flex-start',
              transition: 'background-color 160ms ease',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Box sx={{ mt: 0.25 }} aria-hidden>
              <StatusIcon status={item.status} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                alignItems={{ sm: 'center' }}
                mb={0.5}
              >
                <Typography variant="body2" fontWeight={700} noWrap>
                  {item.title}
                </Typography>
                <WorkItemStatusBadge status={item.status} />
              </Stack>
              <Stack direction="row" spacing={DASH.space2} useFlexGap flexWrap="wrap" alignItems="center">
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <UserAvatar name={item.assignee} size={22} />
                  <Typography variant="caption" color="text.secondary">
                    {item.assignee}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Plan: {item.plannedDateLabel}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Bitti: {item.completedDateLabel}
                </Typography>
              </Stack>
              {item.note !== '—' && (
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5} noWrap>
                  Note: {item.note}
                </Typography>
              )}
            </Box>
            <Link
              component={RouterLink}
              to={`/reports/${item.reportId}`}
              underline="hover"
              variant="caption"
              fontWeight={650}
              sx={{ justifySelf: { md: 'end' } }}
            >
              Report
            </Link>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

/** Sprint 2 uyumluluk */
export { ProjectWorkItemsPanel as ProjectWorkItemsChecklist }

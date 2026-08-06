import { Box, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { Link } from '@mui/material'
import { WorkItemStatusBadge } from '@/components/common/StatusBadges'
import { mapActiveWorkItems } from '@/utils/projectDetailMapper'
import type { WorkItem } from '@/types/api'

interface ProjectWorkItemSummaryProps {
  items: WorkItem[] | null | undefined
  loading?: boolean
}

export function ProjectWorkItemSummary({ items, loading = false }: ProjectWorkItemSummaryProps) {
  const rows = mapActiveWorkItems(items)

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        p: 2,
      }}
    >
      <Typography variant="h5" mb={1.5}>
        Aktif iş kalemleri
      </Typography>

      {loading ? (
        <Typography variant="body2" color="text.secondary" aria-busy="true">
          İş kalemleri yükleniyor…
        </Typography>
      ) : rows.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Bu proje için aktif iş kalemi bulunmuyor.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {rows.map((item) => (
            <Box
              key={item.id}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.25 }}
            >
              <Stack direction="row" justifyContent="space-between" gap={1} mb={0.5}>
                <Typography variant="body2" fontWeight={650}>
                  {item.title}
                </Typography>
                <WorkItemStatusBadge status={item.status} />
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block">
                Sorumlu: {item.assignee}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Plan: {item.plannedDateLabel} · Tamamlanma: {item.completedDateLabel}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Not: {item.note}
              </Typography>
              <Typography variant="caption">
                <Link component={RouterLink} to={`/reports/${item.reportId}`} underline="hover">
                  İlişkili rapor
                </Link>
              </Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  )
}

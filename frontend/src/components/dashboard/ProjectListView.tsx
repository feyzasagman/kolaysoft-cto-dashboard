import {
  Box,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { HealthBadge, StatusBadge } from '@/components/common/StatusBadges'
import type { ProjectDashboardRow } from '@/types/api'
import { formatShortDate } from '@/utils/labels'

interface ProjectListViewProps {
  projects: ProjectDashboardRow[]
}

export function ProjectListView({ projects }: ProjectListViewProps) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        overflow: 'auto',
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Proje</TableCell>
            <TableCell>Durum</TableCell>
            <TableCell>Sağlık</TableCell>
            <TableCell>Yönetici</TableCell>
            <TableCell>İlerleme</TableCell>
            <TableCell>Risk</TableCell>
            <TableCell>Son rapor</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.projectId} hover>
              <TableCell>
                <Stack spacing={0.25}>
                  <Link
                    component={RouterLink}
                    to={`/projects/${project.projectId}`}
                    underline="hover"
                    fontWeight={650}
                    color="text.primary"
                  >
                    {project.name}
                  </Link>
                  <Typography variant="caption" color="text.secondary">
                    {project.code}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <StatusBadge status={project.projectStatus} />
              </TableCell>
              <TableCell>
                <HealthBadge health={project.latestHealth} />
              </TableCell>
              <TableCell>{project.managerName ?? '—'}</TableCell>
              <TableCell>{project.progressActual ?? 0}%</TableCell>
              <TableCell>
                {project.openRiskCount}/{project.criticalRiskCount}
              </TableCell>
              <TableCell>{formatShortDate(project.latestReportDate)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}

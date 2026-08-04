import {
  Button,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { HealthBadge, StatusBadge } from '@/components/common/StatusBadges'
import { ProjectActivityStrip } from '@/components/dashboard/ProjectActivityStrip'
import type { ProjectDashboardRow } from '@/types/api'
import { formatShortDate } from '@/utils/labels'
import { buildActivityStripFromProject } from '@/utils/projectActivity'

type SortField = 'name' | 'status' | 'code'

interface ProjectTableProps {
  projects: ProjectDashboardRow[]
  selectedId: number | null
  onSelect: (projectId: number) => void
  sortField: SortField
  sortDir: 'asc' | 'desc'
  onSort: (field: SortField) => void
}

export function ProjectTable({
  projects,
  selectedId,
  onSelect,
  sortField,
  sortDir,
  onSort,
}: ProjectTableProps) {
  const navigate = useNavigate()

  return (
    <TableContainer
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        maxWidth: '100%',
        overflowX: 'auto',
      }}
    >
      <Table size="small" stickyHeader aria-label="Proje tablosu">
        <TableHead>
          <TableRow>
            <TableCell sortDirection={sortField === 'name' ? sortDir : false}>
              <TableSortLabel
                active={sortField === 'name'}
                direction={sortField === 'name' ? sortDir : 'asc'}
                onClick={() => onSort('name')}
              >
                Proje
              </TableSortLabel>
            </TableCell>
            <TableCell>Yönetici</TableCell>
            <TableCell sortDirection={sortField === 'status' ? sortDir : false}>
              <TableSortLabel
                active={sortField === 'status'}
                direction={sortField === 'status' ? sortDir : 'asc'}
                onClick={() => onSort('status')}
              >
                Durum
              </TableSortLabel>
            </TableCell>
            <TableCell>Sağlık</TableCell>
            <TableCell>İlerleme</TableCell>
            <TableCell>Açık risk</TableCell>
            <TableCell>Bu hafta</TableCell>
            <TableCell>Son güncelleme</TableCell>
            <TableCell>Aktivite</TableCell>
            <TableCell align="right">İşlem</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map((project) => {
            const selected = selectedId === project.projectId
            const weeks = buildActivityStripFromProject(project, 12)
            const progress = Math.min(100, Math.max(0, project.progressActual ?? 0))
            return (
              <TableRow
                key={project.projectId}
                hover
                selected={selected}
                onClick={() => onSelect(project.projectId)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={650} noWrap>
                    {project.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {project.code}
                  </Typography>
                </TableCell>
                <TableCell>{project.managerName ?? '—'}</TableCell>
                <TableCell>
                  <StatusBadge status={project.projectStatus} />
                </TableCell>
                <TableCell>
                  <HealthBadge health={project.latestHealth} />
                </TableCell>
                <TableCell sx={{ minWidth: 120 }}>
                  <Typography variant="caption" fontWeight={650}>
                    {progress}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    aria-label={`${project.name} ilerleme ${progress}%`}
                    sx={{
                      mt: 0.5,
                      height: 6,
                      borderRadius: 999,
                      bgcolor: '#EBEDF0',
                      '& .MuiLinearProgress-bar': { borderRadius: 999 },
                    }}
                  />
                </TableCell>
                <TableCell>{project.openRiskCount}</TableCell>
                <TableCell>{project.hasCurrentWeekReport ? 'Var' : 'Yok'}</TableCell>
                <TableCell>{formatShortDate(project.latestReportDate)}</TableCell>
                <TableCell sx={{ minWidth: 150 }} onClick={(e) => e.stopPropagation()}>
                  <ProjectActivityStrip weeks={weeks} compact />
                </TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/projects/${project.projectId}`)}
                    aria-label={`${project.name} detayını aç`}
                  >
                    Aç
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

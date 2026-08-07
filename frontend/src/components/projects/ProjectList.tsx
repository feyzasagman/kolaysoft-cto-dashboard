import { Box, Typography } from '@mui/material'
import { ProjectPortfolioList } from '@/components/portfolio/ProjectPortfolioList'
import type { PortfolioListItem } from '@/components/portfolio/ProjectPortfolioRow'
import type { AssignedProjectRow } from '@/types/api'
import { clampPercent } from '@/utils/dashboardMapper'

interface ProjectListProps {
  projects: AssignedProjectRow[]
  canCreateReport: boolean
}

/** PM görünümü — kart yerine aynı enterprise liste satırı. */
export function ProjectList({ projects, canCreateReport }: ProjectListProps) {
  const rows: PortfolioListItem[] = projects.map((p) => ({
    projectId: p.projectId,
    name: p.name,
    code: p.code,
    managerName: '—',
    projectStatus: p.projectStatus,
    latestHealth: null,
    progressTarget: 0,
    progressActual: clampPercent(0),
    hasCurrentWeekReport: p.hasCurrentWeekReport,
    latestReportDate: null,
    latestReportLabel:
      p.latestReportYear != null && p.latestReportWeek != null
        ? `${p.latestReportYear} / H${p.latestReportWeek}`
        : '—',
  }))

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
        Atanmış projeler — liste görünümü
      </Typography>
      <ProjectPortfolioList
        rows={rows}
        page={0}
        size={rows.length || 10}
        totalPages={1}
        totalElements={rows.length}
        canCreateReport={canCreateReport}
        showSizeSelect={false}
        onPageChange={() => undefined}
      />
    </Box>
  )
}

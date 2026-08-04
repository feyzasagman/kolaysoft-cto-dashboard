import { Box, Button, Card, CardContent, Divider, Stack } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { ProjectActivityStrip } from '@/components/dashboard/ProjectActivityStrip'
import { ProjectCardHeader } from '@/components/dashboard/ProjectCardHeader'
import { ProjectMetrics } from '@/components/dashboard/ProjectMetrics'
import { ProjectProgress } from '@/components/dashboard/ProjectProgress'
import type { ProjectDashboardRow } from '@/types/api'
import { buildActivityStripFromProject } from '@/utils/projectActivity'

interface ProjectCardProps {
  project: ProjectDashboardRow
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate()
  const weeks = buildActivityStripFromProject(project, 12)
  const detailPath = `/projects/${project.projectId}`

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'border-color 120ms ease',
        '&:hover': { borderColor: '#AFB8C1' },
      }}
    >
      <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        <Box
          role="link"
          tabIndex={0}
          onClick={() => navigate(detailPath)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              navigate(detailPath)
            }
          }}
          aria-label={`${project.name} detayına git`}
          sx={{ cursor: 'pointer', outline: 'none', '&:focus-visible': { boxShadow: '0 0 0 2px #1F6F54' } }}
        >
          <Stack spacing={1.75}>
            <ProjectCardHeader project={project} />
            <ProjectProgress target={project.progressTarget} actual={project.progressActual} />
            <ProjectMetrics project={project} />
          </Stack>
        </Box>

        <Divider />
        <ProjectActivityStrip weeks={weeks} />

        <Box>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate(detailPath)}
            aria-label={`${project.name} detayını gör`}
          >
            Detayı Gör
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

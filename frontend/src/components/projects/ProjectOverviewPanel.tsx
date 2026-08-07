import { Box, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { HealthBadge, ProjectStatusBadge } from '@/components/common/StatusBadges'
import { UserAvatar } from '@/components/common/UserAvatar'
import { ProjectProgressHero } from '@/components/projects/ProjectProgressHero'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import type { ProjectDetailViewModel } from '@/utils/projectDetailMapper'

interface ProjectOverviewPanelProps {
  model: ProjectDetailViewModel
  scheduleStatus?: string | null
}

function InfoCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <Box sx={{ ...surfaceSx, p: DASH.cardPadding, height: '100%' }}>
      <Typography variant="h5" component="h3" mb={DASH.space2}>
        {title}
      </Typography>
      {children}
    </Box>
  )
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack spacing={0.35}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={650} component="div">
        {value}
      </Typography>
    </Stack>
  )
}

export function ProjectOverviewPanel({ model, scheduleStatus }: ProjectOverviewPanelProps) {
  return (
    <Stack spacing={DASH.space3}>
      <Box
        sx={{
          display: 'grid',
          gap: DASH.space3,
          gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' },
        }}
      >
        <InfoCard title="Project Summary">
          <Stack spacing={DASH.space2}>
            <Field label="Description" value={model.description} />
            <Field
              label="Manager"
              value={
                <Stack direction="row" spacing={1} alignItems="center">
                  <UserAvatar name={model.managerName} size={28} />
                  <Box>
                    <Typography variant="body2" fontWeight={650}>
                      {model.managerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {model.managerEmail}
                    </Typography>
                  </Box>
                </Stack>
              }
            />
            <Stack direction="row" spacing={DASH.space2} useFlexGap flexWrap="wrap">
              <Field label="Current Status" value={<ProjectStatusBadge status={model.projectStatus} />} />
              <Field label="Health" value={<HealthBadge health={model.health} />} />
            </Stack>
            <Stack direction="row" spacing={DASH.space3} useFlexGap flexWrap="wrap">
              <Field label="Started" value={model.startDateLabel} />
              <Field label="Target end" value={model.targetEndDateLabel} />
              <Field label="Completion" value={`${model.progressActual}%`} />
            </Stack>
          </Stack>
        </InfoCard>

        <ProjectProgressHero model={model} scheduleStatus={scheduleStatus} />
      </Box>
    </Stack>
  )
}

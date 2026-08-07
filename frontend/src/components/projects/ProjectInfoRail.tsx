import { Box, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import {
  HealthBadge,
  ProjectStatusBadge,
  ReportAvailabilityBadge,
} from '@/components/common/StatusBadges'
import { UserAvatar } from '@/components/common/UserAvatar'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import type { ProjectDetailViewModel } from '@/utils/projectDetailMapper'

interface ProjectInfoRailProps {
  model: ProjectDetailViewModel
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '110px 1fr',
        gap: 1,
        py: 0.85,
        borderBottom: DASH.border,
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 0 },
      }}
    >
      <Typography variant="caption" color="text.secondary" fontWeight={650}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={650} component="div" sx={{ minWidth: 0 }}>
        {children}
      </Typography>
    </Box>
  )
}

/** Secondary panel — definition list (ProjectInfoPanel). */
export function ProjectInfoRail({ model }: ProjectInfoRailProps) {
  return (
    <Box
      component="aside"
      aria-label="Proje bilgileri"
      sx={{
        ...surfaceSx,
        p: DASH.cardPadding,
        position: { lg: 'sticky' },
        top: { lg: 72 },
      }}
    >
      <Typography variant="h5" component="h3" mb={0.35}>
        Project Information
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={DASH.space2}>
        Temel proje meta verisi
      </Typography>

      <Stack>
        <Row label="Code">{model.code}</Row>
        <Row label="Customer">{model.customer}</Row>
        <Row label="Manager">
          <Stack direction="row" spacing={1} alignItems="center">
            <UserAvatar name={model.managerName} size={24} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={650} noWrap>
                {model.managerName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {model.managerEmail}
              </Typography>
            </Box>
          </Stack>
        </Row>
        <Row label="Status">
          <ProjectStatusBadge status={model.projectStatus} />
        </Row>
        <Row label="Health">
          <HealthBadge health={model.health} />
        </Row>
        <Row label="Start">{model.startDateLabel}</Row>
        <Row label="Target End">{model.targetEndDateLabel}</Row>
        <Row label="Latest Report">{model.lastUpdateLabel}</Row>
        <Row label="Current Week">
          <ReportAvailabilityBadge available={model.hasCurrentWeekReport} />
        </Row>
        <Row label="Week label">{model.currentWeekLabel}</Row>
      </Stack>

      {model.description !== '—' && (
        <Box mt={DASH.space2}>
          <Typography variant="caption" color="text.secondary" fontWeight={650} display="block" mb={0.5}>
            Description
          </Typography>
          <Typography variant="body2" color="text.secondary" whiteSpace="pre-wrap">
            {model.description}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export { ProjectInfoRail as ProjectInfoPanel }

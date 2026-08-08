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
        Proje Bilgileri
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={DASH.space2}>
        Temel proje meta verisi
      </Typography>

      <Stack>
        <Row label="Kod">{model.code}</Row>
        <Row label="Müşteri">{model.customer}</Row>
        <Row label="Yönetici">
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
        <Row label="Durum">
          <ProjectStatusBadge status={model.projectStatus} />
        </Row>
        <Row label="Sağlık">
          <HealthBadge health={model.health} />
        </Row>
        <Row label="Başlangıç">{model.startDateLabel}</Row>
        <Row label="Hedef Bitiş">{model.targetEndDateLabel}</Row>
        <Row label="Son Rapor">{model.lastUpdateLabel}</Row>
        <Row label="Bu Hafta">
          <ReportAvailabilityBadge available={model.hasCurrentWeekReport} />
        </Row>
        <Row label="Hafta">{model.currentWeekLabel}</Row>
      </Stack>

      {model.description !== '—' && (
        <Box mt={DASH.space2}>
          <Typography variant="caption" color="text.secondary" fontWeight={650} display="block" mb={0.5}>
            Açıklama
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

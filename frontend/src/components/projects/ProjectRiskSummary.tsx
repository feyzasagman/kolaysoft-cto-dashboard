import { Box, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { Link } from '@mui/material'
import { RiskLevelBadge, RiskStatusBadge } from '@/components/common/StatusBadges'
import { mapRiskPreview } from '@/utils/projectDetailMapper'
import type { RiskIssue } from '@/types/api'

interface ProjectRiskSummaryProps {
  risks: RiskIssue[] | null | undefined
  openRiskCount: number
  openBlockerCount: number
  loading?: boolean
}

export function ProjectRiskSummary({
  risks,
  openRiskCount,
  openBlockerCount,
  loading = false,
}: ProjectRiskSummaryProps) {
  const items = mapRiskPreview(risks)

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
      <Typography variant="h5" mb={0.5}>
        Riskler ve engeller
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
        Açık risk: {openRiskCount} · Blocker: {openBlockerCount}
      </Typography>

      {loading ? (
        <Typography variant="body2" color="text.secondary" aria-busy="true">
          Riskler yükleniyor…
        </Typography>
      ) : items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Bu proje için açık risk veya engel bulunmuyor.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {items.map((item) => (
            <Box
              key={item.id}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.25 }}
            >
              <Typography variant="body2" fontWeight={650} mb={0.5}>
                {item.title}
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" mb={0.5}>
                <RiskLevelBadge level={item.riskLevel} />
                <RiskStatusBadge status={item.status} />
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block">
                Aksiyon: {item.actionPlan}
              </Typography>
              <Typography variant="caption">
                <Link component={RouterLink} to={`/reports/${item.reportId}`} underline="hover">
                  Rapora git
                </Link>
              </Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  )
}

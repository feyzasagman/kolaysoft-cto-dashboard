import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import {
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { HealthBadge, ReportAvailabilityBadge } from '@/components/common/StatusBadges'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import type { PortfolioRow } from '@/utils/dashboardTypes'
import { buildPortfolioAttentionItems } from '@/utils/executiveInsight'

interface PortfolioAttentionCenterProps {
  rows: PortfolioRow[]
  detailQuerySuffix?: string
  loading?: boolean
}

/**
 * Dashboard — Dikkat Gerektiren Projeler (UI-only sıralama).
 * Mevcut portfolio query satırlarını kullanır; yeni API yok.
 */
export function PortfolioAttentionCenter({
  rows,
  detailQuerySuffix = '',
  loading = false,
}: PortfolioAttentionCenterProps) {
  const navigate = useNavigate()
  const items = useMemo(() => buildPortfolioAttentionItems(rows), [rows])

  return (
    <Box
      sx={{ ...surfaceSx, p: { xs: DASH.space2, md: DASH.cardPadding }, overflow: 'hidden' }}
      aria-label="Dikkat gerektiren projeler"
      className="fade-in-up"
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'flex-start' }}
        spacing={1}
        mb={DASH.space2}
      >
        <Box>
          <Typography variant="h5" component="h2">
            Dikkat Gerektiren Projeler
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
            Mevcut portföy verisinden türetilen öncelik listesi · yeni hesaplama alanı kaydedilmez
          </Typography>
        </Box>
        {!loading && items.length > 0 && (
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {items.length} proje
          </Typography>
        )}
      </Stack>

      {loading ? (
        <Typography variant="body2" color="text.secondary" aria-busy="true">
          Öncelik listesi yükleniyor…
        </Typography>
      ) : items.length === 0 ? (
        <EmptyState
          title="Şu anda öncelikli müdahale gerektiren proje bulunmuyor."
          description="Sağlık, kritik risk, rapor eksikliği veya belirgin ilerleme geriliği olan projeler burada listelenir."
        />
      ) : (
        <Stack spacing={DASH.space1}>
          {/* Desktop header */}
          <Box
            sx={{
              display: { xs: 'none', md: 'grid' },
              gridTemplateColumns: 'minmax(0, 2fr) 100px 90px 90px 100px minmax(0, 1.4fr) auto',
              gap: DASH.space1,
              px: DASH.space2,
              py: 1,
              borderBottom: DASH.border,
              borderColor: 'divider',
            }}
            aria-hidden
          >
            {['Proje', 'Sağlık', 'Fark', 'Kritik', 'Rapor', 'Neden', ''].map((h) => (
              <Typography key={h || 'act'} variant="caption" color="text.secondary" fontWeight={650}>
                {h}
              </Typography>
            ))}
          </Box>

          {items.map((item) => {
            const gapLabel =
              item.progressGap > 0
                ? `−${item.progressGap} puan`
                : item.progressGap < 0
                  ? `+${Math.abs(item.progressGap)} puan`
                  : '0 puan'
            const to = `/projects/${item.projectId}${detailQuerySuffix}`

            return (
              <Box
                key={item.projectId}
                sx={{
                  border: DASH.border,
                  borderColor: 'divider',
                  borderRadius: 1,
                  px: DASH.space2,
                  py: 1.5,
                  transition: 'background-color 160ms ease, border-color 160ms ease',
                  '&:hover': { bgcolor: 'action.hover', borderColor: '#AFB8C1' },
                  display: { xs: 'block', md: 'grid' },
                  gridTemplateColumns: {
                    md: 'minmax(0, 2fr) 100px 90px 90px 100px minmax(0, 1.4fr) auto',
                  },
                  gap: DASH.space1,
                  alignItems: 'center',
                }}
              >
                <Box sx={{ minWidth: 0, mb: { xs: 1, md: 0 } }}>
                  <Typography variant="body2" fontWeight={700} noWrap title={item.name}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.code}
                  </Typography>
                </Box>

                <Box sx={{ display: { xs: 'inline-flex', md: 'block' }, mr: { xs: 1, md: 0 } }}>
                  <HealthBadge health={item.health} />
                </Box>

                <Typography
                  variant="body2"
                  fontWeight={650}
                  aria-label={`İlerleme farkı ${gapLabel}`}
                  sx={{ display: { xs: 'inline', md: 'block' }, mr: { xs: 1.5, md: 0 } }}
                >
                  <Box component="span" sx={{ display: { md: 'none' }, color: 'text.secondary', mr: 0.5 }}>
                    Fark:
                  </Box>
                  {gapLabel}
                </Typography>

                <Typography
                  variant="body2"
                  fontWeight={650}
                  aria-label={`Kritik risk sayısı ${item.criticalRiskCount}`}
                  sx={{ display: { xs: 'inline', md: 'block' }, mr: { xs: 1.5, md: 0 } }}
                >
                  <Box component="span" sx={{ display: { md: 'none' }, color: 'text.secondary', mr: 0.5 }}>
                    Kritik:
                  </Box>
                  {item.criticalRiskCount}
                </Typography>

                <Box sx={{ display: { xs: 'inline-flex', md: 'block' }, my: { xs: 1, md: 0 } }}>
                  <ReportAvailabilityBadge available={item.hasCurrentWeekReport} />
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  title={item.reason}
                  sx={{
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: { md: 'nowrap' },
                    mb: { xs: 1, md: 0 },
                  }}
                  aria-label={`Neden: ${item.reason}`}
                >
                  {item.reason}
                </Typography>

                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<ArrowForwardIcon fontSize="small" />}
                  onClick={() => navigate(to)}
                  aria-label={`${item.name} projesini gör`}
                  sx={{ justifySelf: { md: 'end' }, whiteSpace: 'nowrap' }}
                >
                  Projeyi Gör
                </Button>
              </Box>
            )
          })}
        </Stack>
      )}
    </Box>
  )
}

/**
 * Enterprise spacing / surface tokens — 8pt grid.
 * Sprint 1–5 ortak dil; yeni tasarım sistemi üretme.
 */
export const DASH = {
  space1: 1, // 8
  space2: 2, // 16
  space3: 3, // 24
  space4: 4, // 32
  sectionGap: 4, // 32 between major sections
  cardGap: 2, // 16 between cards
  cardPadding: 2.5, // 20 — slightly airy inside cards
  headerPaddingY: 2.5,
  controlHeight: 36,
  pageMaxWidth: 1280,
  kpiMinHeight: 148,
  panelMinHeight: 280,
  border: '1px solid',
  radius: 1.5,
  hoverLift: 'translateY(-1px)',
  mutedBg: '#F6F8FA',
  subtleBg: '#FBFCFD',
} as const

export const kpiGridSx = {
  display: 'grid',
  gap: DASH.cardGap,
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, minmax(0, 1fr))',
    md: 'repeat(3, minmax(0, 1fr))',
  },
} as const

export const twoColGridSx = {
  display: 'grid',
  gap: DASH.space3,
  gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
} as const

export const surfaceSx = {
  bgcolor: 'background.paper',
  border: DASH.border,
  borderColor: 'divider',
  borderRadius: DASH.radius,
  boxShadow: 1,
} as const

import { Box, Tab, Tabs } from '@mui/material'
import type { SyntheticEvent } from 'react'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'

export type ProjectDetailTabId =
  | 'overview'
  | 'reports'
  | 'risks'
  | 'workItems'
  | 'history'

export const PROJECT_DETAIL_TABS: Array<{ id: ProjectDetailTabId; label: string }> = [
  { id: 'overview', label: 'Genel Bakış' },
  { id: 'reports', label: 'Raporlar' },
  { id: 'risks', label: 'Riskler' },
  { id: 'workItems', label: 'İş Kalemleri' },
  { id: 'history', label: 'Geçmiş' },
]

interface ProjectDetailTabsProps {
  value: ProjectDetailTabId
  onChange: (next: ProjectDetailTabId) => void
}

export function ProjectDetailTabs({ value, onChange }: ProjectDetailTabsProps) {
  const handleChange = (_: SyntheticEvent, next: ProjectDetailTabId) => {
    onChange(next)
  }

  return (
    <Box
      sx={{
        ...surfaceSx,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottom: 0,
        position: { md: 'sticky' },
        top: { md: 56 },
        zIndex: 2,
        bgcolor: '#FBFCFD',
      }}
    >
      <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Proje komuta merkezi sekmeleri"
        sx={{
          px: DASH.space1,
          minHeight: 44,
          '& .MuiTab-root': { minHeight: 44 },
          '& .Mui-selected': { fontWeight: 700 },
        }}
      >
        {PROJECT_DETAIL_TABS.map((tab) => (
          <Tab
            key={tab.id}
            value={tab.id}
            label={tab.label}
            id={`project-tab-${tab.id}`}
            aria-controls={`project-tabpanel-${tab.id}`}
          />
        ))}
      </Tabs>
    </Box>
  )
}

export function isProjectDetailTab(value: string | null): value is ProjectDetailTabId {
  return PROJECT_DETAIL_TABS.some((t) => t.id === value)
}

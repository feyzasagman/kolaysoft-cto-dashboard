import AddIcon from '@mui/icons-material/Add'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import { Box, Button, Stack, Tooltip, Typography } from '@mui/material'
import { DASH, surfaceSx } from '@/theme/dashboardTokens'
import { formatRelativeTime } from '@/utils/formatRelative'

interface ProjectPortfolioHeaderProps {
  totalProjects: number
  activeProjects: number
  lastRefreshedAt?: Date | null
  refreshing?: boolean
  canCreateProject?: boolean
  onRefresh: () => void
  onCreateProject?: () => void
  onExport?: () => void
}

export function ProjectPortfolioHeader({
  totalProjects,
  activeProjects,
  lastRefreshedAt = null,
  refreshing = false,
  canCreateProject = false,
  onRefresh,
  onCreateProject,
  onExport,
}: ProjectPortfolioHeaderProps) {
  return (
    <Box
      component="header"
      className="fade-in"
      sx={{
        ...surfaceSx,
        px: { xs: DASH.space2, md: DASH.space3 },
        py: { xs: DASH.space2, md: DASH.space3 },
        mb: DASH.sectionGap,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ md: 'flex-start' }}
        spacing={DASH.space2}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h1" component="h1">
            Projects
          </Typography>
          <Typography color="text.secondary" mt={0.75} maxWidth={640}>
            Kurumsal proje portföyü — sağlık, ilerleme ve haftalık rapor durumu.
          </Typography>
          <Stack
            direction="row"
            spacing={DASH.space2}
            useFlexGap
            flexWrap="wrap"
            mt={DASH.space2}
            alignItems="center"
          >
            <Typography variant="body2" fontWeight={650}>
              {totalProjects} proje
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ·
            </Typography>
            <Typography variant="body2" fontWeight={650} color="success.dark">
              {activeProjects} aktif
            </Typography>
            <Typography variant="caption" color="text.secondary" aria-live="polite">
              {lastRefreshedAt
                ? `Son güncelleme ${formatRelativeTime(lastRefreshedAt)}`
                : 'Son güncelleme —'}
            </Typography>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Projeleri yenile"
          >
            {refreshing ? 'Yenileniyor…' : 'Refresh'}
          </Button>
          <Tooltip
            title={
              canCreateProject
                ? 'Yeni proje oluşturma ekranı yakında'
                : 'Bu işlem için yetkiniz yok'
            }
          >
            <span>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                disabled={!canCreateProject || !onCreateProject}
                onClick={onCreateProject}
                aria-label="Yeni proje"
              >
                Yeni Proje
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Export yakında">
            <span>
              <Button
                variant="outlined"
                startIcon={<FileDownloadOutlinedIcon />}
                onClick={onExport}
                disabled={!onExport}
                aria-label="Dışa aktar"
              >
                Export
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  )
}

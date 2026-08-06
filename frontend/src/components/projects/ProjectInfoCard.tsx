import { Box, Stack, Typography } from '@mui/material'
import type { ProjectDetailViewModel } from '@/utils/projectDetailMapper'

interface ProjectInfoCardProps {
  model: ProjectDetailViewModel
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.5} justifyContent="space-between">
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} textAlign={{ sm: 'right' }}>
        {value}
      </Typography>
    </Stack>
  )
}

export function ProjectInfoCard({ model }: ProjectInfoCardProps) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        p: 2,
        height: '100%',
      }}
    >
      <Typography variant="h5" mb={1.5}>
        Temel proje bilgileri
      </Typography>
      <Stack spacing={1.25}>
        <Row label="Proje ID" value={model.projectId} />
        <Row label="Proje kodu" value={model.code} />
        <Row label="Proje adı" value={model.name} />
        <Row label="Müşteri" value={model.customer} />
        <Row label="Açıklama" value={model.description} />
        <Row label="Proje yöneticisi" value={model.managerName} />
        <Row label="Yönetici e-posta" value={model.managerEmail} />
        <Row label="Başlangıç" value={model.startDateLabel} />
        <Row label="Hedef bitiş" value={model.targetEndDateLabel} />
        <Row label="Durum" value={model.projectStatusLabel} />
        <Row label="Son rapor tarihi" value={model.lastUpdateLabel} />
        <Row
          label="Mevcut hafta raporu"
          value={model.hasCurrentWeekReport ? 'Var' : 'Yok'}
        />
      </Stack>
    </Box>
  )
}

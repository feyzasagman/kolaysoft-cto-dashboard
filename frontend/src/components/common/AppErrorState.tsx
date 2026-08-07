import {
  CloudOffOutlined,
  ErrorOutline,
  LockOutlined,
  SearchOffOutlined,
  TimerOffOutlined,
  WarningAmberOutlined,
} from '@mui/icons-material'
import { Box, Button, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

export type AppErrorKind =
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'timeout'
  | 'generic'

interface AppErrorStateProps {
  kind?: AppErrorKind
  title?: string
  description?: string
  onRetry?: () => void
  secondaryAction?: ReactNode
}

const COPY: Record<
  AppErrorKind,
  { title: string; description: string; icon: ReactNode; tone: string }
> = {
  network: {
    title: 'Ağ hatası',
    description: 'Sunucuya ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin.',
    icon: <CloudOffOutlined sx={{ fontSize: 36 }} />,
    tone: '#656D76',
  },
  unauthorized: {
    title: 'Oturum gerekli',
    description: 'Bu içeriği görmek için yeniden giriş yapmanız gerekebilir.',
    icon: <LockOutlined sx={{ fontSize: 36 }} />,
    tone: '#9A6700',
  },
  forbidden: {
    title: 'Erişim engellendi',
    description: 'Bu sayfayı görüntülemek için yetkiniz yok.',
    icon: <WarningAmberOutlined sx={{ fontSize: 36 }} />,
    tone: '#CF222E',
  },
  notFound: {
    title: 'Bulunamadı',
    description: 'Aradığınız kaynak mevcut değil veya taşınmış olabilir.',
    icon: <SearchOffOutlined sx={{ fontSize: 36 }} />,
    tone: '#656D76',
  },
  timeout: {
    title: 'İstek zaman aşımı',
    description: 'Sunucu yanıt vermedi. Lütfen kısa süre sonra tekrar deneyin.',
    icon: <TimerOffOutlined sx={{ fontSize: 36 }} />,
    tone: '#9A6700',
  },
  generic: {
    title: 'Bir sorun oluştu',
    description: 'Veriler alınamadı. Lütfen tekrar deneyin.',
    icon: <ErrorOutline sx={{ fontSize: 36 }} />,
    tone: '#CF222E',
  },
}

export function AppErrorState({
  kind = 'generic',
  title,
  description,
  onRetry,
  secondaryAction,
}: AppErrorStateProps) {
  const preset = COPY[kind]

  return (
    <Box
      role="alert"
      className="fade-in"
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        px: 3,
        py: 4,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 1.5,
          display: 'grid',
          placeItems: 'center',
          mx: 'auto',
          mb: 1.5,
          bgcolor: `${preset.tone}14`,
          color: preset.tone,
          border: '1px solid',
          borderColor: 'divider',
        }}
        aria-hidden
      >
        {preset.icon}
      </Box>
      <Typography variant="h5" component="h2" mb={0.75}>
        {title ?? preset.title}
      </Typography>
      <Typography color="text.secondary" mb={2.5} maxWidth={420} mx="auto">
        {description ?? preset.description}
      </Typography>
      <Stack direction="row" spacing={1} justifyContent="center" useFlexGap flexWrap="wrap">
        {onRetry && (
          <Button variant="contained" onClick={onRetry} aria-label="Tekrar dene">
            Tekrar Dene
          </Button>
        )}
        {secondaryAction}
      </Stack>
    </Box>
  )
}

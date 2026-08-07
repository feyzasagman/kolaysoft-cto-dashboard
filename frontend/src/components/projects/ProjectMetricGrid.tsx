import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import { Box } from '@mui/material'
import { ProjectMetricCard } from '@/components/projects/ProjectMetricCard'
import { DASH } from '@/theme/dashboardTokens'

interface ProjectMetricGridProps {
  progressActual: number
  progressTarget: number
  openRisks: number
  criticalRisks: number
  openWorkItems: number
  reportCount: number
}

export function ProjectMetricGrid({
  progressActual,
  progressTarget,
  openRisks,
  criticalRisks,
  openWorkItems,
  reportCount,
}: ProjectMetricGridProps) {
  const items = [
    {
      key: 'actual',
      label: 'Gerçekleşen İlerleme',
      value: `${progressActual}%`,
      hint: 'Son rapora göre',
      icon: <TrendingUpOutlinedIcon sx={{ fontSize: 16 }} />,
      tone: '#0969DA',
    },
    {
      key: 'target',
      label: 'Hedef İlerleme',
      value: `${progressTarget}%`,
      hint: 'Planlanan tamamlanma',
      icon: <FlagOutlinedIcon sx={{ fontSize: 16 }} />,
      tone: '#656D76',
    },
    {
      key: 'openRisks',
      label: 'Açık Risk',
      value: openRisks,
      hint: 'Çözülmemiş riskler',
      icon: <WarningAmberOutlinedIcon sx={{ fontSize: 16 }} />,
      tone: '#9A6700',
    },
    {
      key: 'critical',
      label: 'Kritik Risk',
      value: criticalRisks,
      hint: 'Son rapordaki kritik açıklar',
      icon: <ReportProblemOutlinedIcon sx={{ fontSize: 16 }} />,
      tone: '#CF222E',
    },
    {
      key: 'work',
      label: 'Açık İş Kalemi',
      value: openWorkItems,
      hint: 'TODO / devam / engelli',
      icon: <TaskAltOutlinedIcon sx={{ fontSize: 16 }} />,
      tone: '#0550AE',
    },
    {
      key: 'reports',
      label: 'Haftalık Rapor Sayısı',
      value: reportCount,
      hint: 'Kayıtlı rapor sayısı',
      icon: <AssessmentOutlinedIcon sx={{ fontSize: 16 }} />,
      tone: '#1A7F37',
    },
  ]

  return (
    <Box
      className="fade-in-up"
      aria-label="Proje özet metrikleri"
      sx={{
        display: 'grid',
        gap: DASH.cardGap,
        gridTemplateColumns: {
          xs: '1fr 1fr',
          sm: 'repeat(3, minmax(0, 1fr))',
          md: 'repeat(6, minmax(0, 1fr))',
        },
        mb: DASH.space3,
      }}
    >
      {items.map((item) => (
        <ProjectMetricCard
          key={item.key}
          label={item.label}
          value={item.value}
          hint={item.hint}
          icon={item.icon}
          tone={item.tone}
        />
      ))}
    </Box>
  )
}

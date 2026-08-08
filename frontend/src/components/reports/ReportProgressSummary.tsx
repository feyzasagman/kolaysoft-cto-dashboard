import { Box } from '@mui/material'
import { ProgressComparison } from '@/components/common/ProgressComparison'

interface ReportProgressSummaryProps {
  planned: number | null | undefined
  actual: number | null | undefined
}

export function ReportProgressSummary({ planned, actual }: ReportProgressSummaryProps) {
  return (
    <Box
      aria-label="İlerleme özeti"
      sx={{
        maxWidth: 480,
        p: 1.5,
        borderRadius: 1.25,
        bgcolor: '#F6F8FA',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <ProgressComparison planned={planned} actual={actual} compact />
    </Box>
  )
}

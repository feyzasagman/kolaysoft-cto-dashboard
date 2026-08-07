import { AppErrorState } from '@/components/common/AppErrorState'

interface DashboardErrorStateProps {
  title?: string
  onRetry?: () => void
}

export function DashboardErrorState({ title, onRetry }: DashboardErrorStateProps) {
  return (
    <AppErrorState
      kind="generic"
      title={title ?? 'Dashboard verileri alınamadı.'}
      onRetry={onRetry}
    />
  )
}

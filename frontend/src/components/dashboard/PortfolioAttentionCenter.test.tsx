import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render'
import { PortfolioAttentionCenter } from '@/components/dashboard/PortfolioAttentionCenter'
import type { PortfolioRow } from '@/utils/dashboardTypes'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

function row(overrides: Partial<PortfolioRow> = {}): PortfolioRow {
  return {
    id: 2,
    projectId: 2,
    name: 'E2E Attention Project',
    code: 'ATT-01',
    managerName: 'Demo PM',
    projectStatus: 'ACTIVE',
    latestHealth: 'YELLOW',
    progressTarget: 70,
    progressActual: 55,
    openRiskCount: 1,
    criticalRiskCount: 0,
    hasCurrentWeekReport: true,
    latestReportDate: '2026-08-13',
    latestReportLabel: '2026-W33',
    ...overrides,
  }
}

describe('PortfolioAttentionCenter', () => {
  it('shows attention project, reason and navigation action', () => {
    const { getByLabelText, getByRole, getByText } = renderWithProviders(
      <PortfolioAttentionCenter rows={[row()]} />,
    )

    expect(getByLabelText('Dikkat gerektiren projeler')).toBeInTheDocument()
    expect(getByRole('heading', { name: 'Dikkat Gerektiren Projeler' })).toBeInTheDocument()
    expect(getByText('E2E Attention Project')).toBeInTheDocument()
    expect(getByLabelText(/Neden:/)).toHaveTextContent(/Dikkat gerektiren sağlık/)
    expect(getByRole('button', { name: 'E2E Attention Project projesini gör' })).toBeInTheDocument()
  })

  it('shows empty state when no attention items', () => {
    const { getByText } = renderWithProviders(
      <PortfolioAttentionCenter
        rows={[
          row({
            projectId: 1,
            name: 'Healthy',
            latestHealth: 'GREEN',
            progressTarget: 70,
            progressActual: 70,
            openRiskCount: 0,
            criticalRiskCount: 0,
            hasCurrentWeekReport: true,
          }),
        ]}
      />,
    )

    expect(
      getByText('Şu anda öncelikli müdahale gerektiren proje bulunmuyor.'),
    ).toBeInTheDocument()
  })

  it('navigates when Projeyi Gör is clicked', async () => {
    navigateMock.mockReset()
    const user = userEvent.setup()
    const { getAllByRole } = renderWithProviders(
      <PortfolioAttentionCenter rows={[row({ projectId: 42 })]} detailQuerySuffix="?from=dashboard" />,
    )

    const buttons = getAllByRole('button', { name: 'E2E Attention Project projesini gör' })
    await user.click(buttons[0])
    expect(navigateMock).toHaveBeenCalledWith('/projects/42?from=dashboard')
  })
})

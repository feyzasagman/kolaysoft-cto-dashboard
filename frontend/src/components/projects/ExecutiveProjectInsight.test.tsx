import { describe, expect, it } from 'vitest'
import { within } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import { ExecutiveProjectInsight } from '@/components/projects/ExecutiveProjectInsight'

describe('ExecutiveProjectInsight', () => {
  it('renders YELLOW insight headline, summary and signals', () => {
    const { getByRole, getByLabelText, getByText } = renderWithProviders(
      <ExecutiveProjectInsight
        progressTarget={70}
        progressActual={55}
        health="YELLOW"
        openRiskCount={1}
        criticalRiskCount={0}
        openWorkItems={1}
        hasCurrentWeekReport
        hasAnyReport
      />,
    )

    const section = getByLabelText('Yönetici özeti: İzleme ve takip önerilir')
    expect(getByText('Yönetici Özeti')).toBeInTheDocument()
    expect(getByRole('heading', { level: 2, name: 'İzleme ve takip önerilir' })).toBeInTheDocument()
    expect(within(section).getByLabelText('Önem seviyesi: Dikkat')).toBeInTheDocument()
    expect(within(section).getByLabelText('Hedef Farkı: −15 puan')).toBeInTheDocument()
    expect(within(section).getByLabelText('Risk Durumu: 1 açık')).toBeInTheDocument()
    expect(within(section).getByText('Hedef Farkı')).toBeInTheDocument()
    expect(getByText(/15 puan gerisinde/i)).toBeInTheDocument()
  })

  it('does not crash with nullish health / zero progress', () => {
    const { getByLabelText } = renderWithProviders(
      <ExecutiveProjectInsight
        progressTarget={0}
        progressActual={0}
        health={null}
        openRiskCount={0}
        criticalRiskCount={0}
        openWorkItems={0}
        hasCurrentWeekReport={false}
        hasAnyReport={false}
      />,
    )

    const section = getByLabelText(/^Yönetici özeti:/)
    expect(section).toBeInTheDocument()
    expect(within(section).getByRole('heading', { level: 2 })).toBeInTheDocument()
    expect(within(section).getByLabelText('Hedef Farkı: Veri yok')).toBeInTheDocument()
  })
})

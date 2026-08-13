import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'
import { HealthBadge, RiskLevelBadge, RoleBadge, StatusBadge } from '@/components/common/StatusBadges'

describe('StatusBadges', () => {
  it('renders role labels with accessible name', () => {
    const { getByLabelText } = renderWithProviders(<RoleBadge role="PROJECT_MANAGER" />)
    expect(getByLabelText('Rol: Proje Yöneticisi')).toHaveTextContent('Proje Yöneticisi')
  })

  it('renders ADMIN role text', () => {
    const { getByLabelText } = renderWithProviders(<RoleBadge role="ADMIN" />)
    expect(getByLabelText('Rol: Yönetici')).toHaveTextContent('Yönetici')
  })

  it('renders CTO role text', () => {
    const { getByLabelText } = renderWithProviders(<RoleBadge role="CTO" />)
    expect(getByLabelText('Rol: CTO')).toHaveTextContent('CTO')
  })

  it('renders health labels', () => {
    const { getByLabelText } = renderWithProviders(<HealthBadge health="YELLOW" />)
    expect(getByLabelText('Sağlık: Dikkat')).toHaveTextContent('Dikkat')
  })

  it('renders project status and risk level labels', () => {
    const { getByLabelText } = renderWithProviders(
      <>
        <StatusBadge status="ACTIVE" />
        <RiskLevelBadge level="CRITICAL" />
      </>,
    )
    expect(getByLabelText('Durum: Aktif')).toHaveTextContent('Aktif')
    expect(getByLabelText('Risk seviyesi: Kritik')).toHaveTextContent('Kritik')
  })
})

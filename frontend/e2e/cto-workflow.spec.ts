import { expect, test } from '@playwright/test'
import { expectLoggedInRedirect, loginAs } from './helpers/auth'
import { loadJourneyState } from './helpers/testData'

test.describe('CTO workflow', () => {
  test('dashboard → detail → read-only executive insight', async ({ page }) => {
    const state = loadJourneyState()

    await loginAs(page, state.cto)
    await expectLoggedInRedirect(page, /\/dashboard/)

    await expect(page.getByRole('heading', { name: 'Kontrol Paneli' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Dikkat Gerektiren Projeler' })).toBeVisible()

    await page.getByLabel('Ana menü').getByRole('link', { name: 'Kullanıcılar' }).click()
    await expect(page.getByRole('heading', { name: 'Kullanıcılar' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Yeni Kullanıcı' })).toHaveCount(0)

    await page.getByLabel('Ana menü').getByRole('link', { name: 'Kontrol Paneli' }).click()
    await page.getByLabel('Proje ara').fill(state.project.code)
    await expect(page.getByLabel('Proje portföy tablosu').getByText(state.project.name)).toBeVisible()

    await page.goto(`/projects/${state.project.id}?from=dashboard`)
    await expect(page.getByRole('heading', { name: state.project.name })).toBeVisible()
    await expect(page.getByText(state.pm.fullName).first()).toBeVisible()

    await page.getByRole('tab', { name: 'Ekip' }).click()
    await expect(page.getByText(state.pm.fullName).first()).toBeVisible()
    await expect(page.getByText(state.teammate.fullName).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Kullanıcı ata' })).toHaveCount(0)

    await page.getByRole('tab', { name: 'Genel Bakış' }).click()
    await expect(page.getByText('Yönetici Özeti')).toBeVisible()
    await expect(page.getByLabel(/Yönetici özeti/i)).toBeVisible()

    await expect(page.getByRole('button', { name: 'Düzenle' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Haftalık rapor oluştur' })).toHaveCount(0)
  })
})

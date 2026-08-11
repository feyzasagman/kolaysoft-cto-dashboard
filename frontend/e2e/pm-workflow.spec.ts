import { expect, test } from '@playwright/test'
import { expectLoggedInRedirect, loginAs } from './helpers/auth'
import { loadJourneyState, updateJourneyState } from './helpers/testData'

test.describe('PM workflow', () => {
  test('atanmış proje → haftalık rapor → detail yansıması', async ({ page }) => {
    const state = loadJourneyState()

    await loginAs(page, state.pm)
    await expectLoggedInRedirect(page, /\/projects/)

    await expect(page.getByRole('button', { name: 'Yeni proje' })).toHaveCount(0)

    // Rol sınırı: dashboard / users route koruması
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/unauthorized/)
    await page.goto('/users')
    await expect(page).toHaveURL(/\/unauthorized/)

    await page.goto(`/projects/${state.project.id}`)
    await expect(page.getByRole('heading', { name: state.project.name })).toBeVisible()
    await expect(page.getByText(state.pm.fullName).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Düzenle' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Kullanıcı ata' })).toHaveCount(0)

    await page.getByLabel('Ana menü').getByRole('link', { name: 'Projeler' }).click()
    await expect(page.getByText(state.project.name)).toBeVisible()

    await page.goto(`/reports/new?projectId=${state.project.id}`)
    await expect(page.getByRole('heading', { name: 'Yeni Haftalık Rapor' })).toBeVisible()

    await page.getByLabel('Hedeflenen İlerleme (%)').fill('40')
    await page.getByLabel('Gerçekleşen İlerleme (%)').fill('38')
    await page.getByLabel('Takvim durumu').click()
    await page.getByRole('option', { name: 'Takvimde' }).click()
    await page.getByLabel('Yapılanlar').fill('E2E completed work for current week.')
    await page.getByLabel('Yapılacaklar').fill('E2E next week plan.')
    await page.getByRole('button', { name: 'Raporu kaydet' }).first().click()

    await expect(page.getByText('Haftalık rapor başarıyla kaydedildi.')).toBeVisible()
    await expect(page).toHaveURL(/\/reports\/\d+/)
    await expect(page.getByText(/E2E completed work/)).toBeVisible()

    const reportId = Number(page.url().match(/\/reports\/(\d+)/)?.[1])
    expect(reportId).toBeGreaterThan(0)

    updateJourneyState({
      report: { id: reportId, weekNumber: 0 },
    })

    await page.goto(`/projects/${state.project.id}`)
    await expect(page.getByRole('heading', { name: state.project.name })).toBeVisible()
    await expect(page.getByText('Yönetici Özeti')).toBeVisible()
    await expect(page.getByText('38', { exact: false }).first()).toBeVisible()
  })
})

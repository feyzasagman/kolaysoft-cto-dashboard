import { expect, test } from '@playwright/test'
import { expectLoggedInRedirect, loginAs } from './helpers/auth'
import {
  createUniqueFixture,
  getAdminCredentials,
  getOptionalCtoCredentials,
  saveJourneyState,
  type JourneyState,
} from './helpers/testData'

async function createUserViaUi(
  page: import('@playwright/test').Page,
  user: { fullName: string; email: string; password: string; roleLabel: string },
) {
  await page.getByRole('button', { name: 'Yeni Kullanıcı' }).click()
  await expect(page.getByRole('dialog', { name: 'Yeni Kullanıcı' })).toBeVisible()
  await page.getByLabel('Ad Soyad *').fill(user.fullName)
  await page.getByLabel('E-posta *').fill(user.email)
  await page.getByLabel('Rol *').click()
  await page.getByRole('option', { name: user.roleLabel, exact: true }).click()
  await page.getByLabel('Başlangıç şifresi *').fill(user.password)
  await page.getByRole('button', { name: 'Oluştur' }).click()
  await expect(page.getByText('Kullanıcı başarıyla oluşturuldu.')).toBeVisible()
  await expect(page.getByRole('dialog', { name: 'Yeni Kullanıcı' })).toBeHidden()
}

test.describe('ADMIN workflow', () => {
  test('kullanıcı → proje → manager → ekip ataması', async ({ page }) => {
    const admin = getAdminCredentials()
    const fixture = createUniqueFixture()
    const optionalCto = getOptionalCtoCredentials()

    await loginAs(page, admin)
    await expectLoggedInRedirect(page, /\/dashboard/)

    await page.getByLabel('Ana menü').getByRole('link', { name: 'Kullanıcılar' }).click()
    await expect(page.getByRole('heading', { name: 'Kullanıcılar' })).toBeVisible()

    await createUserViaUi(page, { ...fixture.pm, roleLabel: 'Proje Yöneticisi' })
    await page.getByLabel('Kullanıcı ara').fill(fixture.pm.email)
    await expect(page.getByRole('gridcell', { name: fixture.pm.email })).toBeVisible()

    await createUserViaUi(page, { ...fixture.teammate, roleLabel: 'Proje Yöneticisi' })

    const ctoIdentity = optionalCto
      ? { fullName: 'Env CTO', email: optionalCto.email, password: optionalCto.password }
      : fixture.cto

    if (!optionalCto) {
      await createUserViaUi(page, { ...fixture.cto, roleLabel: 'CTO' })
      await page.getByLabel('Kullanıcı ara').fill(fixture.cto.email)
      await expect(page.getByRole('gridcell', { name: fixture.cto.email })).toBeVisible()
    }

    await page.getByLabel('Ana menü').getByRole('link', { name: 'Projeler' }).click()
    await expect(page.getByRole('heading', { name: 'Projeler' })).toBeVisible()
    await page.getByRole('button', { name: 'Yeni proje' }).click()
    await expect(page.getByRole('dialog', { name: 'Yeni Proje' })).toBeVisible()

    await page.getByLabel('Kod *').fill(fixture.project.code)
    await page.getByLabel('Ad *').fill(fixture.project.name)
    await page.getByLabel('Açıklama (opsiyonel)').fill('Playwright E2E journey project')
    await page.getByLabel('Proje Yöneticisi *').click()
    await page.getByRole('option', { name: new RegExp(fixture.pm.email) }).click()
    await page.getByLabel('Durum *').click()
    await page.getByRole('option', { name: 'Aktif' }).click()
    await page.getByLabel('Başlangıç tarihi').fill('2026-01-15')
    await page.getByRole('button', { name: 'Oluştur' }).click()
    await expect(page.getByText('Proje başarıyla oluşturuldu.')).toBeVisible()

    await page.getByLabel('Proje ara').fill(fixture.project.code)
    await expect(page.getByText(fixture.project.name)).toBeVisible()
    await page.getByRole('button', { name: `${fixture.project.name} görüntüle` }).click()
    await expect(page).toHaveURL(/\/projects\/\d+/)
    await expect(page.getByRole('heading', { name: fixture.project.name })).toBeVisible()
    await expect(page.getByText(fixture.pm.fullName).first()).toBeVisible()

    const projectId = Number(page.url().match(/\/projects\/(\d+)/)?.[1])
    expect(projectId).toBeGreaterThan(0)

    await page.getByRole('tab', { name: 'Ekip' }).click()
    await expect(page.getByRole('heading', { name: 'Proje Ekibi / Yetkilendirme' })).toBeVisible()
    await expect(page.getByText(fixture.pm.email).first()).toBeVisible()

    await page.getByRole('button', { name: 'Kullanıcı ata', exact: true }).first().click()
    const assignDialog = page.getByRole('dialog', { name: 'Kullanıcı Ata' })
    await expect(assignDialog).toBeVisible()
    await assignDialog.getByLabel('Kullanıcı').click()
    await page.getByRole('option', { name: new RegExp(fixture.teammate.fullName) }).click()
    await assignDialog.getByRole('button', { name: 'Ata', exact: true }).click()
    await expect(page.getByText('Kullanıcı projeye atandı.')).toBeVisible()
    await expect(page.getByText(fixture.teammate.fullName).first()).toBeVisible()

    const state: JourneyState = {
      runId: fixture.runId,
      createdAt: new Date().toISOString(),
      pm: fixture.pm,
      cto: ctoIdentity,
      teammate: fixture.teammate,
      project: {
        id: projectId,
        code: fixture.project.code.toUpperCase().replace(/\s+/g, ''),
        name: fixture.project.name,
      },
    }
    saveJourneyState(state)
  })
})

import { expect, test } from '@playwright/test'
import {
  expireClientSession,
  expectLoggedInRedirect,
  loginAs,
  logout,
  setInvalidAccessToken,
} from './helpers/auth'
import { getAdminCredentials } from './helpers/testData'

test.describe('Auth E2E', () => {
  test('geçerli ADMIN login → protected route → logout → engel', async ({ page }) => {
    const admin = getAdminCredentials()

    await loginAs(page, admin)
    await expectLoggedInRedirect(page, /\/dashboard/)
    await expect(page.getByRole('heading', { name: 'Kontrol Paneli', exact: true })).toBeVisible()

    await page.goto('/users')
    await expect(page).toHaveURL(/\/users/)
    await expect(page.getByRole('heading', { name: 'Kullanıcılar' })).toBeVisible()

    await logout(page)

    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('geçersiz kimlik bilgileri hata gösterir', async ({ page }) => {
    await loginAs(page, {
      email: getAdminCredentials().email,
      password: 'WrongPassword!999',
    })
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })

  test('client expiresAt geçmişse oturum temizlenir', async ({ page }) => {
    const admin = getAdminCredentials()
    await loginAs(page, admin)
    await expectLoggedInRedirect(page, /\/dashboard/)

    await expireClientSession(page)
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('geçersiz access token ile API 401 sonrası login’e düşer', async ({ page }) => {
    const admin = getAdminCredentials()
    await loginAs(page, admin)
    await expectLoggedInRedirect(page, /\/dashboard/)

    await setInvalidAccessToken(page)
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/, { timeout: 20_000 })
  })
})

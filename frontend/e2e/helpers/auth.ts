import { expect, type Page } from '@playwright/test'

export async function loginAs(
  page: Page,
  credentials: { email: string; password: string },
) {
  await page.goto('/login')
  await page.getByLabel('E-posta').fill(credentials.email)
  await page.getByLabel('Şifre').fill(credentials.password)
  await page.getByRole('button', { name: 'Giriş Yap' }).click()
}

export async function expectLoggedInRedirect(page: Page, pathHint: RegExp) {
  await expect(page).toHaveURL(pathHint, { timeout: 20_000 })
  await expect(page.getByRole('button', { name: 'Çıkış yap' })).toBeVisible()
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: 'Çıkış yap' }).click()
  await expect(page).toHaveURL(/\/login/, { timeout: 15_000 })
}

/** Client session expiry — localStorage `cto_token_expires_at` (login expiresIn contract). */
export async function expireClientSession(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem('cto_token_expires_at', String(Date.now() - 60_000))
  })
}

export async function setInvalidAccessToken(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem('cto_access_token', 'invalid.jwt.token')
  })
}

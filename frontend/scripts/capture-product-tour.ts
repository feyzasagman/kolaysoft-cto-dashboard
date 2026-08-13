/**
 * Product Tour screenshot capture — deterministic PNGs for README.
 * Uses existing demo data; does not modify product source or E2E specs.
 *
 *   npm run capture:screenshots
 *
 * Credentials: frontend/.env.e2e (E2E_ADMIN_PASSWORD required).
 * Optional: E2E_PM_EMAIL / E2E_PM_PASSWORD for weekly-report as PROJECT_MANAGER.
 */
import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loginAs, expectLoggedInRedirect, logout } from '../e2e/helpers/auth'
import {
  getAdminCredentials,
  getApiBaseUrl,
  loadJourneyState,
  STATE_FILE,
} from '../e2e/helpers/testData'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SCREENSHOT_DIR = path.resolve(__dirname, '../../docs/assets/screenshots')

const SHOTS = {
  dashboard: '01-dashboard.png',
  portfolio: '02-project-portfolio.png',
  detail: '03-project-detail.png',
  insight: '04-executive-insight.png',
  report: '05-weekly-report.png',
  team: '06-team-management.png',
  users: '07-admin-users.png',
} as const

interface DashboardProject {
  projectId: number
  name?: string
  code?: string
  latestHealth?: string | null
  managerId?: number | null
  managerName?: string | null
  managerEmail?: string | null
}

interface WeeklyReportSummary {
  id: number
  projectId: number
  weekNumber?: number
  overallHealth?: string | null
  completedWork?: string | null
  plannedWork?: string | null
  nextWeekPlan?: string | null
}

function failCapture(screen: string, detail: string): never {
  throw new Error(`[capture:${screen}] ${detail}`)
}

async function dismissOverlays(page: Page) {
  await page.mouse.move(0, 0)
  await page.keyboard.press('Escape').catch(() => undefined)
  const dialog = page.getByRole('dialog')
  if (await dialog.count()) {
    const close = dialog.getByRole('button', { name: /kapat|iptal|vazgeç|close/i }).first()
    if (await close.isVisible().catch(() => false)) {
      await close.click()
    } else {
      await page.keyboard.press('Escape')
    }
  }
  await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 5_000 }).catch(() => undefined)
}

async function scrollSectionIntoLead(page: Page, locator: ReturnType<Page['locator']>, offset = 64) {
  await expect(locator).toBeVisible()
  await locator.evaluate((el, topOffset) => {
    const top = el.getBoundingClientRect().top + window.scrollY - topOffset
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' as ScrollBehavior })
  }, offset)
  await page.waitForTimeout(300)
}

async function waitForSettled(page: Page) {
  await page.waitForLoadState('networkidle').catch(() => undefined)
  await page
    .locator('[aria-busy="true"]')
    .first()
    .waitFor({ state: 'hidden', timeout: 25_000 })
    .catch(() => undefined)
  await page.waitForTimeout(400)
}

async function shot(page: Page, fileName: string) {
  await dismissOverlays(page)
  await waitForSettled(page)
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  const target = path.join(SCREENSHOT_DIR, fileName)
  await page.screenshot({
    path: target,
    type: 'png',
    fullPage: false,
    animations: 'disabled',
  })
  const size = fs.statSync(target).size
  if (size < 8_000) {
    failCapture(fileName, `Screenshot too small (${size} bytes) — likely blank/loading.`)
  }
  console.log(`✓ ${fileName} (${Math.round(size / 1024)} KB)`)
}

async function apiLogin(request: APIRequestContext, email: string, password: string) {
  const api = getApiBaseUrl().replace(/\/$/, '')
  const res = await request.post(`${api}/auth/login`, {
    data: { email, password },
  })
  if (!res.ok()) {
    failCapture('api-login', `Login failed for ${email}: HTTP ${res.status()}`)
  }
  const body = (await res.json()) as { data?: { accessToken?: string } }
  const token = body.data?.accessToken
  if (!token) failCapture('api-login', 'accessToken missing in login response')
  return token
}

async function apiJson<T>(
  request: APIRequestContext,
  token: string,
  method: 'GET' | 'POST' | 'PUT',
  urlPath: string,
  data?: unknown,
): Promise<T> {
  const api = getApiBaseUrl().replace(/\/$/, '')
  const res = await request.fetch(`${api}${urlPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data,
  })
  if (!res.ok()) {
    const text = await res.text()
    failCapture('api', `${method} ${urlPath} → HTTP ${res.status()}: ${text.slice(0, 240)}`)
  }
  return (await res.json()) as T
}

async function discoverDemoContext(request: APIRequestContext, adminToken: string) {
  const dash = await apiJson<{ data?: { content?: DashboardProject[] } | DashboardProject[] }>(
    request,
    adminToken,
    'GET',
    '/dashboard/projects?page=0&size=50',
  )
  const content = Array.isArray(dash.data)
    ? dash.data
    : (dash.data?.content ?? [])

  if (content.length < 1) {
    failCapture('demo-data', 'No projects on dashboard. Seed/demo data required.')
  }

  const yellow =
    content.find((p) => (p.latestHealth || '').toUpperCase() === 'YELLOW') ?? null
  const green =
    content.find((p) => (p.latestHealth || '').toUpperCase() === 'GREEN') ?? null
  const detailProject = yellow ?? content[0]
  if (!detailProject?.projectId) {
    failCapture('demo-data', 'Dashboard project missing projectId.')
  }

  const reportsPage = await apiJson<{
    data?: { content?: WeeklyReportSummary[] } | WeeklyReportSummary[]
  }>(
    request,
    adminToken,
    'GET',
    `/reports?projectId=${detailProject.projectId}&page=0&size=20`,
  )

  const reports = Array.isArray(reportsPage.data)
    ? reportsPage.data
    : (reportsPage.data?.content ?? [])

  const filled =
    reports.find(
      (r) =>
        (r.completedWork && r.completedWork.trim().length > 0) ||
        (r.plannedWork && r.plannedWork.trim().length > 0) ||
        (r.nextWeekPlan && r.nextWeekPlan.trim().length > 0),
    ) ?? reports[0]

  if (!filled) {
    failCapture(
      '05-weekly-report',
      `No weekly report for project ${detailProject.projectId} (${detailProject.name}).`,
    )
  }

  // Prefer full report payload for content richness.
  const reportDetail = await apiJson<{ data?: WeeklyReportSummary & Record<string, unknown> }>(
    request,
    adminToken,
    'GET',
    `/reports/${filled.id}`,
  )
  const report = reportDetail.data ?? filled

  return {
    projects: content,
    yellow,
    green,
    detailProject,
    report,
  }
}

function resolvePmCredentials(): { email: string; password: string } | null {
  const email = process.env.E2E_PM_EMAIL?.trim()
  const password = process.env.E2E_PM_PASSWORD?.trim()
  if (email && password) return { email, password }

  if (fs.existsSync(STATE_FILE)) {
    try {
      const state = loadJourneyState()
      if (state.pm?.email && state.pm?.password) {
        return { email: state.pm.email, password: state.pm.password }
      }
    } catch {
      /* ignore */
    }
  }
  return null
}

async function ensurePmCanOpenReport(
  request: APIRequestContext,
  adminToken: string,
  projectId: number,
): Promise<{ email: string; password: string }> {
  const existing = resolvePmCredentials()
  if (existing) {
    try {
      await apiLogin(request, existing.email, existing.password)
      return existing
    } catch {
      console.log(`Existing PM credentials failed for ${existing.email}; falling back to demo PM.`)
    }
  }

  const email = 'demo-pm@example.test'
  const password = process.env.E2E_ADMIN_PASSWORD!.trim()
  const users = await apiJson<{
    data?: { content?: Array<{ id: number; email: string; fullName?: string; role?: string }> }
  }>(request, adminToken, 'GET', '/users?page=0&size=100&role=PROJECT_MANAGER')

  const list = users.data?.content ?? []
  let pm = list.find((u) => u.email.toLowerCase() === email)

  if (!pm) {
    const created = await apiJson<{ data?: { id: number; email: string } }>(
      request,
      adminToken,
      'POST',
      '/users',
      {
        fullName: 'Demo Project Manager',
        email,
        password,
        role: 'PROJECT_MANAGER',
      },
    )
    pm = { id: created.data!.id, email: created.data!.email, role: 'PROJECT_MANAGER' }
    console.log(`Created demo PM ${email} for capture (password from E2E_ADMIN_PASSWORD).`)
  } else {
    await apiJson(request, adminToken, 'PUT', `/users/${pm.id}`, {
      fullName: pm.fullName || 'Demo Project Manager',
      email: pm.email,
      password,
      role: 'PROJECT_MANAGER',
    })
    console.log(`Reset password for demo PM ${email} (from E2E_ADMIN_PASSWORD).`)
  }

  // Ensure assignment so PM can see project/reports (ignore if already assigned)
  const api = getApiBaseUrl().replace(/\/$/, '')
  const assignRes = await request.fetch(`${api}/projects/${projectId}/assignments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    data: { userId: pm.id },
  })
  if (!assignRes.ok() && assignRes.status() !== 409 && assignRes.status() !== 400) {
    const text = await assignRes.text()
    failCapture('pm-assign', `Assignment failed HTTP ${assignRes.status()}: ${text.slice(0, 200)}`)
  }

  await apiLogin(request, email, password)
  return { email, password }
}

test.describe.configure({ mode: 'serial' })

test('capture product tour screenshots', async ({ page, request }) => {
  const admin = getAdminCredentials()
  const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000'
  console.log(`Capture baseURL=${baseURL}`)
  console.log(`API=${getApiBaseUrl()}`)
  console.log(`Viewport=1440x900 deviceScaleFactor=1`)
  console.log(`Output=${SCREENSHOT_DIR}`)

  const adminToken = await apiLogin(request, admin.email, admin.password)
  const ctx = await discoverDemoContext(request, adminToken)

  console.log(
    `Projects=${ctx.projects.length} GREEN=${ctx.green?.name ?? '—'} YELLOW=${ctx.yellow?.name ?? '—'} detail=#${ctx.detailProject.projectId} ${ctx.detailProject.name} report=#${ctx.report.id}`,
  )

  // —— 01 Dashboard (ADMIN) ——
  await loginAs(page, admin)
  await expectLoggedInRedirect(page, /\/dashboard/)
  await expect(page.getByLabel('Özet metrik kartları')).toBeVisible({ timeout: 25_000 })
  await expect(page.getByLabel('Dikkat gerektiren projeler')).toBeVisible()
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, SHOTS.dashboard)

  // —— 02 Project Portfolio ——
  await page.getByLabel('Ana menü').getByRole('link', { name: 'Projeler' }).click()
  await expect(page.getByRole('heading', { name: 'Projeler', level: 1 })).toBeVisible()
  await expect(page.getByLabel('Proje portföy listesi').or(page.getByLabel('Proje portföy tablosu'))).toBeVisible({
    timeout: 25_000,
  })
  if (ctx.projects.length < 2) {
    failCapture(SHOTS.portfolio, 'Need at least 2 projects visible for portfolio screenshot.')
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, SHOTS.portfolio)

  // —— 03 Project Detail Command Center ——
  await page.goto(`/projects/${ctx.detailProject.projectId}`)
  await expect(page.getByRole('heading', { name: ctx.detailProject.name! })).toBeVisible({
    timeout: 25_000,
  })
  await expect(page.getByText('Yönetici Özeti')).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Genel Bakış' })).toBeVisible()
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, SHOTS.detail)

  // —— 04 Executive Insight (scroll so section leads the viewport) ——
  const insight = page.locator('[aria-label^="Yönetici özeti"]')
  await scrollSectionIntoLead(page, insight, 72)
  await expect(insight).toBeInViewport()
  await shot(page, SHOTS.insight)

  // —— 06 Team Management (before role switch) ——
  await page.getByRole('tab', { name: 'Ekip' }).click()
  const teamHeading = page.getByRole('heading', { name: 'Proje Ekibi / Yetkilendirme' })
  await expect(teamHeading).toBeVisible({ timeout: 20_000 })
  await scrollSectionIntoLead(page, teamHeading, 80)
  await expect(page.getByRole('button', { name: 'Kullanıcı ata', exact: true }).first()).toBeVisible()
  await shot(page, SHOTS.team)

  // —— 07 Admin Users ——
  await page.getByLabel('Ana menü').getByRole('link', { name: 'Kullanıcılar' }).click()
  await expect(page.getByRole('heading', { name: 'Kullanıcılar' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Yeni Kullanıcı' })).toBeVisible()
  await expect(page.getByLabel('Kullanıcı listesi')).toBeVisible({ timeout: 25_000 })
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, SHOTS.users)

  await logout(page)

  // —— 05 Weekly Report as PROJECT_MANAGER ——
  const pm = await ensurePmCanOpenReport(request, adminToken, ctx.detailProject.projectId)
  await loginAs(page, pm)
  await expectLoggedInRedirect(page, /\/(projects|reports)/)

  await page.goto(`/reports/${ctx.report.id}`)
  await expect(page.getByLabel('Rapor detayı yükleniyor')).toHaveCount(0, { timeout: 25_000 })
  await expect(page.getByText(/Hafta/i).first()).toBeVisible({ timeout: 25_000 })
  await expect(page.getByText(/Hedeflenen İlerleme|Gerçekleşen İlerleme/i).first()).toBeVisible()
  const contentHints = page.getByText(
    /Yapılanlar|Planlanan|Partial integration|Day19 completed|vendor/i,
  )
  if ((await contentHints.count()) === 0) {
    failCapture(SHOTS.report, 'Weekly report detail appears empty — refusing blank capture.')
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, SHOTS.report)

  console.log('Product Tour capture complete:', Object.values(SHOTS).join(', '))
})

import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const envE2ePath = path.join(rootDir, '.env.e2e')
if (fs.existsSync(envE2ePath)) {
  dotenv.config({ path: envE2ePath })
}

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:5173'
const isCi = Boolean(process.env.CI)

/**
 * Full-stack E2E — frontend UI + canlı backend.
 * Lokal: Vite dev. CI: production build + preview (dist önceden üretilmiş olmalı).
 * Backend’in ayakta olması gerekir.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: isCi,
  retries: isCi ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  timeout: 90_000,
  expect: { timeout: 15_000 },
  outputDir: 'test-results',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'auth',
      testMatch: /auth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'admin',
      testMatch: /admin-workflow\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'pm',
      testMatch: /pm-workflow\.spec\.ts/,
      dependencies: ['admin'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'cto',
      testMatch: /cto-workflow\.spec\.ts/,
      dependencies: ['pm'],
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: isCi
      ? 'npm run preview -- --host localhost --port 5173'
      : 'npm run dev',
    url: baseURL,
    reuseExistingServer: !isCi,
    timeout: 120_000,
  },
})

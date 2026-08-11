import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
export const RUNTIME_DIR = path.join(rootDir, '.runtime')
export const STATE_FILE = path.join(RUNTIME_DIR, 'journey-state.json')

export interface JourneyState {
  runId: string
  createdAt: string
  pm: {
    fullName: string
    email: string
    password: string
  }
  cto: {
    fullName: string
    email: string
    password: string
  }
  teammate: {
    fullName: string
    email: string
    password: string
  }
  project: {
    id: number
    code: string
    name: string
  }
  report?: {
    id: number
    weekNumber: number
  }
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(
      `${name} tanımlı değil. frontend/.env.e2e oluşturun (bkz. .env.e2e.example) veya ortam değişkeni verin.`,
    )
  }
  return value
}

export function getAdminCredentials() {
  return {
    email: process.env.E2E_ADMIN_EMAIL?.trim() || 'admin@kolaysoft.com.tr',
    password: requireEnv('E2E_ADMIN_PASSWORD'),
  }
}

export function getOptionalCtoCredentials(): { email: string; password: string } | null {
  const email = process.env.E2E_CTO_EMAIL?.trim()
  const password = process.env.E2E_CTO_PASSWORD?.trim()
  if (email && password) return { email, password }
  return null
}

export function getApiBaseUrl() {
  return process.env.E2E_API_BASE_URL?.trim() || 'http://localhost:8080/api/v1'
}

/** Timestamp tabanlı benzersiz veri — demo seed’e bağımlı değil. */
export function createUniqueFixture(runId = `${Date.now()}`) {
  const password = `E2e!${runId.slice(-8)}Aa1`
  return {
    runId,
    pm: {
      fullName: `E2E PM ${runId}`,
      email: `e2e-pm-${runId}@example.test`,
      password,
    },
    cto: {
      fullName: `E2E CTO ${runId}`,
      email: `e2e-cto-${runId}@example.test`,
      password: `E2eCto!${runId.slice(-8)}Aa1`,
    },
    teammate: {
      fullName: `E2E Mate ${runId}`,
      email: `e2e-mate-${runId}@example.test`,
      password: `E2eMate!${runId.slice(-8)}Aa1`,
    },
    project: {
      code: `E2E${runId}`.slice(0, 50),
      name: `E2E-PROJ-${runId}`,
    },
  }
}

export function saveJourneyState(state: JourneyState) {
  fs.mkdirSync(RUNTIME_DIR, { recursive: true })
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8')
}

export function loadJourneyState(): JourneyState {
  if (!fs.existsSync(STATE_FILE)) {
    throw new Error(
      `Journey state bulunamadı: ${STATE_FILE}. Önce admin-workflow.spec.ts çalışmalı.`,
    )
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) as JourneyState
}

export function updateJourneyState(patch: Partial<JourneyState>) {
  const current = loadJourneyState()
  const next = { ...current, ...patch } as JourneyState
  if (patch.project) next.project = { ...current.project, ...patch.project }
  if (patch.report) next.report = { ...current.report, ...patch.report } as JourneyState['report']
  saveJourneyState(next)
  return next
}

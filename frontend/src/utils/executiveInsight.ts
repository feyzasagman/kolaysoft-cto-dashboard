import { currentIsoWeek, healthLabel } from '@/utils/labels'
import type { PortfolioRow } from '@/utils/dashboardTypes'

/** UI-only eşik: hedef − gerçekleşen ≥ bu değer → dikkat sinyali. */
export const PROGRESS_GAP_ATTENTION_THRESHOLD = 10

export type InsightSeverity = 'ok' | 'attention' | 'critical'

export interface ExecutiveInsightSignal {
  id: string
  label: string
  value: string
  tone: InsightSeverity
}

export interface ExecutiveProjectInsight {
  severity: InsightSeverity
  headline: string
  summary: string
  signals: ExecutiveInsightSignal[]
}

export interface ExecutiveInsightInput {
  progressTarget: number
  progressActual: number
  health: string | null | undefined
  openRiskCount: number
  criticalRiskCount: number
  openWorkItems: number
  hasCurrentWeekReport: boolean
  hasAnyReport: boolean
}

export interface AttentionItem {
  projectId: number
  name: string
  code: string
  health: string | null
  progressGap: number
  criticalRiskCount: number
  openRiskCount: number
  hasCurrentWeekReport: boolean
  reason: string
  attentionScore: number
}

function progressGap(target: number, actual: number): number {
  return target - actual
}

function severityRank(s: InsightSeverity): number {
  if (s === 'critical') return 3
  if (s === 'attention') return 2
  return 1
}

function maxSeverity(...items: InsightSeverity[]): InsightSeverity {
  return items.reduce((acc, cur) => (severityRank(cur) > severityRank(acc) ? cur : acc), 'ok' as InsightSeverity)
}

/**
 * Project Detail — deterministik yönetici özeti.
 * Sahte veri / LLM yok; yalnızca verilen gerçek alanlar.
 */
export function buildExecutiveProjectInsight(input: ExecutiveInsightInput): ExecutiveProjectInsight {
  const gap = progressGap(input.progressTarget, input.progressActual)
  const health = (input.health ?? '').toUpperCase() || null

  const facts: string[] = []
  let severity: InsightSeverity = 'ok'

  // Progress
  let progressTone: InsightSeverity = 'ok'
  let progressValue: string
  if (!input.hasAnyReport && input.progressTarget === 0 && input.progressActual === 0) {
    progressValue = 'Veri yok'
    progressTone = 'attention'
    facts.push('İlerleme verisi henüz mevcut değil.')
  } else if (gap > 0) {
    progressValue = `−${gap} puan`
    progressTone = gap >= PROGRESS_GAP_ATTENTION_THRESHOLD ? 'attention' : 'ok'
    facts.push(`Proje hedefin ${gap} puan gerisinde.`)
    if (gap >= PROGRESS_GAP_ATTENTION_THRESHOLD) severity = maxSeverity(severity, 'attention')
  } else if (gap < 0) {
    progressValue = `+${Math.abs(gap)} puan`
    progressTone = 'ok'
    facts.push(`Proje hedefin ${Math.abs(gap)} puan üzerinde.`)
  } else {
    progressValue = 'Hedefle uyumlu'
    progressTone = 'ok'
    facts.push('Proje hedefle uyumlu ilerliyor.')
  }

  // Health
  let healthTone: InsightSeverity = 'ok'
  let healthValue = healthLabel(health)
  if (health === 'RED') {
    healthTone = 'critical'
    severity = maxSeverity(severity, 'critical')
    facts.push('Proje sağlığı kritik müdahale gerektiriyor.')
  } else if (health === 'YELLOW') {
    healthTone = 'attention'
    severity = maxSeverity(severity, 'attention')
    facts.push('Proje sağlığı dikkat gerektiriyor.')
  } else if (health === 'GREEN') {
    healthTone = 'ok'
    facts.push('Proje sağlığı iyi.')
  } else {
    healthTone = 'attention'
    healthValue = 'Rapor yok'
    severity = maxSeverity(severity, 'attention')
    facts.push('Sağlık durumu için yeterli rapor verisi yok.')
  }

  // Risks
  let riskTone: InsightSeverity = 'ok'
  let riskValue: string
  if (input.criticalRiskCount > 0) {
    riskTone = 'critical'
    severity = maxSeverity(severity, 'critical')
    riskValue = `${input.openRiskCount} açık / ${input.criticalRiskCount} kritik`
    facts.push(`${input.criticalRiskCount} kritik risk bulunuyor.`)
  } else if (input.openRiskCount > 0) {
    riskTone = 'attention'
    severity = maxSeverity(severity, 'attention')
    riskValue = `${input.openRiskCount} açık`
    facts.push(`${input.openRiskCount} açık risk takip ediliyor.`)
  } else {
    riskValue = 'Açık risk yok'
    riskTone = 'ok'
  }

  // Report
  let reportTone: InsightSeverity = 'ok'
  let reportValue: string
  if (input.hasCurrentWeekReport) {
    reportValue = 'Güncel'
    reportTone = 'ok'
    facts.push('Bu haftanın raporu güncel.')
  } else {
    reportValue = 'Eksik'
    reportTone = 'attention'
    severity = maxSeverity(severity, 'attention')
    facts.push('Bu haftanın raporu eksik.')
  }

  // Work items — özet cümlesine eklenir (signal kartı sağlığa ayrıldı)
  if (input.openWorkItems > 0) {
    if (input.openWorkItems >= 5) {
      severity = maxSeverity(severity, 'attention')
    }
    facts.push(`${input.openWorkItems} açık iş kalemi bulunuyor.`)
  }

  const signals: ExecutiveInsightSignal[] = [
    { id: 'gap', label: 'Hedef Farkı', value: progressValue, tone: progressTone },
    { id: 'risk', label: 'Risk Durumu', value: riskValue, tone: riskTone },
    { id: 'report', label: 'Rapor Durumu', value: reportValue, tone: reportTone },
    { id: 'health', label: 'Sağlık', value: healthValue, tone: healthTone },
  ]

  const headline =
    severity === 'critical'
      ? 'Kritik dikkat gerekiyor'
      : severity === 'attention'
        ? 'İzleme ve takip önerilir'
        : 'Durum kontrollü'

  // 2–3 sentences from facts, no invented advice beyond observed data
  const priorityHint =
    input.criticalRiskCount > 0
      ? 'Öncelik, kritik risklerin takibinde olmalı.'
      : !input.hasCurrentWeekReport
        ? 'Öncelik, haftalık raporun güncellenmesinde olmalı.'
        : gap >= PROGRESS_GAP_ATTENTION_THRESHOLD
          ? 'Öncelik, ilerleme farkının kapatılmasında olmalı.'
          : null

  const summaryParts = facts.slice(0, 3)
  if (priorityHint && summaryParts.length < 3) summaryParts.push(priorityHint)
  const summary = summaryParts.join(' ')

  return { severity, headline, summary, signals }
}

/** Latest report year/week vs current ISO week — gerçek alanlardan. */
export function isCurrentWeekReport(
  year: number | null | undefined,
  weekNumber: number | null | undefined,
  now = new Date(),
): boolean {
  if (year == null || weekNumber == null) return false
  const current = currentIsoWeek(now)
  return year === current.year && weekNumber === current.week
}

/**
 * Attention score — UI sıralama only; backend’e yazılmaz.
 * +4 critical risk, +3 RED, +2 YELLOW, +2 missing report, +1 gap>=10
 */
export function computeAttentionScore(row: {
  latestHealth: string | null
  criticalRiskCount: number
  hasCurrentWeekReport: boolean
  progressTarget: number
  progressActual: number
}): number {
  let score = 0
  if (row.criticalRiskCount > 0) score += 4
  const health = (row.latestHealth ?? '').toUpperCase()
  if (health === 'RED') score += 3
  if (health === 'YELLOW') score += 2
  if (!row.hasCurrentWeekReport) score += 2
  if (progressGap(row.progressTarget, row.progressActual) >= PROGRESS_GAP_ATTENTION_THRESHOLD) score += 1
  return score
}

export function needsAttention(row: {
  latestHealth: string | null
  criticalRiskCount: number
  hasCurrentWeekReport: boolean
  progressTarget: number
  progressActual: number
}): boolean {
  const health = (row.latestHealth ?? '').toUpperCase()
  if (health === 'RED' || health === 'YELLOW') return true
  if (row.criticalRiskCount > 0) return true
  if (!row.hasCurrentWeekReport) return true
  if (progressGap(row.progressTarget, row.progressActual) >= PROGRESS_GAP_ATTENTION_THRESHOLD) return true
  return false
}

function buildAttentionReason(row: {
  latestHealth: string | null
  criticalRiskCount: number
  hasCurrentWeekReport: boolean
  progressTarget: number
  progressActual: number
}): string {
  const parts: string[] = []
  const health = (row.latestHealth ?? '').toUpperCase()
  const gap = progressGap(row.progressTarget, row.progressActual)

  if (row.criticalRiskCount > 0) parts.push('Kritik risk')
  if (health === 'RED') parts.push('Kritik sağlık')
  else if (health === 'YELLOW') parts.push('Dikkat gerektiren sağlık')
  if (!row.hasCurrentWeekReport) parts.push('Rapor eksik')
  if (gap >= PROGRESS_GAP_ATTENTION_THRESHOLD) parts.push(`Hedefin ${gap} puan gerisinde`)

  return parts.length > 0 ? parts.join(' + ') : 'İzleme'
}

/**
 * Portfolio Attention Center — mevcut portfolio satırlarından UI öncelik listesi.
 */
export function buildPortfolioAttentionItems(rows: PortfolioRow[]): AttentionItem[] {
  return rows
    .filter(needsAttention)
    .map((row) => {
      const gap = progressGap(row.progressTarget, row.progressActual)
      return {
        projectId: row.projectId,
        name: row.name,
        code: row.code,
        health: row.latestHealth,
        progressGap: gap,
        criticalRiskCount: row.criticalRiskCount,
        openRiskCount: row.openRiskCount,
        hasCurrentWeekReport: row.hasCurrentWeekReport,
        reason: buildAttentionReason(row),
        attentionScore: computeAttentionScore(row),
      }
    })
    .sort((a, b) => {
      if (b.attentionScore !== a.attentionScore) return b.attentionScore - a.attentionScore
      return a.name.localeCompare(b.name, 'tr')
    })
}

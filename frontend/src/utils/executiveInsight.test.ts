import { describe, expect, it } from 'vitest'
import type { PortfolioRow } from '@/utils/dashboardTypes'
import {
  PROGRESS_GAP_ATTENTION_THRESHOLD,
  buildExecutiveProjectInsight,
  buildPortfolioAttentionItems,
  computeAttentionScore,
  isCurrentWeekReport,
  needsAttention,
} from '@/utils/executiveInsight'

function baseInsight(
  overrides: Partial<Parameters<typeof buildExecutiveProjectInsight>[0]> = {},
) {
  return buildExecutiveProjectInsight({
    progressTarget: 70,
    progressActual: 65,
    health: 'GREEN',
    openRiskCount: 0,
    criticalRiskCount: 0,
    openWorkItems: 0,
    hasCurrentWeekReport: true,
    hasAnyReport: true,
    ...overrides,
  })
}

function portfolioRow(overrides: Partial<PortfolioRow> = {}): PortfolioRow {
  return {
    id: 1,
    projectId: 1,
    name: 'Alpha',
    code: 'ALP',
    managerName: 'PM',
    projectStatus: 'ACTIVE',
    latestHealth: 'GREEN',
    progressTarget: 70,
    progressActual: 65,
    openRiskCount: 0,
    criticalRiskCount: 0,
    hasCurrentWeekReport: true,
    latestReportDate: '2026-08-13',
    latestReportLabel: '2026-W33',
    ...overrides,
  }
}

describe('buildExecutiveProjectInsight', () => {
  it('GREEN proje: kontrollü severity ve sağlık sinyali', () => {
    const insight = baseInsight({ health: 'GREEN', progressTarget: 70, progressActual: 68 })
    expect(insight.severity).toBe('ok')
    expect(insight.headline).toBe('Durum kontrollü')
    expect(insight.summary).toMatch(/sağlığı iyi/i)
    expect(insight.signals.find((s) => s.id === 'health')).toMatchObject({
      label: 'Sağlık',
      value: 'Sağlıklı',
      tone: 'ok',
    })
    expect(insight.signals.find((s) => s.id === 'gap')?.tone).toBe('ok')
  })

  it('YELLOW health → attention severity ve headline', () => {
    const insight = baseInsight({ health: 'YELLOW' })
    expect(insight.severity).toBe('attention')
    expect(insight.headline).toBe('İzleme ve takip önerilir')
    expect(insight.summary).toMatch(/dikkat gerektiriyor/i)
    expect(insight.signals.find((s) => s.id === 'health')?.tone).toBe('attention')
  })

  it('RED health → critical severity', () => {
    const insight = baseInsight({ health: 'RED' })
    expect(insight.severity).toBe('critical')
    expect(insight.headline).toBe('Kritik dikkat gerekiyor')
    expect(insight.summary).toMatch(/kritik müdahale/i)
    expect(insight.signals.find((s) => s.id === 'health')).toMatchObject({
      value: 'Kritik',
      tone: 'critical',
    })
  })

  it(`progress gap >= ${PROGRESS_GAP_ATTENTION_THRESHOLD} → attention + gap signal`, () => {
    const insight = baseInsight({
      health: 'GREEN',
      progressTarget: 70,
      progressActual: 55,
    })
    expect(insight.severity).toBe('attention')
    expect(insight.signals.find((s) => s.id === 'gap')).toMatchObject({
      label: 'Hedef Farkı',
      value: '−15 puan',
      tone: 'attention',
    })
    expect(insight.summary).toMatch(/15 puan gerisinde/)
  })

  it('critical risk → critical severity ve risk signal', () => {
    const insight = baseInsight({
      health: 'GREEN',
      openRiskCount: 2,
      criticalRiskCount: 1,
    })
    expect(insight.severity).toBe('critical')
    expect(insight.headline).toBe('Kritik dikkat gerekiyor')
    expect(insight.signals.find((s) => s.id === 'risk')).toMatchObject({
      value: '2 açık / 1 kritik',
      tone: 'critical',
    })
    expect(insight.summary).toMatch(/kritik risk/)
  })

  it('missing current week report → attention + Eksik rapor', () => {
    const insight = baseInsight({ hasCurrentWeekReport: false })
    expect(insight.severity).toBe('attention')
    expect(insight.signals.find((s) => s.id === 'report')).toMatchObject({
      label: 'Rapor Durumu',
      value: 'Eksik',
      tone: 'attention',
    })
    expect(insight.summary).toMatch(/raporu eksik/i)
  })

  it('no open risks → Açık risk yok', () => {
    const insight = baseInsight({ openRiskCount: 0, criticalRiskCount: 0 })
    expect(insight.signals.find((s) => s.id === 'risk')).toMatchObject({
      value: 'Açık risk yok',
      tone: 'ok',
    })
  })

  it('nullish health / no report data → Rapor yok health signal', () => {
    const insight = baseInsight({
      health: null,
      hasAnyReport: false,
      progressTarget: 0,
      progressActual: 0,
      hasCurrentWeekReport: false,
    })
    expect(insight.severity).toBe('attention')
    expect(insight.signals.find((s) => s.id === 'health')?.value).toBe('Rapor yok')
    expect(insight.signals.find((s) => s.id === 'gap')?.value).toBe('Veri yok')
    expect(insight.summary.length).toBeGreaterThan(0)
  })

  it('always returns four signal cards with labels', () => {
    const insight = baseInsight()
    expect(insight.signals.map((s) => s.label)).toEqual([
      'Hedef Farkı',
      'Risk Durumu',
      'Rapor Durumu',
      'Sağlık',
    ])
  })
})

describe('attention score / sorting', () => {
  it('computeAttentionScore: critical risk + RED + missing report + gap', () => {
    const score = computeAttentionScore({
      latestHealth: 'RED',
      criticalRiskCount: 1,
      hasCurrentWeekReport: false,
      progressTarget: 80,
      progressActual: 60,
    })
    // +4 critical, +3 RED, +2 missing report, +1 gap>=10
    expect(score).toBe(10)
  })

  it('computeAttentionScore: YELLOW alone is +2', () => {
    expect(
      computeAttentionScore({
        latestHealth: 'YELLOW',
        criticalRiskCount: 0,
        hasCurrentWeekReport: true,
        progressTarget: 50,
        progressActual: 50,
      }),
    ).toBe(2)
  })

  it('needsAttention false for clean GREEN on-track project', () => {
    expect(
      needsAttention({
        latestHealth: 'GREEN',
        criticalRiskCount: 0,
        hasCurrentWeekReport: true,
        progressTarget: 70,
        progressActual: 68,
      }),
    ).toBe(false)
  })

  it('buildPortfolioAttentionItems sorts by score then name and builds reason', () => {
    const items = buildPortfolioAttentionItems([
      portfolioRow({
        projectId: 2,
        name: 'Beta',
        code: 'BET',
        latestHealth: 'YELLOW',
        progressTarget: 70,
        progressActual: 55,
        openRiskCount: 1,
      }),
      portfolioRow({
        projectId: 3,
        name: 'Gamma',
        code: 'GAM',
        latestHealth: 'RED',
        criticalRiskCount: 1,
        openRiskCount: 1,
        hasCurrentWeekReport: false,
      }),
      portfolioRow({
        projectId: 1,
        name: 'Alpha Healthy',
        latestHealth: 'GREEN',
        progressTarget: 70,
        progressActual: 70,
      }),
    ])

    expect(items.map((i) => i.name)).toEqual(['Gamma', 'Beta'])
    expect(items[0].attentionScore).toBeGreaterThan(items[1].attentionScore)
    expect(items[0].reason).toMatch(/Kritik risk/)
    expect(items[1].reason).toMatch(/Dikkat gerektiren sağlık/)
    expect(items[1].reason).toMatch(/15 puan gerisinde/)
  })

  it('empty portfolio → empty attention list', () => {
    expect(buildPortfolioAttentionItems([])).toEqual([])
  })
})

describe('isCurrentWeekReport', () => {
  it('matches provided ISO week against fixed now', () => {
    const now = new Date('2026-08-13T12:00:00Z')
    expect(isCurrentWeekReport(2026, 33, now)).toBe(true)
    expect(isCurrentWeekReport(2026, 1, now)).toBe(false)
    expect(isCurrentWeekReport(null, 33, now)).toBe(false)
    expect(isCurrentWeekReport(2026, undefined, now)).toBe(false)
  })
})

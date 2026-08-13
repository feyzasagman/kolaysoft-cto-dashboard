import { describe, expect, it } from 'vitest'
import {
  healthLabel,
  riskLevelLabel,
  riskStatusLabel,
  roleLabel,
  scheduleStatusLabel,
  statusLabel,
  workItemStatusLabel,
} from '@/utils/labels'

describe('roleLabel', () => {
  it('maps known roles', () => {
    expect(roleLabel('PROJECT_MANAGER')).toBe('Proje Yöneticisi')
    expect(roleLabel('ADMIN')).toBe('Yönetici')
    expect(roleLabel('CTO')).toBe('CTO')
  })

  it('falls back for nullish / unknown', () => {
    expect(roleLabel(null)).toBe('—')
    expect(roleLabel(undefined)).toBe('—')
    expect(roleLabel('CUSTOM_ROLE')).toBe('CUSTOM_ROLE')
  })
})

describe('statusLabel', () => {
  it('maps project statuses', () => {
    expect(statusLabel('ACTIVE')).toBe('Aktif')
    expect(statusLabel('PLANNED')).toBe('Planlandı')
    expect(statusLabel('ON_HOLD')).toBe('Beklemede')
    expect(statusLabel('COMPLETED')).toBe('Tamamlandı')
    expect(statusLabel('CANCELLED')).toBe('İptal')
  })

  it('falls back for nullish / unknown', () => {
    expect(statusLabel(null)).toBe('—')
    expect(statusLabel('UNKNOWN_STATUS')).toBe('UNKNOWN_STATUS')
  })
})

describe('health / risk / work item labels', () => {
  it('maps health', () => {
    expect(healthLabel('GREEN')).toBe('Sağlıklı')
    expect(healthLabel('YELLOW')).toBe('Dikkat')
    expect(healthLabel('RED')).toBe('Kritik')
    expect(healthLabel(null)).toBe('Rapor Yok')
    expect(healthLabel('WEIRD')).toBe('WEIRD')
  })

  it('maps work item status', () => {
    expect(workItemStatusLabel('TODO')).toBe('Yapılacak')
    expect(workItemStatusLabel('IN_PROGRESS')).toBe('Devam Ediyor')
    expect(workItemStatusLabel('DONE')).toBe('Tamamlandı')
    expect(workItemStatusLabel('BLOCKED')).toBe('Engelli')
    expect(workItemStatusLabel(null)).toBe('—')
  })

  it('maps risk level and status', () => {
    expect(riskLevelLabel('LOW')).toBe('Düşük')
    expect(riskLevelLabel('MEDIUM')).toBe('Orta')
    expect(riskLevelLabel('HIGH')).toBe('Yüksek')
    expect(riskLevelLabel('CRITICAL')).toBe('Kritik')
    expect(riskStatusLabel('OPEN')).toBe('Açık')
    expect(riskStatusLabel('RESOLVED')).toBe('Çözüldü')
    expect(riskStatusLabel(null)).toBe('—')
  })

  it('maps schedule status', () => {
    expect(scheduleStatusLabel('ON_TRACK')).toBe('Takvimde')
    expect(scheduleStatusLabel('AT_RISK')).toBe('Risk altında')
    expect(scheduleStatusLabel('DELAYED')).toBe('Gecikmiş')
    expect(scheduleStatusLabel(null)).toBe('—')
  })
})

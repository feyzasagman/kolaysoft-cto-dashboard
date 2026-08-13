import { describe, expect, it } from 'vitest'
import { getErrorMessage, getFieldErrors, getHttpStatus } from '@/utils/errorUtils'

function apiError(status: number, message?: string, fields?: Record<string, string>) {
  return {
    isAxiosError: true,
    response: {
      status,
      data: {
        success: false,
        message,
        data: fields ? { fields } : null,
      },
    },
  }
}

describe('getErrorMessage', () => {
  it('maps duplicate email 409', () => {
    expect(getErrorMessage(apiError(409, 'E-posta zaten kayıtlı'))).toBe(
      'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunmaktadır.',
    )
    expect(getErrorMessage(apiError(409, 'Duplicate email address'))).toBe(
      'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunmaktadır.',
    )
  })

  it('maps duplicate project code 409', () => {
    expect(getErrorMessage(apiError(409, 'Proje kodu kullanımda'))).toBe(
      'Bu proje kodu zaten kullanılmaktadır.',
    )
  })

  it('maps duplicate weekly report 409', () => {
    expect(getErrorMessage(apiError(409, 'Bu hafta için rapor mevcut'))).toBe(
      'Bu proje için seçilen haftaya ait bir rapor zaten bulunmaktadır.',
    )
  })

  it('generic 409 uses API message or conflict fallback', () => {
    expect(getErrorMessage(apiError(409, 'Başka bir çakışma'))).toBe('Başka bir çakışma')
    expect(getErrorMessage(apiError(409))).toBe('Kayıt çakışması oluştu.')
  })

  it('returns API message for non-409 responses', () => {
    expect(getErrorMessage(apiError(400, 'Geçersiz istek'))).toBe('Geçersiz istek')
  })

  it('maps 401 / 403 when message missing', () => {
    expect(getErrorMessage(apiError(401))).toBe(
      'Oturumunuz sona erdi. Lütfen yeniden giriş yapın.',
    )
    expect(getErrorMessage(apiError(403))).toBe('Bu işlem için yetkiniz bulunmuyor.')
  })

  it('network / unknown → fallback', () => {
    expect(getErrorMessage(undefined)).toBe('Beklenmeyen bir hata oluştu.')
    expect(getErrorMessage({ message: 'Network Error' }, 'Bağlantı kurulamadı.')).toBe(
      'Bağlantı kurulamadı.',
    )
    expect(getErrorMessage(null, 'Özel fallback')).toBe('Özel fallback')
  })
})

describe('getHttpStatus / getFieldErrors', () => {
  it('reads HTTP status', () => {
    expect(getHttpStatus(apiError(409, 'x'))).toBe(409)
    expect(getHttpStatus('nope')).toBeUndefined()
  })

  it('reads field errors map', () => {
    expect(getFieldErrors(apiError(400, 'validasyon', { email: 'Geçersiz' }))).toEqual({
      email: 'Geçersiz',
    })
    expect(getFieldErrors(null)).toEqual({})
  })
})

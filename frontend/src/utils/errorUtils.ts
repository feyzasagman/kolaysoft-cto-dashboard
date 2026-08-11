import type { AxiosError } from 'axios'
import type { ApiResponse, ErrorDetail } from '@/types/api'

export function getErrorMessage(error: unknown, fallback = 'Beklenmeyen bir hata oluştu.'): string {
  if (!error || typeof error !== 'object') {
    return fallback
  }

  const axiosError = error as AxiosError<ApiResponse<ErrorDetail | null>>
  const status = axiosError.response?.status
  const message = axiosError.response?.data?.message

  if (status === 409) {
    const lower = (message ?? '').toLocaleLowerCase('tr-TR')
    if (lower.includes('hafta') || lower.includes('rapor')) {
      return 'Bu proje için seçilen haftaya ait bir rapor zaten bulunmaktadır.'
    }
    if (lower.includes('e-posta') || lower.includes('email')) {
      return 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunmaktadır.'
    }
    if (lower.includes('proje kodu') || lower.includes('kod')) {
      return 'Bu proje kodu zaten kullanılmaktadır.'
    }
    return message || 'Kayıt çakışması oluştu.'
  }

  if (message) {
    return message
  }

  if (status === 403) {
    return 'Bu işlem için yetkiniz bulunmuyor.'
  }

  if (status === 401) {
    return 'Oturumunuz sona erdi. Lütfen yeniden giriş yapın.'
  }

  return fallback
}

export function getHttpStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') {
    return undefined
  }
  return (error as AxiosError).response?.status
}

/** Backend validation fields map → RHF setError için. */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!error || typeof error !== 'object') {
    return {}
  }
  const axiosError = error as AxiosError<ApiResponse<ErrorDetail | null>>
  const fields = axiosError.response?.data?.data?.fields
  if (!fields || typeof fields !== 'object') {
    return {}
  }
  return { ...fields }
}

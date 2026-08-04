import type { AxiosError } from 'axios'
import type { ApiResponse, ErrorDetail } from '@/types/api'

export function getErrorMessage(error: unknown, fallback = 'Beklenmeyen bir hata oluştu.'): string {
  if (!error || typeof error !== 'object') {
    return fallback
  }

  const axiosError = error as AxiosError<ApiResponse<ErrorDetail | null>>
  const message = axiosError.response?.data?.message
  if (message) {
    return message
  }

  if (axiosError.message) {
    return axiosError.message
  }

  return fallback
}

export function getHttpStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') {
    return undefined
  }
  return (error as AxiosError).response?.status
}

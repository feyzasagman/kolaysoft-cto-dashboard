import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'react-toastify'
import { getErrorMessage, getHttpStatus } from '@/utils/errorUtils'
import { refreshAccessToken } from '@/utils/tokenRefresh'
import { tokenStorage } from '@/utils/tokenStorage'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30_000,
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise: Promise<string | null> | null = null

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = getHttpStatus(error)
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null
        })
      }

      const newToken = await refreshPromise
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      }

      tokenStorage.clear()
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
      return Promise.reject(error)
    }

    if (status === 403) {
      toast.error(getErrorMessage(error, 'Bu işlem için yetkiniz bulunmamaktadır.'))
    } else if (status && status >= 500) {
      toast.error(getErrorMessage(error, 'Sunucu hatası oluştu.'))
    } else if (!status) {
      toast.error('API bağlantısı kurulamadı. Backend çalışıyor mu?')
    }

    return Promise.reject(error)
  },
)

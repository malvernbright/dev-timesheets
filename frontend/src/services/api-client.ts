import axios, { AxiosError } from 'axios'
import type { AxiosRequestConfig, AxiosRequestHeaders } from 'axios'
import type { AuthTokens } from '@/types'
import { useAuthStore } from '@/store/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

type RetriableConfig = AxiosRequestConfig & { _retry?: boolean }

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    const { tokens, setSession, logout } = useAuthStore.getState()
    if (!tokens?.refresh_token) {
      logout()
      throw new Error('Missing refresh token')
    }
    refreshPromise = axios
      .post<AuthTokens>(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: tokens.refresh_token,
      })
      .then((response) => {
        setSession(response.data)
        return response.data.access_token
      })
      .catch((error) => {
        logout()
        throw error
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().tokens?.access_token
  if (token) {
    const headers = (config.headers ?? {}) as AxiosRequestHeaders
    headers.Authorization = `Bearer ${token}`
    config.headers = headers
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const { logout } = useAuthStore.getState()
    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const originalRequest = error.config as RetriableConfig
    if (originalRequest._retry) {
      logout()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const newToken = await refreshAccessToken()
      const headers = (originalRequest.headers ?? {}) as AxiosRequestHeaders
      headers.Authorization = `Bearer ${newToken}`
      originalRequest.headers = headers
      return apiClient(originalRequest)
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  },
)

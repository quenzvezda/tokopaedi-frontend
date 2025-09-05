import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios'
import tokenStorage from '../features/auth/storage'

const baseURL = import.meta.env.VITE_GATEWAY_BASE || 'http://localhost:8080'
const refreshPath = import.meta.env.VITE_AUTH_REFRESH_PATH || '/auth/api/v1/auth/refresh'

export const http: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

http.interceptors.request.use((config) => {
  const token = tokenStorage.access
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshing: Promise<string | null> | null = null

async function refreshToken(): Promise<string | null> {
  const currentRefresh = tokenStorage.refresh
  if (!currentRefresh) return null
  const response = await axios.post(
    baseURL + refreshPath,
    { refreshToken: currentRefresh },
    { headers: { 'Content-Type': 'application/json' } },
  )
  const nextAccess = (response.data as any)?.accessToken ?? null
  const nextRefresh = (response.data as any)?.refreshToken ?? currentRefresh
  tokenStorage.access = nextAccess
  tokenStorage.refresh = nextRefresh
  return nextAccess
}

http.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true
      try {
        refreshing = refreshing ?? refreshToken()
        const newAccess = await refreshing
        refreshing = null
        if (newAccess) {
          original.headers = original.headers || {}
          original.headers.Authorization = `Bearer ${newAccess}`
          return http(original)
        }
      } catch (e) {
        refreshing = null
      }
      tokenStorage.clear()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default http

import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosRequestHeaders,
} from 'axios'

// Prefer VITE_API_BASE_URL; fall back to existing names for compatibility
const baseURL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_GATEWAY_BASE || 'http://localhost:8080'
const refreshPath = import.meta.env.VITE_AUTH_REFRESH_PATH || '/auth/api/v1/auth/refresh'

export const http: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: !import.meta.env.VITEST,
})

let accessTokenGetter: (() => string | null) | null = null
let accessTokenSetter: ((t: string | null) => void) | null = null
let onAuthLogout: (() => void) | null = null
let refreshing: Promise<string | null> | null = null

export function setAccessTokenGetter(fn: () => string | null) {
  accessTokenGetter = fn
}

export function setAccessTokenSetter(fn: (t: string | null) => void) {
  accessTokenSetter = fn
}

export function setOnAuthLogout(fn: () => void) {
  onAuthLogout = fn
}

http.interceptors.request.use((config) => {
  const token = accessTokenGetter?.() || null
  if (token) {
    config.headers = (config.headers || {}) as AxiosRequestHeaders
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

async function refreshToken(): Promise<string | null> {
  const response = await axios.post<{ accessToken?: string }>(
    baseURL + refreshPath,
    {},
    { headers: { 'Content-Type': 'application/json' }, withCredentials: true },
  )
  const nextAccess = response.data?.accessToken ?? null
  if (accessTokenSetter) accessTokenSetter(nextAccess)
  return nextAccess
}

export async function triggerRefresh() {
  return refreshToken()
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
          original.headers = (original.headers || {}) as AxiosRequestHeaders
          ;(original.headers as AxiosRequestHeaders).Authorization = `Bearer ${newAccess}`
          return http(original)
        }
      } catch {
        refreshing = null
      }
      if (onAuthLogout) onAuthLogout()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default http

// Error normalization helpers
export type ApiError = { code?: string; message: string }

export function toApiError(err: unknown): ApiError {
  const ax = err as AxiosError<{ code?: string; message?: string }>
  const message = ax.response?.data?.message || ax.message || 'Unknown error'
  const code = ax.response?.data?.code
  return { code, message }
}

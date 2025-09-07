// @/shared/lib/fetcher.ts
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosRequestHeaders,
} from 'axios'

const baseURL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_GATEWAY_BASE || 'http://localhost:8080'
const refreshPath = '/auth/api/v1/refresh'

export const http: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
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

// ==== AUTH SKIP RULES (GET publik & endpoint auth) ====
const PUBLIC_GET_PATHS = [
  /^\/catalog\/api\/v1\/products$/, // listing produk publik
  /^\/catalog\/api\/v1\/categories$/,
  /^\/catalog\/api\/v1\/brands$/,
  /^\/\.well-known\/jwks\.json$/,
]

const AUTH_PATHS = [
  /^\/auth\/api\/v1\/login$/,
  /^\/auth\/api\/v1\/register$/,
  /^\/auth\/api\/v1\/refresh$/,
  /^\/auth\/api\/v1\/logout$/,
]

function pathOf(url?: string) {
  if (!url) return ''
  // axios bisa kirim relative url; normalkan ke pathname
  try {
    return new URL(url, baseURL).pathname
  } catch {
    return url
  }
}

function isPublicGet(cfg: AxiosRequestConfig) {
  const m = (cfg.method || 'get').toUpperCase()
  const p = pathOf(cfg.url)
  return m === 'GET' && PUBLIC_GET_PATHS.some((re) => re.test(p))
}

function isAuthEndpoint(cfg: AxiosRequestConfig) {
  const p = pathOf(cfg.url)
  return AUTH_PATHS.some((re) => re.test(p))
}

// ==== REQUEST ====
http.interceptors.request.use((config) => {
  // Jangan pasang Authorization untuk GET publik & endpoint auth
  if (!isPublicGet(config) && !isAuthEndpoint(config)) {
    const token = accessTokenGetter?.() || null
    if (token) {
      config.headers = (config.headers || {}) as AxiosRequestHeaders
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// ==== REFRESH TOKEN ====
async function refreshToken(): Promise<string | null> {
  const res = await axios.post<{ accessToken?: string }>(
    baseURL + refreshPath,
    {},
    { headers: { 'Content-Type': 'application/json' }, withCredentials: true },
  )
  const next = res.data?.accessToken ?? null
  accessTokenSetter?.(next)
  return next
}

export async function triggerRefresh() {
  return refreshToken()
}

// ==== RESPONSE ====
http.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean }
    const status = error.response?.status

    // Untuk request publik atau endpoint auth → jangan refresh/redirect; biarkan error mengalir
    if (!original || status !== 401 || isPublicGet(original) || isAuthEndpoint(original)) {
      return Promise.reject(error)
    }

    if (!original._retry) {
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
      onAuthLogout?.()
      if (typeof window !== 'undefined') window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)

// ==== Errors ====
export type ApiError = { code?: string; message: string }
export function toApiError(err: unknown): ApiError {
  const ax = err as AxiosError<{ code?: string; message?: string }>
  const message = ax.response?.data?.message || ax.message || 'Unknown error'
  const code = ax.response?.data?.code
  return { code, message }
}

export default http

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_USE_MSW?: 'true' | 'false'
  readonly VITE_MSW_ACCOUNT?: 'ADMIN' | 'SELLER' | 'CUSTOMER'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

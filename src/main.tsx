import { ChakraProvider } from '@chakra-ui/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import ErrorBoundary from '@/app/providers/ErrorBoundary'
import AppQueryProvider from '@/app/providers/QueryProvider'

import './index.css'
import App from './App'

async function enableMocking() {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MSW === 'true') {
    const { worker } = await import('@/mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
    const account = import.meta.env.VITE_MSW_ACCOUNT ?? 'CUSTOMER'
    console.info(`[msw] Mocking enabled for account: ${account}`)
  }
}

const container = document.getElementById('root')
if (!container) throw new Error('Root container missing')
const root = createRoot(container)

enableMocking().finally(() => {
  root.render(
    <StrictMode>
      <ChakraProvider>
        <AppQueryProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </AppQueryProvider>
      </ChakraProvider>
    </StrictMode>,
  )
})

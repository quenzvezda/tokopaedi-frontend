import { ChakraProvider } from '@chakra-ui/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import ErrorBoundary from '@/app/providers/ErrorBoundary'
import AppQueryProvider from '@/app/providers/QueryProvider'

import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
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

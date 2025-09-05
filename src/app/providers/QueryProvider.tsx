import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { useMemo } from 'react'

export function AppQueryProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
    [],
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

export default AppQueryProvider


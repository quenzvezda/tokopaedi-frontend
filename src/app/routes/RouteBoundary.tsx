import React, { Suspense } from 'react'

import ErrorBoundary from '@/app/providers/ErrorBoundary'
import { PageSkeleton } from '@/shared/ui/PageSkeleton'

export function RouteBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
    </ErrorBoundary>
  )
}

export default RouteBoundary
